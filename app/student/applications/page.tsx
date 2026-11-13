import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { withdrawApplication } from "@/actions/student";

export default async function StudentApplicationsPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { supabase, user } = await requireRole(["student"]);
  const { state } = await searchParams;
  const { data: applications, error } = await supabase.from("applications").select("id,placement_id,status,submitted_at,reviewed_at").eq("student_id", user.id).order("submitted_at", { ascending: false });
  const ids = (applications ?? []).map((application) => application.placement_id);
  const { data: placements } = ids.length ? await supabase.from("public_placements").select("id,title,organization_name,location").in("id", ids) : { data: [] };
  const placementMap = new Map((placements ?? []).map((item) => [item.id, item]));
  return <><div className="dashboard-page-heading"><div><div className="eyebrow">MY APPLICATIONS</div><h1>Your progress, at a glance.</h1><p>Follow each application and see when an employer has reviewed it.</p></div><Link href="/student/opportunities" className="button button-blue">Find placements <span>↗</span></Link></div>
    {state === "applied" ? <p className="form-message success" role="status">Your application was submitted.</p> : null}
    {error ? <p className="dashboard-alert">Applications could not be loaded.</p> : applications?.length ? <div className="dashboard-panel"><div className="application-table">{applications.map((application) => { const placement = placementMap.get(application.placement_id); const canWithdraw = ["submitted", "under_review", "shortlisted", "interview"].includes(application.status); return <article className="application-row" key={application.id}><span className="list-avatar">{placement?.organization_name.slice(0, 1) ?? "A"}</span><div className="application-row-main"><strong>{placement?.title ?? "Placement"}</strong><small>{placement?.organization_name ?? "This placement is no longer publicly listed"}{placement ? ` · ${placement.location}` : ""}</small><small>Applied {new Date(application.submitted_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</small></div><span className={`status-badge status-${application.status}`}>{application.status.replaceAll("_", " ")}</span>{canWithdraw ? <form action={withdrawApplication}><input type="hidden" name="applicationId" value={application.id} /><button className="text-action">Withdraw</button></form> : null}</article>; })}</div></div> : <div className="dashboard-panel recommendation-empty"><span className="empty-mark">○</span><h2>No applications yet.</h2><p>Explore verified opportunities and apply to roles that fit your goals.</p><Link href="/student/opportunities">Explore placements ↗</Link></div>}
  </>;
}
