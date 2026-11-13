import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";

export default async function AdminDashboardPage() {
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const [students, employers, pendingEmployers, placements, pendingPlacements, applications, contactMessages] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("employers").select("id", { count: "exact", head: true }).eq("verification_status", "approved"),
    supabase.from("employers").select("id", { count: "exact", head: true }).in("verification_status", ["pending", "under_review"]),
    supabase.from("placements").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("placements").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
    supabase.from("applications").select("id", { count: "exact", head: true }),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);
  const failed = [students, employers, pendingEmployers, placements, pendingPlacements, applications, contactMessages].some((query) => query.error);
  const value = (query: { count: number | null; error: unknown }) => query.error ? "—" : query.count ?? 0;
  return <><div className="dashboard-page-heading"><div><div className="eyebrow">ADMINISTRATION</div><h1>Platform oversight.</h1><p>Review organizations and opportunities, and monitor placement activity.</p></div></div>
    {failed ? <p className="dashboard-alert">Some administrative counts could not be loaded.</p> : null}
    <section className="dashboard-stats"><Stat label="Students" value={value(students)} note="registered profiles"/><Stat label="Verified employers" value={value(employers)} note="approved organizations"/><Stat label="Published placements" value={value(placements)} note="currently public"/><Stat label="Applications" value={value(applications)} note="all placement applications"/></section>
    <div className="admin-queue-grid"><Queue href="/admin/verifications" label="EMPLOYER VERIFICATION" title="Review organizations" count={value(pendingEmployers)} note="pending or under review"/><Queue href="/admin/placements?status=pending_review" label="PLACEMENT APPROVAL" title="Review placements" count={value(pendingPlacements)} note="awaiting approval"/><Queue href="/admin/messages" label="CONTACT MESSAGES" title="Respond to inquiries" count={value(contactMessages)} note="new messages"/></div>
    <section className="dashboard-panel admin-shortcuts"><div className="eyebrow">ADMIN TOOLS</div><div>{[["Students","/admin/students"],["Employers","/admin/employers"],["Applications","/admin/applications"],["Audit log","/admin/audit-logs"],["Analytics","/admin/analytics"]].map(([label,href])=><Link href={href} key={href}>{label}<span>↗</span></Link>)}</div></section>
  </>;
}

function Stat({ label, value, note }: { label: string; value: string | number; note: string }) { return <article className="dashboard-stat"><span>{label}</span><strong>{value}</strong><small>{note}</small></article>; }
function Queue({ href,label,title,count,note }: { href:string; label:string; title:string; count:string|number; note:string }) { return <Link className="dashboard-panel admin-queue" href={href}><span className="eyebrow">{label}</span><strong>{count}</strong><h2>{title}</h2><small>{note}</small><span className="queue-arrow">↗</span></Link>; }
