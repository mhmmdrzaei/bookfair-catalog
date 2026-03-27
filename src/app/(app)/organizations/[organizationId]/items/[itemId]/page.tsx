import Link from "next/link";
import { ItemActions } from "@/components/item-actions";
import { getItemById } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ItemDetailPage({
  params
}: {
  params: Promise<{ organizationId: string; itemId: string }>;
}) {
  const { organizationId, itemId } = await params;
  const item = await getItemById(organizationId, itemId);
  const stockMovements = [...(item.stock_movements ?? [])].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
  const sales = [...(item.sales ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <section className="page-grid">
      <Link className="ghost-button right" href={`/organizations/${organizationId}`}>
        Back to organization
      </Link>

      <div className="layout-grid">
        <section className="card stack-lg">
          {item.image_path ? (
            <img
              alt={item.title}
              className="item-image"
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-images/${item.image_path}`}
            />
          ) : (
            <div className="item-image" />
          )}

          <div className="stack">
            <span className="eyebrow">Item</span>
            <h1 className="item-title">{item.title}</h1>
            <p className="muted">{item.info || "No additional notes yet."}</p>
          </div>

          <div className="stat-grid">
            <div className="stat">
              <span className="muted">Price</span>
              <strong>{formatCurrency(item.price)}</strong>
            </div>
            <div className="stat">
              <span className="muted">Quantity</span>
              <strong>{item.quantity}</strong>
            </div>
            <div className="stat">
              <span className="muted">Last updated</span>
              <strong>{formatDate(item.updated_at)}</strong>
            </div>
          </div>

          <ItemActions itemId={itemId} organizationId={organizationId} />
        </section>

        <section className="stack-lg">
          <section className="card stack">
            <h2>Sales history</h2>
            {sales.length ? (
              <div className="list">
                {sales.map((sale) => (
                  <div className="list-row" key={sale.id}>
                    <div className="stack" style={{ gap: "4px" }}>
                      <strong>
                        {sale.payment_method} · {formatCurrency(sale.amount)}
                      </strong>
                      <span className="muted">
                        Qty {sale.quantity} {sale.account ? `· ${sale.account}` : ""}
                      </span>
                    </div>
                    <span className="muted">{formatDate(sale.created_at)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No sales recorded for this item yet.</div>
            )}
          </section>

          <section className="card stack">
            <h2>Stock history</h2>
            {stockMovements.length ? (
              <div className="list">
                {stockMovements.map((movement) => (
                  <div className="list-row" key={movement.id}>
                    <div className="stack" style={{ gap: "4px" }}>
                      <strong>{movement.delta > 0 ? `+${movement.delta}` : movement.delta}</strong>
                      <span className="muted">{movement.note || "No note"}</span>
                    </div>
                    <span className="muted">{formatDate(movement.created_at)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No stock changes logged yet.</div>
            )}
          </section>
        </section>
      </div>
    </section>
  );
}
