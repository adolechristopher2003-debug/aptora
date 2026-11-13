import { requireRole } from "@/lib/auth/require-role";
import { EmployerProfileForm } from "@/components/employer-forms";

export default async function EmployerProfilePage() {
  const { supabase, user } = await requireRole(["employer"]);
  const { data, error } = await supabase.from("employers").select("*").eq("id", user.id).maybeSingle();
  return <><div className="dashboard-page-heading"><div><div className="eyebrow">ORGANIZATION PROFILE</div><h1>Make your organization clear.</h1><p>Keep your contact and organization information current for the verification process.</p></div></div>
    {error || !data ? <p className="dashboard-alert">Organization information could not be loaded.</p> : <div className="dashboard-panel form-panel"><EmployerProfileForm employer={data} /></div>}
  </>;
}
