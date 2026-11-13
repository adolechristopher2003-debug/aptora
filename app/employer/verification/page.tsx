import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { EmployerVerificationUploadForm } from "@/components/employer-forms";

export default async function EmployerVerificationPage() {
  const { supabase, user } = await requireRole(["employer"]);
  const [employerResult, documentsResult] = await Promise.all([
    supabase.from("employers").select("organization_name,verification_status,verified_at,rejection_reason,organization_email,website_url,address").eq("id", user.id).maybeSingle(),
    supabase.from("documents").select("id,storage_path,original_filename,file_size_bytes,created_at").eq("owner_id", user.id).eq("document_type", "employer_verification").is("deleted_at", null).order("created_at", { ascending: false }),
  ]);
  const links = await Promise.all((documentsResult.data ?? []).map(async (document) => {
    const { data } = await supabase.storage.from("aptora-documents").createSignedUrl(document.storage_path, 60);
    return [document.id, data?.signedUrl ?? null] as const;
  }));
  const signed = new Map(links);
  const status = employerResult.data?.verification_status;
  return <><div className="dashboard-page-heading"><div><div className="eyebrow">ORGANIZATION VERIFICATION</div><h1>Build trust before publishing.</h1><p>Administrators review organization details and supporting documents before approving placements.</p></div></div>
    {employerResult.error || !employerResult.data || documentsResult.error ? <p className="dashboard-alert">Verification information could not be loaded.</p> : <><section className={`verification-banner verification-${status}`}><div><div className="eyebrow">CURRENT STATUS</div><h2>{status?.replaceAll("_", " ")}</h2><p>{employerResult.data.rejection_reason || (status === "approved" ? "Your organization is approved to submit placements for review." : "Provide clear organization information and a supporting document for administrative review.")}</p></div><Link href="/employer/profile">Review profile <span>→</span></Link></section>
      <div className="verification-layout"><section className="dashboard-panel"><div className="eyebrow">ORGANIZATION DETAILS ON FILE</div><div className="verification-facts"><div><span>Organization</span><strong>{employerResult.data.organization_name}</strong></div><div><span>Official email</span><strong>{employerResult.data.organization_email}</strong></div><div><span>Website</span><strong>{employerResult.data.website_url || "Not provided"}</strong></div><div><span>Address</span><strong>{employerResult.data.address}</strong></div><div><span>Verified at</span><strong>{employerResult.data.verified_at ? new Date(employerResult.data.verified_at).toLocaleDateString("en-NG", { dateStyle: "long", timeZone: "UTC" }) : "Not yet verified"}</strong></div></div></section>
        <section className="dashboard-panel"><div className="eyebrow">SUPPORTING DOCUMENTS</div>{documentsResult.data?.length ? <div className="document-list">{documentsResult.data.map((document) => <div className="document-row" key={document.id}><span className="document-glyph">FILE</span><span><strong>{document.original_filename}</strong><small>{(document.file_size_bytes / 1024 / 1024).toFixed(1)} MB</small></span>{signed.get(document.id) ? <a href={signed.get(document.id)!} target="_blank" rel="noreferrer">Open ↗</a> : <span className="document-unavailable">Unavailable</span>}</div>)}</div> : <p className="panel-empty">No verification documents uploaded yet.</p>}<div className="verification-upload"><EmployerVerificationUploadForm /></div></section></div>
    </>}
  </>;
}
