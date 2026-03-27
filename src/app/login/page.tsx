import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ mode?: string; error?: string }>;
}) {
  const params = await searchParams;
  const mode = params.mode === "signup" ? "signup" : "signin";

  return (
    <main className="auth-shell">
      <section className="card auth-card stack-lg">
        <div className="stack">
          <span className="eyebrow">Catalogue Collection</span>
          <h1>Book Fair Inventory Manager by Mohammad</h1>
          <p className="muted">
          Sign In I dare you.
          </p>
          <p className="muted">Use Google for quick sign-in or fall back to email and password.</p>
        </div>

        <div className="tabs">
          <Link className={`tab ${mode === "signin" ? "active" : ""}`} href="/login?mode=signin">
            Sign in
          </Link>
          <Link className={`tab ${mode === "signup" ? "active" : ""}`} href="/login?mode=signup">
            Create account
          </Link>
        </div>

        {params.error ? <p className="error-text">{params.error}</p> : null}
        <AuthForm mode={mode} />
      </section>
    </main>
  );
}
