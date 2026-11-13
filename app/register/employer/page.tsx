import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { EmployerSignUpForm } from "@/components/auth-forms";

export default function EmployerRegisterPage() {
  return <AuthShell eyebrow="JOIN AS AN EMPLOYER" title="Meet emerging talent." description="Create an organization account. An administrator will review your information before you can publish placement opportunities.">
    <div className="auth-card-heading"><span className="public-number">EMPLOYER ACCOUNT</span><h2>Register your organization</h2></div>
    <EmployerSignUpForm /><p className="auth-switch">Looking for a placement? <Link href="/register">Create a student account</Link></p>
  </AuthShell>;
}
