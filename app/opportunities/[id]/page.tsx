import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicPage } from "@/components/public-chrome";
import { getPublicOpportunity } from "@/lib/services/opportunities";
import { createClient } from "@/lib/supabase/server";
import { ApplyPlacementForm, SavePlacementButton } from "@/components/student-placement-actions";

export const instant = false;

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getPublicOpportunity(id);

  if (!result.configured) return <PublicPage eyebrow="PLACEMENT DETAILS" title={<>An opportunity<br /><em>in focus.</em></>}><div className="empty-opportunities"><h2>Placement details are being connected.</h2><p>Configure the Supabase project to browse approved opportunities.</p><Link className="text-link" href="/opportunities">Back to opportunities <span>→</span></Link></div></PublicPage>;
  if (result.failed || !result.placement) notFound();

  const placement = result.placement;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const { data: profile } = authData.user ? await supabase.from("profiles").select("role").eq("id", authData.user.id).maybeSingle() : { data: null };
  const { data: existingApplication } = authData.user && profile?.role === "student" ? await supabase.from("applications").select("id,status").eq("student_id", authData.user.id).eq("placement_id", placement.id).maybeSingle() : { data: null };
  const { data: resumes } = authData.user && profile?.role === "student" ? await supabase.from("documents").select("id,original_filename").eq("owner_id", authData.user.id).in("document_type", ["cv", "resume"]).is("deleted_at", null).order("created_at", { ascending: false }) : { data: [] };
  return <PublicPage eyebrow={`${placement.category.toUpperCase()} / PLACEMENT DETAILS`} title={<>{placement.title}<br /><em>at {placement.organization_name}.</em></>}>
    <div className="detail-meta"><span>{placement.work_mode}</span><span>{placement.location}</span><span>{placement.employment_type}</span>{placement.duration_weeks ? <span>{placement.duration_weeks} weeks</span> : null}</div>
    <div className="detail-layout"><article className="detail-content">
      <section><div className="eyebrow">ABOUT THE ROLE</div><p className="detail-description">{placement.description}</p></section>
      {placement.responsibilities.length ? <section><div className="eyebrow">RESPONSIBILITIES</div><ul className="detail-list">{placement.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
      {placement.required_skills.length ? <section><div className="eyebrow">REQUIRED SKILLS</div><div className="opportunity-skills">{placement.required_skills.map((skill) => <span key={skill}>{skill}</span>)}</div></section> : null}
      {placement.preferred_skills.length ? <section><div className="eyebrow">PREFERRED SKILLS</div><div className="opportunity-skills">{placement.preferred_skills.map((skill) => <span key={skill}>{skill}</span>)}</div></section> : null}
      <section><div className="eyebrow">ELIGIBILITY</div><ul className="detail-list">
        {placement.required_departments.length ? <li>Relevant departments: {placement.required_departments.join(", ")}</li> : null}
        {placement.min_level || placement.max_level ? <li>Academic level: {placement.min_level ?? "Any"}–{placement.max_level ?? "Any"}</li> : null}
        {placement.min_cgpa ? <li>Minimum CGPA: {placement.min_cgpa} / {placement.cgpa_scale}</li> : null}
        {placement.siwes_required ? <li>Applicants must be eligible for SIWES / industrial training.</li> : null}
        {!placement.required_departments.length && !placement.min_level && !placement.max_level && !placement.min_cgpa && !placement.siwes_required ? <li>See the role description for any additional requirements.</li> : null}
      </ul></section>
    </article><aside className="detail-aside"><div className="eyebrow">ORGANIZATION</div><div className="opportunity-company-mark">{placement.organization_name.slice(0, 1).toUpperCase()}</div><h2>{placement.organization_name}</h2><p className="verified-label"><span className="live-dot" /> Verified organization</p>
      <dl className="detail-facts"><div><dt>Location</dt><dd>{placement.location}</dd></div>{placement.application_deadline ? <div><dt>Apply by</dt><dd>{new Date(placement.application_deadline).toLocaleDateString("en-NG", { dateStyle: "long", timeZone: "UTC" })}</dd></div> : null}{placement.slots ? <div><dt>Positions</dt><dd>{placement.slots}</dd></div> : null}</dl>
      {placement.application_instructions ? <p className="application-instructions">{placement.application_instructions}</p> : null}
      {profile?.role === "student" ? existingApplication ? <p className="form-message success">You already applied. Current status: {existingApplication.status.replaceAll("_", " ")}.</p> : <ApplyPlacementForm placementId={placement.id} resumes={resumes ?? []} /> : <Link className="button button-blue detail-apply" href="/login">Sign in to apply <span aria-hidden="true">↗</span></Link>}
      {profile?.role === "student" && !existingApplication ? <div className="detail-save"><SavePlacementButton placementId={placement.id} /></div> : <p className="detail-aside-note">You’ll need a student account to submit and track an application.</p>}
    </aside></div>
  </PublicPage>;
}
