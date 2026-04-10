import Image from "next/image";
import Link from "next/link";
import { ItemActions } from "@/components/item-actions";
import { getItemById, getOrganizationAccounts } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

function formatSaleStockNote(sale: {
  payment_method: string;
  account: string;
  amount: string;
  quantity: number;
}, listPrice: string) {
  const parts = [`Sale: ${sale.payment_method}`];

  if (sale.account) {
    parts.push(`Account: ${sale.account}`);
  }

  const expectedAmount = Number(listPrice) * sale.quantity;
  const actualAmount = Number(sale.amount);

  if (Math.abs(actualAmount - expectedAmount) > 0.009) {
    parts.push(`OR Price: ${formatCurrency(actualAmount)}`);
  }

  return `${parts.join(", ")}${sale.quantity > 0 ? `, Qty: ${sale.quantity}` : ""}`;
}

export default async function ItemDetailPage({
  params
}: {
  params: Promise<{ organizationId: string; itemId: string }>;
}) {
  const { organizationId, itemId } = await params;
  const item = await getItemById(organizationId, itemId);
  const organizationAccounts = await getOrganizationAccounts(organizationId);
  const accountNames = organizationAccounts.map((account) => account.name);
  const stockMovements = item.stock_movements ?? [];
  const sales = item.sales ?? [];
  const saleByTimestamp = new Map(
    sales.map((sale) => [`${sale.created_at}:${sale.quantity}`, sale])
  );
  const renderedStockMovements = stockMovements.map((movement) => {
    const matchingSale =
      movement.delta < 0
        ? saleByTimestamp.get(`${movement.created_at}:${Math.abs(movement.delta)}`)
        : undefined;

    return {
      ...movement,
      renderedNote: matchingSale
        ? formatSaleStockNote(matchingSale, item.price)
        : movement.note || "No note"
    };
  });

  return (
    <section className="page-grid">
      <Link className="ghost-button right" href={`/organizations/${organizationId}`}>
        Back to event
      </Link>

      <div className="layout-grid">
        <section className="card stack-lg">
          {item.image_path ? (
            <Image
              alt={item.title}
              className="item-image"
              height={900}
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-images/${item.image_path}`}
              width={1200}
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

          <ItemActions
            accountNames={accountNames}
            itemId={itemId}
            itemPrice={item.price}
            organizationId={organizationId}
          />
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
                      {sale.profiles?.email ? (
                        <span className="muted history-actor">{sale.profiles.email}</span>
                      ) : null}
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
            {renderedStockMovements.length ? (
              <div className="list">
                {renderedStockMovements.map((movement) => (
                  <div className="list-row" key={movement.id}>
                    <div className="stack" style={{ gap: "4px" }}>
                      <strong>{movement.delta > 0 ? `+${movement.delta}` : movement.delta}</strong>
                      <span className="muted">{movement.renderedNote}</span>
                      {movement.profiles?.email ? (
                        <span className="muted history-actor">{movement.profiles.email}</span>
                      ) : null}
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
