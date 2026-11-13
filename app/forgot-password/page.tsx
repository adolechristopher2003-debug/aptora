import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { PasswordResetRequestForm } from "@/components/auth-forms";

export default function ForgotPasswordPage() {
  return <AuthShell eyebrow="ACCOUNT RECOVERY" title="Let’s get you back in." description="Enter your account email. If it matches an Aptora account, we’ll send a secure reset link.">
    <div className="auth-card-heading"><span className="public-number">PASSWORD RESET</span><h2>Request a reset link</h2></div>
    <PasswordResetRequestForm /><p className="auth-switch"><Link href="/login">Back to sign in</Link></p>
  </AuthShell>;
}
