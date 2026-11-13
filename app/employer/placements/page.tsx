import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";

export default async function EmployerPlacementsPage() {
  const { supabase, user } = await requireRole(["employer"]);
  const { data, error } = await supabase.from("placements").select("id,title,category,work_mode,location,status,application_deadline,created_at").eq("employer_id", user.id).order("created_at", { ascending: false });
  return <><div className="dashboard-page-heading"><div><div className="eyebrow">PLACEMENT MANAGEMENT</div><h1>Your opportunities.</h1><p>Create drafts, submit them for review, and track publishing status.</p></div><Link className="button button-blue" href="/employer/placements/new">Create placement <span>↗</span></Link></div>
    {error ? <p className="dashboard-alert">Placements could not be loaded.</p> : data?.length ? <div className="dashboard-panel"><div className="placement-table">{data.map((placement) => <Link className="placement-row" href={`/employer/placements/${placement.id}`} key={placement.id}><span><strong>{placement.title}</strong><small>{placement.category} · {placement.location} · {placement.work_mode}</small></span>{placement.application_deadline ? <time>{new Date(placement.application_deadline).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</time> : <time>No deadline</time>}<span className={`status-badge status-${placement.status}`}>{placement.status.replaceAll("_", " ")}</span><span className="placement-chevron">→</span></Link>)}</div></div> : <div className="dashboard-panel recommendation-empty"><span className="empty-mark">○</span><h2>No placements yet.</h2><p>Start with a draft. Publishing will be available after organization verification and administrative approval.</p><Link href="/employer/placements/new">Create your first draft ↗</Link></div>}
  </>;
}
