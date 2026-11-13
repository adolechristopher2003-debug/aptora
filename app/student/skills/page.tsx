import { requireRole } from "@/lib/auth/require-role";
import { AddSkillForm, SkillList } from "@/components/student-preference-forms";

export default async function StudentSkillsPage() {
  const { supabase, user } = await requireRole(["student"]);
  const [catalogResult, studentSkillsResult] = await Promise.all([
    supabase.from("skills").select("id,name,category").eq("is_active", true).order("category").order("name"),
    supabase.from("student_skills").select("skill_id,proficiency").eq("student_id", user.id),
  ]);
  const skillIds = (studentSkillsResult.data ?? []).map((item) => item.skill_id);
  const namesResult = skillIds.length ? await supabase.from("skills").select("id,name,category").in("id", skillIds) : { data: [], error: null };
  const selected = new Map((studentSkillsResult.data ?? []).map((item) => [item.skill_id, item.proficiency]));
  const currentSkills = (namesResult.data ?? []).map((skill) => ({ ...skill, proficiency: selected.get(skill.id) ?? 3 }));
  const error = catalogResult.error || studentSkillsResult.error || namesResult.error;

  return <><div className="dashboard-page-heading"><div><div className="eyebrow">TECHNICAL SKILLS</div><h1>Show what you can do.</h1><p>Your skills help Aptora explain why opportunities may fit your profile.</p></div></div>
    {error ? <p className="dashboard-alert">We couldn’t load your skills. Refresh the page or contact support.</p> : <div className="skills-layout"><section className="dashboard-panel"><div className="panel-head"><div><div className="eyebrow">YOUR SKILLS</div><h2>Technologies and tools</h2></div></div><SkillList skills={currentSkills} /></section>
      <section className="dashboard-panel"><div className="eyebrow">ADD A SKILL</div><h2 className="form-section-title">Build your skills profile.</h2>{catalogResult.data?.length ? <AddSkillForm skills={catalogResult.data} /> : <p className="panel-empty">The skill catalog is empty. An administrator needs to add skills before students can select them.</p>}</section></div>}
  </>;
}
