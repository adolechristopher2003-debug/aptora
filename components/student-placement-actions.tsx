"use client";

import { useActionState } from "react";
import { applyToPlacement, recalculateStudentRecommendations, savePlacement, unsavePlacement } from "@/actions/student";

export function SavePlacementButton({ placementId, saved = false }: { placementId: string; saved?: boolean }) {
  return <form action={saved ? unsavePlacement : savePlacement}><input type="hidden" name="placementId" value={placementId} /><button className="button button-outline" type="submit">{saved ? "Remove saved role" : "Save placement"}<span aria-hidden="true">⌑</span></button></form>;
}

export function ApplyPlacementForm({ placementId, resumes = [] }: { placementId: string; resumes?: { id: string; original_filename: string }[] }) {
  const [state, action, pending] = useActionState(applyToPlacement, {});
  return <form className="apply-form" action={action}><input type="hidden" name="placementId" value={placementId} />
    {state.message ? <p className={`form-message ${state.success ? "success" : "error"}`} role={state.success ? "status" : "alert"}>{state.message}</p> : null}
    <label>Note to the employer<textarea name="coverLetter" rows={5} maxLength={10000} placeholder="Briefly share why this opportunity interests you." /></label>
    {resumes.length ? <label>Resume<select name="resumeDocumentId" defaultValue=""><option value="">Choose later</option>{resumes.map((resume) => <option value={resume.id} key={resume.id}>{resume.original_filename}</option>)}</select></label> : null}
    <button className="button button-blue" disabled={pending}>{pending ? "Submitting…" : "Submit application"}<span aria-hidden="true">↗</span></button>
  </form>;
}

export function RecommendationRefreshForm() {
  return <form action={recalculateStudentRecommendations}><button className="button button-blue" type="submit">Refresh recommendations <span aria-hidden="true">↻</span></button></form>;
}
