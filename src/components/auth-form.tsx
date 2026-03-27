import { signInAction, signInWithGoogleAction, signUpAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const isSignIn = mode === "signin";

  return (
    <div className="stack-lg">
      {isSignIn ? (
        <>
          <form action={signInWithGoogleAction}>
            <SubmitButton className="oauth-button" pendingLabel="Redirecting...">
              Continue with Google
            </SubmitButton>
          </form>
          <div className="divider">
            <span>or use email</span>
          </div>
        </>
      ) : null}

      <form action={isSignIn ? signInAction : signUpAction} className="stack-lg">
        <label className="field">
          <span>Email</span>
          <input name="email" placeholder="you@example.com" required type="email" />
        </label>
        <label className="field">
          <span>Password</span>
          <input minLength={6} name="password" required type="password" />
        </label>
        <SubmitButton pendingLabel={isSignIn ? "Signing in..." : "Creating account..."}>
          {isSignIn ? "Sign In" : "Create Account"}
        </SubmitButton>
      </form>
    </div>
  );
}
