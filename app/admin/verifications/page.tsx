import { requireRole } from "@/lib/auth/require-role";
import { EmployerDecisionForm } from "@/components/admin-forms";

export const instant = false;
type Query = string | string[] | undefined;

export default async function AdminVerificationsPage({ searchParams }: { searchParams: Promise<Record<string, Query>> }) {
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const params = await searchParams;
  const filter = typeof params.status === "string" ? params.status : "pending";
  let query = supabase.from("employers").select("id,organization_name,organization_email,organization_phone,address,website_url,description,verification_status,created_at,rejection_reason").order("created_at", { ascending: true }).limit(50);
  if (filter === "pending") query = query.in("verification_status", ["pending", "under_review"]);
  else if (["approved", "rejected", "suspended"].includes(filter)) query = query.eq("verification_status", filter as "approved");
  const { data: employers, error } = await query;
  const ids = (employers ?? []).map((employer) => employer.id);
  const [profilesResult, docsResult] = ids.length ? await Promise.all([
    supabase.from("profiles").select("id,full_name,status").in("id", ids),
    supabase.from("documents").select("id,owner_id,storage_path,original_filename,created_at").in("owner_id", ids).eq("document_type", "employer_verification").is("deleted_at", null).order("created_at", { ascending: false }),
  ]) : [{ data: [], error: null }, { data: [], error: null }];
  const ownerNames = new Map((profilesResult.data ?? []).map((profile) => [profile.id, profile.full_name]));
  const links = await Promise.all((docsResult.data ?? []).map(async (doc) => {
    const { data } = await supabase.storage.from("aptora-documents").createSignedUrl(doc.storage_path, 60);
    return [doc.id, data?.signedUrl ?? null] as const;
  }));
  const signed = new Map(links);

  return <><div className="dashboard-page-heading"><div><div className="eyebrow">EMPLOYER VERIFICATION</div><h1>Review organizations.</h1><p>Only approved organizations can have public placements.</p></div></div>
    <form className="dashboard-filter-form admin-filter" action="/admin/verifications"><select name="status" defaultValue={filter} aria-label="Filter verification status"><option value="pending">Pending review</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="suspended">Suspended</option></select><button className="button button-dark">Filter</button></form>
    {error || profilesResult.error || docsResult.error ? <p className="dashboard-alert">Verification queue could not be loaded.</p> : employers?.length ? <div className="admin-record-list">{employers.map((employer) => { const docs = (docsResult.data ?? []).filter((doc) => doc.owner_id === employer.id); return <article className="dashboard-panel admin-employer-card" key={employer.id}><div className="admin-record-heading"><span className="list-avatar">{employer.organization_name.slice(0,1).toUpperCase()}</span><div><h2>{employer.organization_name}</h2><p>{ownerNames.get(employer.id) ?? "Contact name unavailable"} · {employer.organization_email}</p></div><span className={`status-badge status-${employer.verification_status}`}>{employer.verification_status.replaceAll("_", " ")}</span></div>
      <div className="admin-employer-facts"><span>{employer.organization_phone ?? "No phone"}</span><span>{employer.address}</span><span>{employer.website_url ?? "No website"}</span></div>
      {employer.description ? <p className="admin-employer-description">{employer.description}</p> : null}
      <div className="admin-document-links"><strong>Supporting documents</strong>{docs.length ? docs.map((doc) => signed.get(doc.id) ? <a href={signed.get(doc.id)!} target="_blank" rel="noreferrer" key={doc.id}>{doc.original_filename} ↗</a> : <span key={doc.id}>{doc.original_filename} · unavailable</span>) : <span>No verification documents uploaded.</span>}</div>
      {employer.rejection_reason ? <p className="admin-review-note">Previous review note: {employer.rejection_reason}</p> : null}
      {filter === "pending" || employer.verification_status === "rejected" ? <EmployerDecisionForm employerId={employer.id} currentStatus={employer.verification_status} /> : null}
    </article>; })}</div> : <div className="dashboard-panel recommendation-empty"><span className="empty-mark">✓</span><h2>No organizations in this queue.</h2><p>New verification requests will appear here.</p></div>}
  </>;
}
