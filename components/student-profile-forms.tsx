"use client";

import { useActionState } from "react";
import { updateStudentAcademics, updateStudentProfile } from "@/actions/student";

function Message({ state }: { state: { message?: string; success?: boolean } }) {
  if (!state.message) return null;
  return <p className={`form-message ${state.success ? "success" : "error"}`} role={state.success ? "status" : "alert"}>{state.message}</p>;
}

export function StudentProfileForm({ profile }: { profile: { full_name: string; phone: string | null; address: string | null; bio: string | null; linkedin_url: string | null; github_url: string | null; portfolio_url: string | null } }) {
  const [state, action, pending] = useActionState(updateStudentProfile, {});
  return <form className="dashboard-form" action={action}><Message state={state} />
    <label>Full name<input name="fullName" required minLength={2} maxLength={160} defaultValue={profile.full_name} autoComplete="name" /></label>
    <label>Phone number<input name="phone" type="tel" maxLength={40} defaultValue={profile.phone ?? ""} autoComplete="tel" /></label>
    <label>Address<input name="address" maxLength={300} defaultValue={profile.address ?? ""} autoComplete="street-address" /></label>
    <label>About you<textarea name="bio" rows={5} maxLength={2000} defaultValue={profile.bio ?? ""} placeholder="Share a short introduction, what you are learning, and what you hope to work on." /></label>
    <div className="dashboard-form-grid"><label>LinkedIn profile<input name="linkedinUrl" type="url" defaultValue={profile.linkedin_url ?? ""} placeholder="https://linkedin.com/in/…" /></label><label>GitHub profile<input name="githubUrl" type="url" defaultValue={profile.github_url ?? ""} placeholder="https://github.com/…" /></label></div>
    <label>Portfolio website<input name="portfolioUrl" type="url" defaultValue={profile.portfolio_url ?? ""} placeholder="https://…" /></label>
    <button className="button button-blue" disabled={pending}>{pending ? "Saving…" : "Save profile"}<span aria-hidden="true">↗</span></button>
  </form>;
}

export function StudentAcademicForm({ student }: { student: { matric_number: string; faculty: string; department: string; course_of_study: string; level: number; cgpa: number | null; graduation_year: number | null; siwes_eligible: boolean; preferred_duration_weeks: number | null } }) {
  const [state, action, pending] = useActionState(updateStudentAcademics, {});
  return <form className="dashboard-form" action={action}><Message state={state} />
    <label>Matriculation number<input value={student.matric_number.startsWith("PENDING-") ? "" : student.matric_number} disabled readOnly /><small>Contact support if this number needs correction.</small></label>
    <div className="dashboard-form-grid"><label>Faculty<input name="faculty" required minLength={2} maxLength={180} defaultValue={student.faculty === "Pending" ? "" : student.faculty} /></label><label>Department<input name="department" required minLength={2} maxLength={180} defaultValue={student.department === "Pending" ? "" : student.department} /></label></div>
    <div className="dashboard-form-grid"><label>Course of study<input name="courseOfStudy" required minLength={2} maxLength={180} defaultValue={student.course_of_study === "Pending" ? "" : student.course_of_study} /></label><label>Academic level<select name="level" defaultValue={student.level}><option value={100}>100 level</option><option value={200}>200 level</option><option value={300}>300 level</option><option value={400}>400 level</option><option value={500}>500 level</option><option value={600}>600 level</option><option value={700}>700 level</option><option value={800}>800 level</option></select></label></div>
    <div className="dashboard-form-grid"><label>CGPA (out of 5)<input name="cgpa" type="number" min="0" max="5" step="0.01" defaultValue={student.cgpa ?? ""} /></label><label>Expected graduation year<input name="graduationYear" type="number" min="2000" max="2150" defaultValue={student.graduation_year ?? ""} /></label></div>
    <label>Preferred placement duration (weeks)<input name="preferredDurationWeeks" type="number" min="1" max="104" defaultValue={student.preferred_duration_weeks ?? ""} /></label>
    <label className="dashboard-checkbox"><input name="siwesEligible" type="checkbox" defaultChecked={student.siwes_eligible} /> I am eligible to undertake SIWES / industrial training.</label>
    <button className="button button-blue" disabled={pending}>{pending ? "Saving…" : "Save academic details"}<span aria-hidden="true">↗</span></button>
  </form>;
}
