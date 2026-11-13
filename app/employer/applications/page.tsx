import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import type { ApplicationStatus } from "@/types/database";
import { ApplicationReviewForm } from "@/components/employer-forms";

export const instant = false;
type ParamValue = string | string[] | undefined;
const statuses: ApplicationStatus[] = ["submitted", "under_review", "shortlisted", "interview", "accepted", "rejected", "withdrawn"];

export default async function EmployerApplicationsPage({ searchParams }: { searchParams: Promise<Record<string, ParamValue>> }) {
  const { supabase } = await requireRole(["employer"]);
  const params = await searchParams;
  const rawStatus = typeof params.status === "string" && statuses.includes(params.status as ApplicationStatus) ? params.status as ApplicationStatus : null;
  const placementId = typeof params.placement === "string" && /^[0-9a-f-]{36}$/i.test(params.placement) ? params.placement : null;
  const page = Math.min(10000, Math.max(1, Number(params.page) || 1));
  const { data, error } = await supabase.rpc("get_employer_applications", { p_status: rawStatus, p_placement_id: placementId, p_page: page, p_page_size: 20 });
  const resumeIds = [...new Set((data ?? []).flatMap((application) => application.resume_document_id ? [application.resume_document_id] : []))];
  const { data: documents } = resumeIds.length ? await supabase.from("documents").select("id,storage_path,original_filename").in("id", resumeIds) : { data: [] };
  const resumeLinks = await Promise.all((documents ?? []).map(async (document) => {
    const { data: signed } = await supabase.storage.from("aptora-documents").createSignedUrl(document.storage_path, 60);
    return [document.id, signed?.signedUrl ?? null] as const;
  }));
  const resumeMap = new Map(resumeLinks);

  return <><div className="dashboard-page-heading"><div><div className="eyebrow">APPLICATION REVIEW</div><h1>Meet the candidates.</h1><p>Candidate details are shown only for applications to your organization’s placements.</p></div></div>
    <form className="dashboard-filter-form employer-app-filter" action="/employer/applications"><label className="sr-only" htmlFor="application-status">Filter by status</label><select id="application-status" name="status" defaultValue={rawStatus ?? ""}><option value="">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select><label className="sr-only" htmlFor="application-placement">Placement ID</label><input id="application-placement" name="placement" defaultValue={typeof params.placement === "string" ? params.placement : ""} placeholder="Filter by placement ID" /><button className="button button-dark">Filter</button></form>
    {error ? <p className="dashboard-alert">Applications could not be loaded.</p> : data?.length ? <div className="employer-candidate-list">{data.map((application) => { const resume = application.resume_document_id ? documents?.find((document) => document.id === application.resume_document_id) : null; const reviewable = ["submitted", "under_review", "shortlisted", "interview"].includes(application.application_status); return <article className="dashboard-panel candidate-card" key={application.application_id}><div className="candidate-heading"><span className="list-avatar">{application.student_name.slice(0, 1).toUpperCase()}</span><div><h2>{application.student_name}</h2><p>{application.placement_title}</p></div><span className={`status-badge status-${application.application_status}`}>{application.application_status.replaceAll("_", " ")}</span></div>
      <div className="candidate-facts"><span>{application.department}</span><span>{application.course_of_study}</span><span>{application.level} level</span><span>CGPA {application.cgpa ?? "Not provided"}</span><span>Applied {new Date(application.submitted_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</span></div>
      {application.cover_letter ? <div className="candidate-letter"><div className="eyebrow">APPLICANT NOTE</div><p>{application.cover_letter}</p></div> : null}
      {resume ? resumeMap.get(application.resume_document_id!) ? <a className="candidate-resume" href={resumeMap.get(application.resume_document_id!)!} target="_blank" rel="noreferrer">Open {resume.original_filename} ↗</a> : <span className="candidate-resume">Resume unavailable</span> : null}
      {reviewable ? <ApplicationReviewForm applicationId={application.application_id} currentStatus={application.application_status} notes={application.employer_notes} /> : application.employer_notes ? <p className="employer-note-display"><strong>Your notes:</strong> {application.employer_notes}</p> : null}
    </article>; })}</div> : <div className="dashboard-panel recommendation-empty"><span className="empty-mark">○</span><h2>No applications match this view.</h2><p>Applications to your published placements will appear here.</p></div>}
    <nav className="opportunity-pagination" aria-label="Application pages">{page > 1 ? <Link href={appPageHref(params, page - 1)}>← Previous</Link> : <span />}<span>Page {page}</span>{data?.length === 20 ? <Link href={appPageHref(params, page + 1)}>Next →</Link> : <span />}</nav>
  </>;
}

function appPageHref(params: Record<string, ParamValue>, page: number) {
  const search = new URLSearchParams();
  for (const key of ["status", "placement"]) if (typeof params[key] === "string" && params[key]) search.set(key, params[key] as string);
  search.set("page", String(page));
  return `/employer/applications?${search.toString()}`;
}
