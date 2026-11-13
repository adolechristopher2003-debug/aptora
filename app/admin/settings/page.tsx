import { requireRole } from "@/lib/auth/require-role";
import { MatchingWeightsForm } from "@/components/admin-forms";

export default async function AdminSettingsPage(){
 const {supabase}=await requireRole(["admin","super_admin"]);
 const {data,error}=await supabase.from("match_settings").select("skill_weight,academic_weight,interest_weight,location_weight,duration_weight,min_recommendation_score,updated_at").eq("id",1).maybeSingle();
 return <><div className="dashboard-page-heading"><div><div className="eyebrow">SYSTEM SETTINGS</div><h1>Configure placement matching.</h1><p>Weights apply to the next recommendation calculation. Students can refresh their own recommendations.</p></div></div>
  {error||!data?<p className="dashboard-alert">Matching settings could not be loaded.</p>:<div className="dashboard-panel match-settings-panel"><MatchingWeightsForm settings={data}/><p className="settings-description">Last updated {new Date(data.updated_at).toLocaleString("en-NG",{dateStyle:"medium",timeStyle:"short",timeZone:"UTC"})} UTC.</p></div>}
 </>;
}
