import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";

export default async function StudentDashboardPage() {
  const { supabase, user, profile } = await requireRole(["student"]);
  const [studentResult, applicationsCount, pendingCount, acceptedCount, rejectedCount, recommendationCount, applicationsResult, recommendationsResult, deadlinesResult] = await Promise.all([
    supabase.from("students").select("department,level,cgpa,siwes_eligible,preferred_duration_weeks").eq("id", user.id).maybeSingle(),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("student_id", user.id),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("student_id", user.id).in("status", ["submitted", "under_review", "shortlisted", "interview"]),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("student_id", user.id).eq("status", "accepted"),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("student_id", user.id).eq("status", "rejected"),
    supabase.from("recommendations").select("placement_id", { count: "exact", head: true }).eq("student_id", user.id),
    supabase.from("applications").select("id,placement_id,status,submitted_at").eq("student_id", user.id).order("submitted_at", { ascending: false }).limit(5),
    supabase.from("recommendations").select("placement_id,match_score,explanation").eq("student_id", user.id).order("match_score", { ascending: false }).limit(3),
    supabase.from("public_placements").select("id,title,organization_name,location,application_deadline").not("application_deadline", "is", null).gt("application_deadline", new Date().toISOString()).order("application_deadline", { ascending: true }).limit(3),
  ]);

  const placementIds = [...new Set([...(applicationsResult.data ?? []).map((application) => application.placement_id), ...(recommendationsResult.data ?? []).map((item) => item.placement_id)])];
  const placementResult = placementIds.length ? await supabase.from("public_placements").select("id,title,organization_name,location").in("id", placementIds) : { data: [], error: null };
  const placementMap = new Map((placementResult.data ?? []).map((placement) => [placement.id, placement]));
  const completionFields = [profile.full_name, profile.phone, studentResult.data?.department, studentResult.data?.level, studentResult.data?.cgpa, studentResult.data?.siwes_eligible];
  const completion = Math.round(completionFields.filter((field) => typeof field === "boolean" || field !== null && field !== undefined && field !== "").length / completionFields.length * 100);
  const failed = [studentResult, applicationsCount, pendingCount, acceptedCount, rejectedCount, recommendationCount, applicationsResult, recommendationsResult, deadlinesResult].some((result) => result.error);
  const metric = (result: { count: number | null; error: unknown }) => result.error ? "—" : result.count ?? 0;

  return <>
    <div className="dashboard-page-heading"><div><div className="eyebrow">STUDENT OVERVIEW</div><h1>Good to see you, {profile.full_name.split(" ")[0]}.</h1><p>Your placement journey, in one clear view.</p></div><Link className="button button-blue" href="/student/opportunities">Explore placements <span aria-hidden="true">↗</span></Link></div>
    {failed ? <p className="dashboard-alert" role="status">Some dashboard information could not load. Try refreshing the page.</p> : null}
    <section className="dashboard-stats" aria-label="Application summary">
      <Stat label="Applications" value={metric(applicationsCount)} note="submitted" />
      <Stat label="In progress" value={metric(pendingCount)} note="awaiting an update" />
      <Stat label="Accepted" value={metric(acceptedCount)} note="offers received" />
      <Stat label="Recommendations" value={metric(recommendationCount)} note="eligible matches" />
    </section>
    <div className="dashboard-grid"><section className="dashboard-panel profile-completion"><div className="panel-head"><div><div className="eyebrow">YOUR PROFILE</div><h2>Make a strong first impression.</h2></div><span className="completion-score">{studentResult.error ? "—" : `${completion}%`}</span></div><p>Complete your academic and skills profile to get more relevant placement recommendations.</p><div className="completion-track"><span style={{ width: `${studentResult.error ? 0 : completion}%` }} /></div><div className="panel-link-row"><span>Profile completion</span><Link href="/student/profile">Update profile <span aria-hidden="true">→</span></Link></div></section>
      <section className="dashboard-panel"><div className="panel-head"><div><div className="eyebrow">UPCOMING DEADLINES</div><h2>Keep your next step in view.</h2></div><Link className="panel-arrow" href="/student/opportunities" aria-label="Browse opportunities">↗</Link></div>{deadlinesResult.error ? <p className="panel-empty">Deadlines are temporarily unavailable.</p> : deadlinesResult.data?.length ? <div className="dashboard-list">{deadlinesResult.data.map((item) => <Link className="deadline-item" href={`/opportunities/${item.id}`} key={item.id}><span><strong>{item.title}</strong><small>{item.organization_name} · {item.location}</small></span><time dateTime={item.application_deadline!}>{new Date(item.application_deadline!).toLocaleDateString("en-NG", { day: "numeric", month: "short", timeZone: "UTC" })}</time></Link>)}</div> : <p className="panel-empty">There are no upcoming public deadlines right now.</p>}</section>
      <section className="dashboard-panel dashboard-wide"><div className="panel-head"><div><div className="eyebrow">RECENT APPLICATIONS</div><h2>Keep track of your progress.</h2></div><Link className="panel-link" href="/student/applications">View all <span aria-hidden="true">→</span></Link></div>{applicationsResult.error ? <p className="panel-empty">Applications could not be loaded.</p> : applicationsResult.data?.length ? <div className="dashboard-list">{applicationsResult.data.map((application) => { const placement = placementMap.get(application.placement_id); return <div className="application-item" key={application.id}><span className="list-avatar">{placement?.organization_name.slice(0, 1) ?? "A"}</span><span className="application-item-title"><strong>{placement?.title ?? "Placement"}</strong><small>{placement?.organization_name ?? "Opportunity details unavailable"} · Applied {new Date(application.submitted_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</small></span><StatusBadge status={application.status} /></div>; })}</div> : <p className="panel-empty">You haven’t applied to a placement yet. Find a role that fits your goals.</p>}</section>
      <section className="dashboard-panel dashboard-wide"><div className="panel-head"><div><div className="eyebrow">RECOMMENDED FOR YOU</div><h2>Roles that may fit your profile.</h2></div><Link className="panel-link" href="/student/recommendations">See recommendations <span aria-hidden="true">→</span></Link></div>{recommendationsResult.error ? <p className="panel-empty">Recommendations could not be loaded.</p> : recommendationsResult.data?.length ? <div className="recommendation-row">{recommendationsResult.data.map((item) => { const placement = placementMap.get(item.placement_id); return <Link className="recommendation-mini" href={`/opportunities/${item.placement_id}`} key={item.placement_id}><span className="recommendation-score">{Math.round(item.match_score)}<small>%</small></span><strong>{placement?.title ?? "Placement"}</strong><small>{placement?.organization_name ?? "Opportunity details unavailable"}</small></Link>; })}</div> : <p className="panel-empty">Recommendations will show here once your skills and interests are in place. <Link href="/student/skills">Add skills →</Link></p>}</section>
    </div>
  </>;
}

function Stat({ label, value, note }: { label: string; value: number | string; note: string }) { return <article className="dashboard-stat"><span>{label}</span><strong>{value}</strong><small>{note}</small></article>; }
function StatusBadge({ status }: { status: string }) { return <span className={`status-badge status-${status}`}>{status.replaceAll("_", " ")}</span>; }
