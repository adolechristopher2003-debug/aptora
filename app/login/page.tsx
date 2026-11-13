import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { SignInForm } from "@/components/auth-forms";

export const instant = false;

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ password?: string; error?: string }> }) {
  const params = await searchParams;
  return <AuthShell eyebrow="WELCOME BACK" title="Sign in to Aptora." description="Pick up where you left off and keep your placement journey moving.">
    {params.password === "updated" ? <p className="form-message success auth-notice" role="status">Your password was updated. Sign in with your new password.</p> : null}
    {params.error ? <p className="form-message error auth-notice" role="alert">That sign-in link could not be verified. Request a new link and try again.</p> : null}
    <SignInForm /><p className="auth-switch">New to Aptora? <Link href="/register">Create a student account</Link></p>
  </AuthShell>;
}
