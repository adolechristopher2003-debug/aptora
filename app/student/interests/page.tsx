import { requireRole } from "@/lib/auth/require-role";
import { AddInterestForm, InterestList } from "@/components/student-preference-forms";

export default async function StudentInterestsPage() {
  const { supabase, user } = await requireRole(["student"]);
  const { data, error } = await supabase.from("student_interests").select("category,priority").eq("student_id", user.id).order("priority", { ascending: false });
  return <><div className="dashboard-page-heading"><div><div className="eyebrow">CAREER INTERESTS</div><h1>Choose what moves you.</h1><p>Tell the matcher what areas of technology you want to explore.</p></div></div>
    {error ? <p className="dashboard-alert">Career interests could not be loaded. Refresh the page or contact support.</p> : <div className="skills-layout"><section className="dashboard-panel"><div className="panel-head"><div><div className="eyebrow">YOUR INTERESTS</div><h2>Areas you want to explore</h2></div></div><InterestList interests={data ?? []} /></section>
      <section className="dashboard-panel"><div className="eyebrow">ADD AN INTEREST</div><h2 className="form-section-title">Set a direction.</h2><AddInterestForm /></section></div>}
  </>;
}
