"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data";
import type { PaymentMethod } from "@/lib/types";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getNumber(formData: FormData, key: string) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : 0;
}

export async function signInAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const email = getString(formData, "email");
  const password = getString(formData, "password");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.rpc("claim_pending_org_invites", {
    invited_email: email.toLowerCase()
  });

  redirect("/organizations");
}

export async function signUpAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const email = getString(formData, "email");
  const password = getString(formData, "password");

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/organizations");
}

export async function signInWithGoogleAction() {
  const supabase = await createSupabaseServerClient();
  const headerStore = await headers();
  const origin =
    headerStore.get("origin") ??
    (() => {
      const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
      const protocol = headerStore.get("x-forwarded-proto") ?? "http";
      return host ? `${protocol}://${host}` : "http://localhost:3000";
    })();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`
    }
  });

  if (error || !data.url) {
    redirect(
      `/login?error=${encodeURIComponent(error?.message ?? "Unable to start Google sign-in")}`
    );
  }

  redirect(data.url);
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createOrganizationAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const name = getString(formData, "name");

  if (!name) {
    redirect("/organizations?error=Event%20name%20is%20required");
  }

  await requireUser();
  const { data, error } = await supabase.rpc("create_organization_workspace", {
    org_name: name
  });

  if (error || !data) {
    redirect(
      `/organizations?error=${encodeURIComponent(error?.message ?? "Unable to create event")}`
    );
  }

  redirect(`/organizations/${data}`);
}

export async function inviteMemberAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const user = await requireUser();
  const organizationId = getString(formData, "organizationId");
  const email = getString(formData, "email").toLowerCase();

  const { error } = await supabase.from("organization_invites").insert({
    organization_id: organizationId,
    email,
    invited_by: user.id,
    accepted_at: null
  });

  if (error) {
    redirect(`/organizations/${organizationId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/organizations/${organizationId}`);
}

export async function createItemAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const user = await requireUser();
  const organizationId = getString(formData, "organizationId");
  const title = getString(formData, "title");
  const info = getString(formData, "info");
  const imagePath = getString(formData, "imagePath") || null;
  const price = getNumber(formData, "price");
  const quantity = Math.max(0, Math.floor(getNumber(formData, "quantity")));

  if (!title) {
    return { error: "Title is required." };
  }

  const { data, error } = await supabase
    .from("inventory_items")
    .insert({
      organization_id: organizationId,
      title,
      info,
      image_path: imagePath,
      price,
      quantity,
      created_by: user.id
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Unable to create item." };
  }

  if (quantity > 0) {
    const { error: movementError } = await supabase.from("stock_movements").insert({
      organization_id: organizationId,
      item_id: data.id,
      delta: quantity,
      note: "Initial stock",
      created_by: user.id
    });

    if (movementError) {
      return { error: movementError.message };
    }
  }

  revalidatePath(`/organizations/${organizationId}`);
  return { success: true };
}

export async function updateStockAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  await requireUser();
  const organizationId = getString(formData, "organizationId");
  const itemId = getString(formData, "itemId");
  const delta = Math.trunc(getNumber(formData, "delta"));
  const note = getString(formData, "note");

  if (!delta) {
    return { error: "Enter a stock change value." };
  }

  const { error } = await supabase.rpc("adjust_inventory_stock", {
    org_id: organizationId,
    inventory_item_id: itemId,
    change_delta: delta,
    change_note: note
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/organizations/${organizationId}/items/${itemId}`);
  revalidatePath(`/organizations/${organizationId}`);
  return { success: true };
}

export async function addSaleAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  await requireUser();
  const organizationId = getString(formData, "organizationId");
  const itemId = getString(formData, "itemId");
  const paymentMethod = getString(formData, "paymentMethod") as PaymentMethod;
  const account = getString(formData, "account");
  const amountOverride = getString(formData, "amountOverride");
  const quantity = Math.max(1, Math.floor(getNumber(formData, "quantity")));

  const parsedOverride = amountOverride ? Number(amountOverride) : null;
  if (parsedOverride !== null && (!Number.isFinite(parsedOverride) || parsedOverride < 0)) {
    return { error: "Amount override must be a valid positive number." };
  }

  const { error } = await supabase.rpc("record_inventory_sale", {
    org_id: organizationId,
    inventory_item_id: itemId,
    sale_payment_method: paymentMethod,
    sale_account: account,
    sale_amount_override: parsedOverride,
    sale_quantity: quantity
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/organizations/${organizationId}/items/${itemId}`);
  revalidatePath(`/organizations/${organizationId}`);
  return { success: true };
}

export async function addMultiSaleAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  await requireUser();
  const organizationId = getString(formData, "organizationId");
  const paymentMethod = getString(formData, "paymentMethod") as PaymentMethod;
  const account = getString(formData, "account");
  const saleLines = getString(formData, "saleLines");

  let parsedLines: Array<{ itemId: string; quantity: number }>;
  try {
    parsedLines = JSON.parse(saleLines) as Array<{ itemId: string; quantity: number }>;
  } catch {
    return { error: "Could not read the selected items." };
  }

  const validLines = parsedLines
    .map((line) => ({
      itemId: String(line.itemId),
      quantity: Math.max(0, Math.floor(Number(line.quantity)))
    }))
    .filter((line) => line.itemId && line.quantity > 0);

  if (!validLines.length) {
    return { error: "Select at least one item with a quantity." };
  }

  const { error } = await supabase.rpc("record_multi_item_sale", {
    org_id: organizationId,
    sale_payment_method: paymentMethod,
    sale_account: account,
    sale_lines: validLines
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/organizations/${organizationId}`);
  return { success: true };
}

export async function recordAccountTransferAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  await requireUser();
  const organizationId = getString(formData, "organizationId");
  const fromAccount = getString(formData, "fromAccount");
  const toAccount = getString(formData, "toAccount");
  const paymentMethod = getString(formData, "paymentMethod") as PaymentMethod;
  const note = getString(formData, "note");
  const amount = getNumber(formData, "amount");

  if (amount <= 0) {
    return { error: "Transfer amount must be greater than zero." };
  }

  const { error } = await supabase.rpc("record_account_transfer", {
    org_id: organizationId,
    from_account_name: fromAccount,
    to_account_name: toAccount,
    transfer_payment_method: paymentMethod,
    transfer_amount: amount,
    transfer_note: note
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/organizations/${organizationId}`);
  return { success: true };
}

export async function deleteItemAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  await requireUser();
  const organizationId = getString(formData, "organizationId");
  const itemId = getString(formData, "itemId");

  const { data: item, error: itemError } = await supabase
    .from("inventory_items")
    .select("image_path")
    .eq("id", itemId)
    .eq("organization_id", organizationId)
    .single();

  if (itemError || !item) {
    redirect(`/organizations/${organizationId}?error=${encodeURIComponent("Item not found.")}`);
  }

  const { error } = await supabase
    .from("inventory_items")
    .delete()
    .eq("id", itemId)
    .eq("organization_id", organizationId);

  if (error) {
    redirect(`/organizations/${organizationId}?error=${encodeURIComponent(error.message)}`);
  }

  if (item.image_path) {
    await supabase.storage.from("item-images").remove([item.image_path]);
  }

  revalidatePath(`/organizations/${organizationId}`);
  redirect(`/organizations/${organizationId}`);
}
