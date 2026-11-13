import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { RecommendationRefreshForm, SavePlacementButton } from "@/components/student-placement-actions";

export default async function StudentRecommendationsPage() {
  const { supabase, user } = await requireRole(["student"]);
  const { data: matches, error } = await supabase.from("recommendations").select("placement_id,match_score,skill_score,academic_score,interest_score,location_score,duration_score,explanation,calculated_at").eq("student_id", user.id).order("match_score", { ascending: false }).limit(50);
  const ids = (matches ?? []).map((match) => match.placement_id);
  const { data: placements } = ids.length ? await supabase.from("public_placements").select("id,title,organization_name,category,location,work_mode,required_skills").in("id", ids) : { data: [] };
  const placementMap = new Map((placements ?? []).map((item) => [item.id, item]));
  const visibleMatches = (matches ?? []).filter((item) => placementMap.has(item.placement_id));

  return <><div className="dashboard-page-heading"><div><div className="eyebrow">RECOMMENDED PLACEMENTS</div><h1>A more considered shortlist.</h1><p>Each score compares your profile with current published eligibility and role requirements.</p></div><RecommendationRefreshForm /></div>
    {error ? <p className="dashboard-alert">Recommendations could not be loaded.</p> : visibleMatches.length ? <div className="recommendation-page-grid">{visibleMatches.map((match) => { const placement = placementMap.get(match.placement_id)!; const explanation = match.explanation as { matched_skills?: string[]; category_match?: boolean };
      return <article className="dashboard-panel recommendation-card" key={match.placement_id}><div className="recommendation-card-top"><span className="eyebrow">MATCH SCORE</span><strong>{Math.round(match.match_score)}<small>%</small></strong></div><h2>{placement.title}</h2><p className="company-name">{placement.organization_name}</p><p className="opportunity-location">{placement.category} · {placement.location} · {placement.work_mode}</p>
        <div className="match-breakdown">{[["Skills",match.skill_score],["Academic fit",match.academic_score],["Interests",match.interest_score],["Location",match.location_score],["Duration",match.duration_score]].map(([label,value]) => <div key={String(label)}><span>{label}</span><strong>{Math.round(Number(value))}%</strong></div>)}</div>
        <p className="match-explanation">{explanation.matched_skills?.length ? `Your profile includes ${explanation.matched_skills.slice(0, 3).join(", ")}. ` : "Review the full eligibility criteria before applying. "}{explanation.category_match ? "This role also aligns with a career interest you selected." : ""}</p>
        <div className="recommendation-actions"><Link href={`/opportunities/${placement.id}`}>Review opportunity ↗</Link><SavePlacementButton placementId={placement.id} /></div>
      </article>;
    })}</div> : <div className="dashboard-panel recommendation-empty"><span className="empty-mark">✳</span><h2>No recommendations are ready yet.</h2><p>Add academic information, skills, and career interests, then calculate matches to see relevant placements.</p><div><Link href="/student/academics">Update academics</Link><Link href="/student/skills">Add skills</Link></div></div>}
  </>;
}
