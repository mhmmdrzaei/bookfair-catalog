import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function claimPendingInvites() {
  const supabase = await createSupabaseServerClient();
  const user = await requireUser();

  if (!user.email) {
    return;
  }

  await supabase.rpc("claim_pending_org_invites", {
    invited_email: user.email.toLowerCase()
  });
}

export async function getOrganizations() {
  const supabase = await createSupabaseServerClient();
  const user = await requireUser();
  await claimPendingInvites();

  const { data, error } = await supabase
    .from("organization_members")
    .select(
      `
        created_at,
        organizations!inner (
          id,
          name,
          created_at
        )
      `
    )
    .eq("user_id", user.id)
    .order("created_at", { referencedTable: "organizations", ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => row.organizations);
}

export async function getOrganizationById(organizationId: string) {
  const supabase = await createSupabaseServerClient();
  await requireUser();

  const { data, error } = await supabase
    .from("organizations")
    .select(
      `
        id,
        name,
        created_at,
        organization_members (
          id,
          role,
          created_at
        ),
        organization_invites (
          id,
          email,
          created_at,
          accepted_at
        ),
        inventory_items (
          id,
          title,
          image_path,
          info,
          price,
          quantity,
          created_at,
          updated_at
        )
      `
    )
    .eq("id", organizationId)
    .single();

  if (error || !data) {
    redirect("/organizations");
  }

  return data;
}

export async function getItemById(organizationId: string, itemId: string) {
  const supabase = await createSupabaseServerClient();
  await requireUser();

  const { data, error } = await supabase
    .from("inventory_items")
    .select(
      `
        id,
        organization_id,
        title,
        image_path,
        info,
        price,
        quantity,
        created_at,
        updated_at,
        stock_movements (
          id,
          delta,
          note,
          created_at
        ),
        sales (
          id,
          payment_method,
          account,
          amount,
          quantity,
          created_at
        )
      `
    )
    .eq("organization_id", organizationId)
    .eq("id", itemId)
    .single();

  if (error || !data) {
    redirect(`/organizations/${organizationId}`);
  }

  return data;
}
