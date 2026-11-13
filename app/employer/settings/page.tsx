import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";

export default async function EmployerSettingsPage() {
  const { user } = await requireRole(["employer"]);
  return <><div className="dashboard-page-heading"><div><div className="eyebrow">ACCOUNT SETTINGS</div><h1>Manage your account.</h1><p>Update organization information and account access.</p></div></div>
    <div className="settings-stack"><section className="dashboard-panel"><h2 className="panel-title">Organization details</h2><p className="settings-description">Keep your public organization profile and contact details current.</p><Link className="button button-outline" href="/employer/profile">Edit organization profile</Link></section>
      <section className="dashboard-panel"><h2 className="panel-title">Sign-in and security</h2><p className="settings-description">Signed in as {user.email}. Request a password reset to update your account password.</p><Link className="button button-outline" href="/forgot-password">Reset password</Link></section></div>
  </>;
}
