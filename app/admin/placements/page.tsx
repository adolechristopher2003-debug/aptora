import { requireRole } from "@/lib/auth/require-role";
import { PlacementDecisionForm } from "@/components/admin-forms";
import type { PlacementStatus } from "@/types/database";

export const instant = false;
type Query = string | string[] | undefined;
const allowedStatuses: PlacementStatus[] = ["draft", "pending_review", "published", "rejected", "closed", "archived"];

export default async function AdminPlacementsPage({ searchParams }: { searchParams: Promise<Record<string, Query>> }) {
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const params = await searchParams;
  const status = typeof params.status === "string" && allowedStatuses.includes(params.status as PlacementStatus) ? params.status as PlacementStatus : "pending_review";
  const { data, error } = await supabase.from("placements").select("id,employer_id,title,category,work_mode,location,status,description,required_skills,required_departments,min_cgpa,application_deadline,created_at,rejection_reason").eq("status", status).order("created_at", { ascending: true }).limit(50);
  const employerIds = [...new Set((data ?? []).map((item) => item.employer_id))];
  const { data: employers } = employerIds.length ? await supabase.from("employers").select("id,organization_name,verification_status").in("id", employerIds) : { data: [] };
  const employerMap = new Map((employers ?? []).map((item) => [item.id, item]));

  return <><div className="dashboard-page-heading"><div><div className="eyebrow">PLACEMENT APPROVAL</div><h1>Review opportunities.</h1><p>Approve only listings from verified organizations with clear and complete requirements.</p></div></div>
    <form className="dashboard-filter-form admin-filter" action="/admin/placements"><select name="status" defaultValue={status} aria-label="Filter placement status">{allowedStatuses.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select><button className="button button-dark">Filter</button></form>
    {error ? <p className="dashboard-alert">Placement queue could not be loaded.</p> : data?.length ? <div className="admin-record-list">{data.map((placement) => { const employer = employerMap.get(placement.employer_id); return <article className="dashboard-panel admin-placement-card" key={placement.id}><div className="admin-record-heading"><div><span className="eyebrow">{placement.category} · {placement.work_mode}</span><h2>{placement.title}</h2><p>{employer?.organization_name ?? "Organization unavailable"} · {placement.location}</p></div><span className={`status-badge status-${placement.status}`}>{placement.status.replaceAll("_", " ")}</span></div>
      <div className="candidate-facts"><span>Organization {employer?.verification_status ?? "unknown"}</span><span>{placement.required_skills.length ? `Required: ${placement.required_skills.join(", ")}` : "No required skills specified"}</span><span>{placement.required_departments.length ? `Departments: ${placement.required_departments.join(", ")}` : "Any department"}</span><span>Minimum CGPA {placement.min_cgpa ?? "None"}</span><span>Submitted {new Date(placement.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</span></div>
      {placement.rejection_reason ? <p className="admin-placement-description">Previous review: {placement.rejection_reason}</p> : null}<details className="admin-placement-details"><summary>Read role description</summary><p>{placement.description}</p></details>
      {placement.status === "pending_review" ? <PlacementDecisionForm placementId={placement.id} /> : null}
    </article>; })}</div> : <div className="dashboard-panel recommendation-empty"><span className="empty-mark">✓</span><h2>No placements in this queue.</h2><p>Submitted employer drafts will appear here for review.</p></div>}
  </>;
}
