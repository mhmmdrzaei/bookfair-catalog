import Link from "next/link";
import { signOutAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { claimPendingInvites, requireUser } from "@/lib/data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  await claimPendingInvites();

  return (
    <main className="shell">
      <header className="topbar">
        <div className="stack" style={{ gap: "4px" }}>
          <Link href="/organizations">
            <span className="eyebrow">Catalogue Collection</span>
          </Link>
          <strong>{user.email}</strong>
        </div>
        <nav>
          <Link className="ghost-button" href="/organizations">
            Organizations
          </Link>
          <form action={signOutAction}>
            <SubmitButton className="ghost-button" pendingLabel="Signing out...">
              Sign out
            </SubmitButton>
          </form>
        </nav>
      </header>
      {children}
    </main>
  );
}
