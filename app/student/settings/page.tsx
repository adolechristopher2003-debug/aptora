import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { updateStudentVisibility } from "@/actions/student";

export default async function StudentSettingsPage() {
  const { supabase, user } = await requireRole(["student"]);
  const { data, error } = await supabase.from("students").select("profile_visibility").eq("id", user.id).maybeSingle();
  return <><div className="dashboard-page-heading"><div><div className="eyebrow">SETTINGS</div><h1>Your account, your choices.</h1><p>Manage your saved profile preference and account access.</p></div></div>
    {error || !data ? <p className="dashboard-alert">Settings could not be loaded.</p> : <div className="settings-stack"><section className="dashboard-panel"><div className="eyebrow">PROFILE DISCOVERY</div><h2 className="form-section-title">Set your profile visibility preference.</h2><p className="settings-description">This preference is stored for future employer discovery. Public placement browsing remains available, and application records are shared with employers only when you apply.</p><form className="visibility-form" action={updateStudentVisibility}><label htmlFor="profileVisibility">Profile visibility</label><select id="profileVisibility" name="profileVisibility" defaultValue={data.profile_visibility ? "public" : "private"}><option value="public">Visible in placement workflows</option><option value="private">Private</option></select><button className="button button-blue">Save preference <span>↗</span></button></form></section>
      <section className="dashboard-panel"><div className="eyebrow">PASSWORD AND SECURITY</div><h2 className="form-section-title">Keep your account secure.</h2><p className="settings-description">Change your password through the secure email recovery flow.</p><Link className="button button-outline" href="/forgot-password">Request password reset <span>↗</span></Link></section>
    </div>}
  </>;
}
