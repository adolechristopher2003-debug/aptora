import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";

export const instant = false;

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ verified?: string }> }) {
  const { verified } = await searchParams;
  return <AuthShell eyebrow="EMAIL VERIFICATION" title={verified === "1" ? "Your email is verified." : "Check your inbox."} description={verified === "1" ? "Your address has been confirmed. Sign in to continue your placement journey." : "We sent a verification link to the email address you provided. Open it to verify your account before signing in."}>
    <div className="verify-mark" aria-hidden="true">{verified === "1" ? "✓" : "✉"}</div>
    <Link className="button button-blue auth-submit verify-action" href="/login">Continue to sign in <span aria-hidden="true">↗</span></Link>
  </AuthShell>;
}
