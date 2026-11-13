import { requireRole } from "@/lib/auth/require-role";
import { StudentAcademicForm } from "@/components/student-profile-forms";

export default async function StudentAcademicsPage() {
  const { supabase, user } = await requireRole(["student"]);
  const { data, error } = await supabase.from("students").select("matric_number,faculty,department,course_of_study,level,cgpa,graduation_year,siwes_eligible,preferred_duration_weeks").eq("id", user.id).maybeSingle();
  return <><div className="dashboard-page-heading"><div><div className="eyebrow">ACADEMIC INFORMATION</div><h1>Your academic foundation.</h1><p>Accurate academic details help the platform check placement eligibility.</p></div></div>
    {error || !data ? <p className="dashboard-alert">Academic information could not be loaded. Refresh the page or contact support.</p> : <div className="dashboard-panel form-panel"><StudentAcademicForm student={data} /></div>}
  </>;
}
