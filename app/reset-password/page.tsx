import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { SetNewPasswordForm } from "@/components/auth-forms";

export default function ResetPasswordPage() {
  return <AuthShell eyebrow="CHOOSE A NEW PASSWORD" title="A fresh start." description="Use the reset link from your email, then choose a new password for your Aptora account.">
    <div className="auth-card-heading"><span className="public-number">PASSWORD RESET</span><h2>Set a new password</h2></div>
    <SetNewPasswordForm /><p className="auth-switch"><Link href="/forgot-password">Request another reset link</Link></p>
  </AuthShell>;
}
