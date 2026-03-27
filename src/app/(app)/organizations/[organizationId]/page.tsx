import Image from "next/image";
import Link from "next/link";
import { CreateItemForm } from "@/components/create-item-form";
import { InviteMemberForm } from "@/components/invite-member-form";
import { SalesModeLayout } from "@/components/sales-mode-layout";
import { getOrganizationById } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function OrganizationDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ organizationId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { organizationId } = await params;
  const query = await searchParams;
  const organization = await getOrganizationById(organizationId);
  const inventory = [...(organization.inventory_items ?? [])].sort((a, b) =>
    a.title.localeCompare(b.title)
  );
  const totalUnits = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = inventory.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  const stats = (
    <div className="stat-grid">
        <div className="stat">
          <span className="muted">Items</span>
          <strong>{inventory.length}</strong>
        </div>
        <div className="stat">
          <span className="muted">Units in stock</span>
          <strong>{totalUnits}</strong>
        </div>
        <div className="stat">
          <span className="muted">Inventory value</span>
          <strong>{formatCurrency(totalValue)}</strong>
        </div>
      </div>
  );

  const adminPanels = (
    <div className="layout-grid">
        <section className="card stack-lg">
          <div className="stack">
            <h2>Add inventory item</h2>
            <p className="muted">
              Upload a photo from desktop or phone, add notes, set price, and load initial quantity.
            </p>
          </div>
          {query.error ? <p className="error-text">{query.error}</p> : null}
          <CreateItemForm organizationId={organizationId} />
        </section>

        <section className="stack-lg">
          <section className="card stack-lg">
            <div className="stack">
              <h2>Collaborators</h2>
              <p className="muted">Add users by email. They join automatically after signing in.</p>
            </div>
            <InviteMemberForm organizationId={organizationId} />

            <div className="list">
              {(organization.organization_members ?? []).map((member) => (
                <div className="list-row" key={member.id}>
                  <div className="stack" style={{ gap: "4px" }}>
                    <strong>{member.role === "owner" ? "Owner" : "Member"}</strong>
                    <span className="muted">Joined {formatDate(member.created_at)}</span>
                  </div>
                </div>
              ))}
              {(organization.organization_invites ?? [])
                .filter((invite) => !invite.accepted_at)
                .map((invite) => (
                  <div className="list-row" key={invite.id}>
                    <div className="stack" style={{ gap: "4px" }}>
                      <strong>{invite.email}</strong>
                      <span className="muted">Invited {formatDate(invite.created_at)}</span>
                    </div>
                    <span className="pill">Pending</span>
                  </div>
                ))}
            </div>
          </section>
        </section>
      </div>
  );

  const inventoryPanel = (
    <section className="card stack-lg">
        <div className="stack">
          <h2>Inventory</h2>
          <p className="muted">
            {`Tap any item to open its detail view, adjust stock, or add a sale.`}
          </p>
        </div>

        {inventory.length ? (
          <div className="item-grid">
            {inventory.map((item) => (
              <Link
                className="item-card"
                href={`/organizations/${organizationId}/items/${item.id}`}
                key={item.id}
              >
                {item.image_path ? (
                  <Image
                    alt={item.title}
                    className="item-image"
                    height={720}
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-images/${item.image_path}`}
                    width={960}
                  />
                ) : (
                  <div className="item-image" />
                )}
                <div className="stack" style={{ gap: "8px" }}>
                  <h3 className="item-title">{item.title}</h3>
                  <p className="muted">{item.info || "No additional notes yet."}</p>
                </div>
                <div className="item-meta">
                  <span className="pill">{formatCurrency(item.price)}</span>
                  <span className="muted">Qty: {item.quantity}</span>
                  <span className="muted">Updated {formatDate(item.updated_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">No items yet. Add your first title above.</div>
        )}
      </section>
  );

  return (
    <SalesModeLayout
      adminPanels={adminPanels}
      inventoryPanel={inventoryPanel}
      organizationId={organizationId}
      organizationName={organization.name}
      stats={stats}
    />
  );
}
