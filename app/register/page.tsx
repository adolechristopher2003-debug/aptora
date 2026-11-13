import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { StudentSignUpForm } from "@/components/auth-forms";

export default function RegisterPage() {
  return <AuthShell eyebrow="START YOUR JOURNEY" title="Make your next move." description="Create a student profile to explore relevant technology placements and keep your applications in view.">
    <div className="auth-card-heading"><span className="public-number">STUDENT ACCOUNT</span><h2>Create your profile</h2></div>
    <StudentSignUpForm /><p className="auth-switch">Registering as an organization? <Link href="/register/employer">Create an employer account</Link></p>
  </AuthShell>;
}
