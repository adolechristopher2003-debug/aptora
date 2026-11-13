import { requireRole } from "@/lib/auth/require-role";
import { StudentProfileForm } from "@/components/student-profile-forms";

export default async function StudentProfilePage() {
  const { supabase, user } = await requireRole(["student"]);
  const { data, error } = await supabase.from("profiles").select("full_name,phone,address,bio,linkedin_url,github_url,portfolio_url").eq("id", user.id).maybeSingle();
  return <><div className="dashboard-page-heading"><div><div className="eyebrow">MY PROFILE</div><h1>Tell your story.</h1><p>Share the details employers need to understand your experience and interests.</p></div></div>
    {error || !data ? <p className="dashboard-alert">Your profile could not be loaded. Refresh the page or contact support.</p> : <div className="dashboard-panel form-panel"><StudentProfileForm profile={data} /></div>}
  </>;
}
