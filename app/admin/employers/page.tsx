import { requireRole } from "@/lib/auth/require-role";
import { UserRoleForm, UserStatusForm } from "@/components/admin-forms";

export const instant = false;
type Query = string | string[] | undefined;

export default async function AdminEmployersPage({ searchParams }: { searchParams: Promise<Record<string, Query>> }) {
  const { supabase, profile } = await requireRole(["admin", "super_admin"]);
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const filter = typeof params.status === "string" ? params.status : "";
  const page = Math.min(10000, Math.max(1, Number(params.page) || 1));
  let query = supabase.from("employers").select("id,organization_name,organization_email,organization_phone,verification_status,city,state,created_at").order("created_at", { ascending: false }).range((page-1)*50,page*50-1);
  if (["pending", "under_review", "approved", "rejected", "suspended"].includes(filter)) query = query.eq("verification_status", filter as "approved");
  if (search) query = query.ilike("organization_name", `%${search}%`);
  const { data: employers, error } = await query;
  const ids = (employers ?? []).map((item) => item.id);
  const { data: profiles } = ids.length ? await supabase.from("profiles").select("id,full_name,email,status,role").in("id", ids) : { data: [] };
  const profileMap = new Map((profiles ?? []).map((item) => [item.id, item]));
  const canChangeRoles = profile.role === "super_admin";
  return <><div className="dashboard-page-heading"><div><div className="eyebrow">EMPLOYER ACCOUNTS</div><h1>Organizations on Aptora.</h1><p>Review verification state and maintain account integrity.</p></div></div>
    <form className="dashboard-filter-form admin-filter" action="/admin/employers"><input name="q" defaultValue={search} placeholder="Search organizations" aria-label="Search organizations"/><select name="status" defaultValue={filter} aria-label="Filter verification"><option value="">All verification statuses</option>{["pending","under_review","approved","rejected","suspended"].map((item)=><option key={item} value={item}>{item.replaceAll("_"," ")}</option>)}</select><button className="button button-dark">Filter</button></form>
    {error ? <p className="dashboard-alert">Employer records could not be loaded.</p> : employers?.length ? <div className="dashboard-panel admin-user-list">{employers.map((employer) => { const account=profileMap.get(employer.id); return <article className="admin-user-row" key={employer.id}><span className="list-avatar">{employer.organization_name.slice(0,1).toUpperCase()}</span><span className="admin-user-main"><strong>{employer.organization_name}</strong><small>{account?.full_name ?? "Contact unavailable"} · {employer.organization_email}</small><small>{employer.city ?? ""}{employer.state ? `, ${employer.state}` : ""} · {employer.organization_phone ?? "No phone"}</small></span><span className={`status-badge status-${employer.verification_status}`}>{employer.verification_status.replaceAll("_"," ")}</span><span className={`status-badge status-${account?.status ?? "deleted"}`}>{account?.status ?? "deleted"}</span><UserStatusForm userId={employer.id} status={account?.status ?? "active"}/>{canChangeRoles && account ? <UserRoleForm userId={employer.id} role={account.role}/> : null}</article>; })}</div> : <div className="dashboard-panel recommendation-empty"><h2>No organizations match.</h2><p>Try another filter or search term.</p></div>}
    <nav className="opportunity-pagination" aria-label="Employer account pages">{page>1?<a href={`/admin/employers?q=${encodeURIComponent(search)}&status=${filter}&page=${page-1}`}>← Previous</a>:<span/>}<span>Page {page}</span>{employers?.length===50?<a href={`/admin/employers?q=${encodeURIComponent(search)}&status=${filter}&page=${page+1}`}>Next →</a>:<span/>}</nav>
  </>;
}
