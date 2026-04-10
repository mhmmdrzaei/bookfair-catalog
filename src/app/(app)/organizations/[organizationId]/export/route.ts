import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function escapeCsv(value: string | number | null | undefined) {
  const stringValue = value == null ? "" : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, "\"\"")}"`;
  }

  return stringValue;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const [{ data: sales }, { data: transfers }, { data: items }] =
    await Promise.all([
      supabase
        .from("sales")
        .select("id, item_id, payment_method, account, amount, quantity, created_at, created_by")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false }),
      supabase
        .from("account_transfers")
        .select(
          "id, from_account_snapshot, to_account_snapshot, payment_method, amount, note, created_at, created_by"
        )
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false }),
      supabase
        .from("inventory_items")
        .select("id, title")
        .eq("organization_id", organizationId)
    ]);

  const actorIds = Array.from(
    new Set([
      ...(sales ?? []).map((sale) => sale.created_by),
      ...(transfers ?? []).map((transfer) => transfer.created_by)
    ])
  );
  const { data: profiles } = actorIds.length
    ? await supabase.from("profiles").select("id, email").in("id", actorIds)
    : { data: [] };

  const itemMap = new Map((items ?? []).map((item) => [item.id, item.title]));
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile.email]));

  const rows = [
    [
      "type",
      "timestamp",
      "item_title",
      "quantity",
      "amount",
      "payment_method",
      "account",
      "from_account",
      "to_account",
      "note",
      "actor_email",
      "group_id"
    ].join(","),
    ...(sales ?? []).map((sale) =>
      [
        "sale",
        sale.created_at,
        itemMap.get(sale.item_id) ?? "",
        sale.quantity,
        sale.amount,
        sale.payment_method,
        sale.account,
        "",
        "",
        "",
        profileMap.get(sale.created_by) ?? "",
        ""
      ]
        .map(escapeCsv)
        .join(",")
    ),
    ...(transfers ?? []).map((transfer) =>
      [
        "transfer",
        transfer.created_at,
        "",
        "",
        transfer.amount,
        transfer.payment_method,
        "",
        transfer.from_account_snapshot,
        transfer.to_account_snapshot,
        transfer.note,
        profileMap.get(transfer.created_by) ?? "",
        ""
      ]
        .map(escapeCsv)
        .join(",")
    )
  ].join("\n");

  return new NextResponse(rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="organization-${organizationId}-activity.csv"`
    }
  });
}
