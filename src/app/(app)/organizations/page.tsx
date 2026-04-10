import Link from "next/link";
import { CreateOrganizationForm } from "@/components/create-organization-form";
import { getOrganizations } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function OrganizationsPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const organizations = await getOrganizations();

  return (
    <section className="page-grid">
      <div className="hero">
        <span className="eyebrow">Events</span>
        <h1>Your shared event workspaces</h1>
        <p>
          Create one event per booth, seller group, or event. Everyone added to the event can work from the same live inventory list.
        </p>
      </div>

      <div className="layout-grid">
        <section className="card stack-lg">
          <div className="stack">
            <h2>Create event</h2>
            <p className="muted">Start with a name. You can invite collaborators from the next screen.</p>
          </div>
          {params.error ? <p className="error-text">{params.error}</p> : null}
          <CreateOrganizationForm />
        </section>

        <section className="card stack-lg">
          <div className="stack">
            <h2>Existing events</h2>
            <p className="muted">
              Open an event to add items, adjust stock, and record sales.
            </p>
          </div>

          {organizations.length ? (
            <div className="list">
              {organizations.map((organization) => (
                <Link
                  className="list-row"
                  href={`/organizations/${organization.id}`}
                  key={organization.id}
                >
                  <div className="stack" style={{ gap: "4px" }}>
                    <strong>{organization.name}</strong>
                    <span className="muted">Created {formatDate(organization.created_at)}</span>
                  </div>
                  <span className="pill">Open</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">No events yet. Create one to get started.</div>
          )}
        </section>
      </div>
    </section>
  );
}
