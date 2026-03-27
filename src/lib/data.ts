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

  return (data ?? []).flatMap((row) =>
    Array.isArray(row.organizations) ? row.organizations : [row.organizations]
  );
}

export async function getOrganizationById(organizationId: string) {
  const supabase = await createSupabaseServerClient();
  await requireUser();

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select(
      `
        id,
        name,
        created_at
      `
    )
    .eq("id", organizationId)
    .single();

  if (organizationError || !organization) {
    redirect("/organizations");
  }

  const [{ data: members }, { data: invites }, { data: inventoryItems }] = await Promise.all([
    supabase
      .from("organization_members")
      .select("id, user_id, role, created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true }),
    supabase
      .from("organization_invites")
      .select("id, email, created_at, accepted_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true }),
    supabase
      .from("inventory_items")
      .select("id, title, image_path, info, price, quantity, created_at, updated_at")
      .eq("organization_id", organizationId)
      .order("title", { ascending: true })
  ]);

  const userIds = (members ?? []).map((member) => member.user_id);
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, email").in("id", userIds)
    : { data: [] };

  const profilesById = new Map((profiles ?? []).map((profile) => [profile.id, profile.email]));

  return {
    ...organization,
    organization_members: (members ?? []).map((member) => ({
      ...member,
      profiles: profilesById.has(member.user_id)
        ? { email: profilesById.get(member.user_id) ?? "" }
        : null
    })),
    organization_invites: invites ?? [],
    inventory_items: inventoryItems ?? []
  };
}

export async function getItemById(organizationId: string, itemId: string) {
  const supabase = await createSupabaseServerClient();
  await requireUser();

  const { data: item, error } = await supabase
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
        updated_at
      `
    )
    .eq("organization_id", organizationId)
    .eq("id", itemId)
    .single();

  if (error || !item) {
    redirect(`/organizations/${organizationId}`);
  }

  const [{ data: stockMovements }, { data: sales }] = await Promise.all([
    supabase
      .from("stock_movements")
      .select("id, delta, note, created_at, created_by")
      .eq("organization_id", organizationId)
      .eq("item_id", itemId)
      .order("created_at", { ascending: false }),
    supabase
      .from("sales")
      .select("id, payment_method, account, amount, quantity, created_at, created_by")
      .eq("organization_id", organizationId)
      .eq("item_id", itemId)
      .order("created_at", { ascending: false })
  ]);

  const actorIds = Array.from(
    new Set([
      ...(stockMovements ?? []).map((movement) => movement.created_by),
      ...(sales ?? []).map((sale) => sale.created_by)
    ])
  );

  const { data: profiles } = actorIds.length
    ? await supabase.from("profiles").select("id, email").in("id", actorIds)
    : { data: [] };

  const profilesById = new Map((profiles ?? []).map((profile) => [profile.id, profile.email]));

  return {
    ...item,
    stock_movements: (stockMovements ?? []).map((movement) => ({
      ...movement,
      profiles: profilesById.has(movement.created_by)
        ? { email: profilesById.get(movement.created_by) ?? "" }
        : null
    })),
    sales: (sales ?? []).map((sale) => ({
      ...sale,
      profiles: profilesById.has(sale.created_by)
        ? { email: profilesById.get(sale.created_by) ?? "" }
        : null
    }))
  };
}
