import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";

export default async function EmployerDashboardPage() {
  const { supabase, user, profile } = await requireRole(["employer"]);
  const [employerResult, placementsResult, publishedCount, applicationFeed] = await Promise.all([
    supabase.from("employers").select("organization_name,verification_status,rejection_reason").eq("id", user.id).maybeSingle(),
    supabase.from("placements").select("id,title,status,created_at").eq("employer_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("placements").select("id", { count: "exact", head: true }).eq("employer_id", user.id).eq("status", "published"),
    supabase.rpc("get_employer_applications", { p_status: null }),
  ]);
  const applications = applicationFeed.data?.filter((application) => application.application_status !== "withdrawn") ?? [];
  const openStatuses = new Set(["submitted", "under_review", "shortlisted", "interview"]);
  const pendingApplications = applications.filter((application) => openStatuses.has(application.application_status)).length;
  const verification = employerResult.data?.verification_status;
  return <><div className="dashboard-page-heading"><div><div className="eyebrow">EMPLOYER OVERVIEW</div><h1>Welcome, {employerResult.data?.organization_name ?? profile.full_name}.</h1><p>Manage your organization’s verified placements and candidate conversations.</p></div><Link className="button button-blue" href="/employer/placements/new">Create placement <span>↗</span></Link></div>
    {verification !== "approved" ? <section className={`verification-banner verification-${verification ?? "pending"}`}><div><div className="eyebrow">ORGANIZATION VERIFICATION</div><h2>{verification === "rejected" ? "More information is needed." : verification === "under_review" ? "Your information is under review." : "Complete verification to publish placements."}</h2><p>{employerResult.data?.rejection_reason || "Your account can be prepared while an administrator reviews your organization information."}</p></div><Link href="/employer/verification">View verification <span>→</span></Link></section> : null}
    {placementsResult.error || applicationFeed.error ? <p className="dashboard-alert">Some employer information could not be loaded.</p> : null}
    <section className="dashboard-stats"><Stat label="Published placements" value={publishedCount.error ? "—" : publishedCount.count ?? 0} note="visible to students"/><Stat label="Applications" value={applicationFeed.error ? "—" : applications.length} note="received across roles"/><Stat label="In review" value={applicationFeed.error ? "—" : pendingApplications} note="awaiting a decision"/><Stat label="Verification" value={verification?.replaceAll("_", " ") ?? "—"} note="organization status"/></section>
    <section className="dashboard-panel"><div className="panel-head"><div><div className="eyebrow">RECENT PLACEMENTS</div><h2>Your latest roles.</h2></div><Link className="panel-link" href="/employer/placements">Manage placements →</Link></div>{placementsResult.data?.length ? <div className="dashboard-list">{placementsResult.data.map((placement) => <Link className="deadline-item" href={`/employer/placements/${placement.id}`} key={placement.id}><span><strong>{placement.title}</strong><small>Created {new Date(placement.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</small></span><span className={`status-badge status-${placement.status}`}>{placement.status.replaceAll("_", " ")}</span></Link>)}</div> : <p className="panel-empty">No placements have been created. Start a draft when your organization is ready.</p>}</section>
    <div className="employer-quick-links"><Link href="/employer/applications" className="dashboard-panel"><span className="eyebrow">CANDIDATES</span><strong>Review applications ↗</strong><small>View applicants to your placements.</small></Link><Link href="/employer/profile" className="dashboard-panel"><span className="eyebrow">ORGANIZATION</span><strong>Update your profile ↗</strong><small>Keep your organization information current.</small></Link></div>
  </>;
}

function Stat({ label, value, note }: { label: string; value: number | string; note: string }) { return <article className="dashboard-stat"><span>{label}</span><strong>{value}</strong><small>{note}</small></article>; }
