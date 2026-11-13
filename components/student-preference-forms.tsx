"use client";

import { useActionState } from "react";
import { addStudentSkill, deleteStudentDocument, removeStudentInterest, removeStudentSkill, saveStudentInterest, uploadStudentDocument } from "@/actions/student";

function Message({ state }: { state: { message?: string; success?: boolean } }) {
  return state.message ? <p className={`form-message ${state.success ? "success" : "error"}`} role={state.success ? "status" : "alert"}>{state.message}</p> : null;
}

export function AddSkillForm({ skills }: { skills: { id: string; name: string; category: string }[] }) {
  const [state, action, pending] = useActionState(addStudentSkill, {});
  return <form className="dashboard-form skill-add-form" action={action}><Message state={state} />
    <label>Skill<select name="skillId" required defaultValue=""><option value="" disabled>Select a skill</option>{skills.map((skill) => <option value={skill.id} key={skill.id}>{skill.name} · {skill.category}</option>)}</select></label>
    <label>Proficiency<select name="proficiency" defaultValue="3"><option value="1">1 · Learning</option><option value="2">2 · Basic</option><option value="3">3 · Comfortable</option><option value="4">4 · Strong</option><option value="5">5 · Advanced</option></select></label>
    <button className="button button-blue" disabled={pending || skills.length === 0}>{pending ? "Saving…" : "Add skill"}<span aria-hidden="true">↗</span></button>
  </form>;
}

export function SkillList({ skills }: { skills: { id: string; name: string; category: string; proficiency: number }[] }) {
  if (!skills.length) return <p className="panel-empty">No skills added yet. Add the technologies and tools you can use.</p>;
  return <div className="preference-list">{skills.map((skill) => <article className="preference-item" key={skill.id}><span className="preference-glyph">✳</span><span><strong>{skill.name}</strong><small>{skill.category} · proficiency {skill.proficiency} of 5</small></span><form action={removeStudentSkill}><input type="hidden" name="skillId" value={skill.id} /><button className="icon-remove" aria-label={`Remove ${skill.name}`} title={`Remove ${skill.name}`}>×</button></form></article>)}</div>;
}

export function AddInterestForm() {
  const [state, action, pending] = useActionState(saveStudentInterest, {});
  return <form className="dashboard-form interest-add-form" action={action}><Message state={state} />
    <label>Career area<input name="category" required minLength={2} maxLength={80} placeholder="For example: Web development" /></label>
    <label>Priority<select name="priority" defaultValue="3"><option value="1">1 · Exploring</option><option value="2">2 · Interested</option><option value="3">3 · Important</option><option value="4">4 · High priority</option><option value="5">5 · Top priority</option></select></label>
    <button className="button button-blue" disabled={pending}>{pending ? "Saving…" : "Add interest"}<span aria-hidden="true">↗</span></button>
  </form>;
}

export function InterestList({ interests }: { interests: { category: string; priority: number }[] }) {
  if (!interests.length) return <p className="panel-empty">No interests added yet. Add the kinds of technology work you want to explore.</p>;
  return <div className="preference-list">{interests.map((interest) => <article className="preference-item" key={interest.category}><span className="preference-glyph">◎</span><span><strong>{interest.category}</strong><small>Priority {interest.priority} of 5</small></span><form action={removeStudentInterest}><input type="hidden" name="category" value={interest.category} /><button className="icon-remove" aria-label={`Remove ${interest.category}`} title={`Remove ${interest.category}`}>×</button></form></article>)}</div>;
}

export function StudentDocumentUploadForm() {
  const [state, action, pending] = useActionState(uploadStudentDocument, {});
  return <form className="dashboard-form document-upload-form" action={action}>
    <Message state={state} />
    <label>Document type<select name="documentType" defaultValue="resume"><option value="resume">Resume</option><option value="cv">CV</option><option value="cover_letter">Cover letter</option><option value="transcript">Academic transcript</option><option value="proof_of_enrollment">Proof of enrollment</option><option value="portfolio">Portfolio document</option><option value="other">Other</option></select></label>
    <label>Choose a file<input type="file" name="document" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required /></label>
    <small className="document-limit">PDF or Word format · Maximum 10 MB</small>
    <button className="button button-blue" disabled={pending}>{pending ? "Uploading…" : "Upload document"}<span aria-hidden="true">↗</span></button>
  </form>;
}

export function DeleteStudentDocumentForm({ documentId }: { documentId: string }) {
  return <form action={deleteStudentDocument}><input type="hidden" name="documentId" value={documentId} /><button className="text-action" aria-label="Delete document">Delete</button></form>;
}
