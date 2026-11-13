"use client";

import { useActionState } from "react";
import { createPlacement, reviewEmployerApplication, updateEmployerProfile, updatePlacement, uploadEmployerVerificationDocument } from "@/actions/employer";
import type { Database } from "@/types/database";

type EmployerRow = Database["aptora"]["Tables"]["employers"]["Row"];
type PlacementRow = Database["aptora"]["Tables"]["placements"]["Row"];
function Feedback({ state }: { state: { message?: string; success?: boolean } }) { return state.message ? <p className={`form-message ${state.success ? "success" : "error"}`} role={state.success ? "status" : "alert"}>{state.message}</p> : null; }
function Field({ label, name, type = "text", defaultValue, required = false, placeholder }: { label: string; name: string; type?: string; defaultValue?: string | number; required?: boolean; placeholder?: string }) { return <label>{label}<input name={name} type={type} defaultValue={defaultValue ?? ""} required={required} placeholder={placeholder} /></label>; }

export function EmployerProfileForm({ employer }: { employer: EmployerRow }) {
  const [state, action, pending] = useActionState(updateEmployerProfile, {});
  return <form className="dashboard-form" action={action}><Feedback state={state} />
    <div className="dashboard-form-grid"><Field label="Organization name" name="organizationName" defaultValue={employer.organization_name} required /><Field label="Organization type" name="organizationType" defaultValue={employer.organization_type ?? ""} /></div>
    <div className="dashboard-form-grid"><Field label="Industry" name="industry" defaultValue={employer.industry ?? ""} /><Field label="Website" name="website" type="url" defaultValue={employer.website_url ?? ""} placeholder="https://" /></div>
    <div className="dashboard-form-grid"><Field label="Official organization email" name="organizationEmail" type="email" defaultValue={employer.organization_email} required /><Field label="Phone number" name="phone" type="tel" defaultValue={employer.organization_phone ?? ""} /></div>
    <Field label="Street address" name="address" defaultValue={employer.address} required />
    <div className="dashboard-form-grid"><Field label="City" name="city" defaultValue={employer.city ?? ""} /><Field label="State" name="state" defaultValue={employer.state ?? ""} /></div>
    <label>Organization description<textarea name="description" rows={5} maxLength={5000} defaultValue={employer.description ?? ""} /></label>
    <button className="button button-blue" disabled={pending}>{pending ? "Saving…" : "Save organization profile"}<span>↗</span></button>
  </form>;
}

export function PlacementEditorForm({ placement }: { placement?: PlacementRow }) {
  const actionCreator = placement ? updatePlacement : createPlacement;
  const [state, action, pending] = useActionState(actionCreator, {});
  const deadline = placement?.application_deadline ? new Date(placement.application_deadline).toISOString().slice(0, 16) : "";
  return <form className="dashboard-form placement-editor" action={action}>
    {placement ? <input type="hidden" name="placementId" value={placement.id} /> : null}<Feedback state={state} />
    <Field label="Placement title" name="title" defaultValue={placement?.title} required />
    <div className="dashboard-form-grid"><label>Technology area<input name="category" required maxLength={80} defaultValue={placement?.category ?? ""} placeholder="Software, data, cybersecurity…" /></label><label>Opportunity type<select name="employmentType" defaultValue={placement?.employment_type ?? "internship"}><option value="internship">Internship</option><option value="siwes">SIWES</option><option value="graduate">Graduate placement</option><option value="industrial_training">Industrial training</option><option value="other">Other</option></select></label></div>
    <div className="dashboard-form-grid"><label>Work mode<select name="workMode" defaultValue={placement?.work_mode ?? "onsite"}><option value="onsite">On-site</option><option value="hybrid">Hybrid</option><option value="remote">Remote</option></select></label><Field label="Location" name="location" defaultValue={placement?.location} required placeholder="City, state or Remote" /></div>
    <label>Role description<textarea name="description" rows={8} minLength={40} maxLength={12000} required defaultValue={placement?.description ?? ""} /></label>
    <label>Responsibilities<textarea name="responsibilities" rows={4} maxLength={5000} defaultValue={placement?.responsibilities.join("\n") ?? ""} placeholder="One responsibility per line" /></label>
    <div className="dashboard-form-grid"><label>Required skills<input name="requiredSkills" defaultValue={placement?.required_skills.join(", ") ?? ""} placeholder="React, TypeScript" /><small>Students must have every skill listed.</small></label><label>Preferred skills<input name="preferredSkills" defaultValue={placement?.preferred_skills.join(", ") ?? ""} placeholder="Testing, accessibility" /></label></div>
    <label>Eligible departments<input name="requiredDepartments" defaultValue={placement?.required_departments.join(", ") ?? ""} placeholder="Computer Science, Electrical Engineering" /><small>Leave blank to accept applicants from any department.</small></label>
    <div className="dashboard-form-grid"><label>Minimum level<select name="minLevel" defaultValue={placement?.min_level ?? ""}><option value="">No minimum</option>{[100,200,300,400,500,600,700,800].map((level)=><option key={level} value={level}>{level}</option>)}</select></label><label>Maximum level<select name="maxLevel" defaultValue={placement?.max_level ?? ""}><option value="">No maximum</option>{[100,200,300,400,500,600,700,800].map((level)=><option key={level} value={level}>{level}</option>)}</select></label></div>
    <div className="dashboard-form-grid"><label>Minimum CGPA (out of 5)<input name="minCgpa" type="number" min="0" max="5" step="0.01" defaultValue={placement?.min_cgpa ?? ""} /></label><Field label="Duration (weeks)" name="durationWeeks" type="number" defaultValue={placement?.duration_weeks ?? ""} /></div>
    <label className="dashboard-checkbox"><input type="checkbox" name="siwesRequired" defaultChecked={placement?.siwes_required ?? false} /> Applicant must be eligible for SIWES / industrial training.</label>
    <div className="dashboard-form-grid"><Field label="Available positions" name="slots" type="number" defaultValue={placement?.slots ?? 1} required /><Field label="Application deadline" name="applicationDeadline" type="datetime-local" defaultValue={deadline} /></div>
    <div className="dashboard-form-grid"><Field label="Placement start date" name="startDate" type="date" defaultValue={placement?.start_date ?? ""} /><Field label="Placement end date" name="endDate" type="date" defaultValue={placement?.end_date ?? ""} /></div>
    <label>Application instructions<textarea name="applicationInstructions" rows={3} maxLength={4000} defaultValue={placement?.application_instructions ?? ""} /></label>
    <button className="button button-blue" disabled={pending}>{pending ? "Saving…" : placement ? "Save changes" : "Save draft"}<span>↗</span></button>
  </form>;
}

export function ApplicationReviewForm({ applicationId, currentStatus, notes }: { applicationId: string; currentStatus: string; notes: string | null }) {
  const [state, action, pending] = useActionState(reviewEmployerApplication, {});
  return <form className="application-review-form" action={action}><input type="hidden" name="applicationId" value={applicationId} /><Feedback state={state} />
    <label>Review status<select name="status" defaultValue={currentStatus === "submitted" ? "under_review" : currentStatus}>
      <option value="under_review">Under review</option><option value="shortlisted">Shortlisted</option><option value="interview">Interview</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option>
    </select></label>
    <label>Private employer notes<textarea name="employerNotes" rows={3} maxLength={5000} defaultValue={notes ?? ""} /></label>
    <button className="button button-dark" disabled={pending}>{pending ? "Saving…" : "Save review"}<span>↗</span></button>
  </form>;
}

export function EmployerVerificationUploadForm() {
  const [state, action, pending] = useActionState(uploadEmployerVerificationDocument, {});
  return <form className="dashboard-form" action={action}><Feedback state={state} /><label>Supporting document<input type="file" name="document" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required /></label><small>Upload a relevant organization registration or verification document. PDF or Word, maximum 10 MB.</small><button className="button button-blue" disabled={pending}>{pending ? "Uploading…" : "Upload document"}<span>↗</span></button></form>;
}
