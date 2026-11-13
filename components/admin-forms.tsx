"use client";

import { useActionState } from "react";
import { changeUserRole, decideEmployerVerification, decidePlacement, reviewAdminApplication, sendAdminNotification, setUserAccountStatus, updateContactMessage, updateMatchingWeights } from "@/actions/admin";

function Feedback({ state }: { state: { message?: string; success?: boolean } }) { return state.message ? <p className={`form-message ${state.success ? "success" : "error"}`} role={state.success ? "status" : "alert"}>{state.message}</p> : null; }

export function EmployerDecisionForm({ employerId, currentStatus }: { employerId: string; currentStatus: string }) {
  const [state, action, pending] = useActionState(decideEmployerVerification, {});
  return <form className="admin-review-form" action={action}><input type="hidden" name="employerId" value={employerId} /><Feedback state={state} /><select name="decision" aria-label="Verification decision" defaultValue={currentStatus === "pending" ? "under_review" : currentStatus}><option value="under_review">Under review</option><option value="approved">Approve</option><option value="rejected">Reject</option></select><input name="reason" maxLength={2000} placeholder="Reason or follow-up note" aria-label="Reason or follow-up note" /><button className="button button-dark" disabled={pending}>{pending ? "Saving…" : "Save decision"}</button></form>;
}

export function PlacementDecisionForm({ placementId }: { placementId: string }) {
  return <form className="admin-review-form" action={decidePlacement}><input type="hidden" name="placementId" value={placementId} /><input name="reason" maxLength={2000} placeholder="Review note (required for rejection)" aria-label="Review note" /><button className="button button-blue" name="decision" value="published">Approve & publish</button><button className="button button-outline" name="decision" value="rejected">Request changes</button></form>;
}

export function UserStatusForm({ userId, status }: { userId: string; status: string }) {
  return <form action={setUserAccountStatus}><input type="hidden" name="userId" value={userId} /><button className="text-action" name="status" value={status === "active" ? "suspended" : "active"}>{status === "active" ? "Suspend" : "Restore"}</button></form>;
}

export function UserRoleForm({ userId, role }: { userId: string; role: string }) {
  return <form className="user-role-form" action={changeUserRole}><input type="hidden" name="userId" value={userId} /><select name="role" defaultValue={role} aria-label="Account role"><option value="student">Student</option><option value="employer">Employer</option><option value="admin">Admin</option><option value="super_admin">Super admin</option></select><button className="text-action">Change role</button></form>;
}

export function AdminApplicationReview({ applicationId, status }: { applicationId: string; status: string }) {
  return <form className="admin-review-form" action={reviewAdminApplication}><input type="hidden" name="applicationId" value={applicationId} /><select name="status" defaultValue={status} aria-label="Application status"><option value="under_review">Under review</option><option value="shortlisted">Shortlisted</option><option value="interview">Interview</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option><option value="withdrawn">Withdrawn</option></select><button className="button button-dark">Update status</button></form>;
}

export function ContactMessageStatusForm({ messageId, status }: { messageId: string; status: string }) {
  return <form className="admin-review-form" action={updateContactMessage}><input type="hidden" name="messageId" value={messageId} /><select name="status" defaultValue={status} aria-label="Contact message status"><option value="new">New</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="spam">Spam</option></select><button className="button button-dark">Save status</button></form>;
}

export function AdminNotificationForm({ users }: { users: { id: string; name: string; email: string }[] }) {
  const [state, action, pending] = useActionState(sendAdminNotification, {});
  return <form className="dashboard-form" action={action}><Feedback state={state} /><label>Recipient<select name="userId" required defaultValue=""><option value="" disabled>Select account</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name} · {user.email}</option>)}</select></label><div className="dashboard-form-grid"><label>Type<select name="type"><option value="system">System</option><option value="placement">Placement</option><option value="verification">Verification</option><option value="application">Application</option><option value="message">Message</option><option value="deadline">Deadline</option><option value="recommendation">Recommendation</option></select></label><label>Title<input name="title" required maxLength={160} /></label></div><label>Message<textarea name="body" required minLength={1} maxLength={2000} rows={4} /></label><button className="button button-blue" disabled={pending}>{pending ? "Sending…" : "Send notification"}<span>↗</span></button></form>;
}

export function MatchingWeightsForm({ settings }: { settings: { skill_weight: number; academic_weight: number; interest_weight: number; location_weight: number; duration_weight: number; min_recommendation_score: number } }) {
  const [state, action, pending] = useActionState(updateMatchingWeights, {});
  return <form className="dashboard-form match-weight-form" action={action}><Feedback state={state} /><p>Each weight must be between 0 and 1, and all five must sum to 1. The minimum score controls which eligible opportunities are stored as recommendations.</p><div className="dashboard-form-grid">{[["Skill fit","skillWeight",settings.skill_weight],["Academic fit","academicWeight",settings.academic_weight],["Career interest","interestWeight",settings.interest_weight],["Location","locationWeight",settings.location_weight],["Duration","durationWeight",settings.duration_weight]].map(([label,name,value])=><label key={String(name)}>{String(label)}<input name={String(name)} type="number" min="0" max="1" step="0.01" required defaultValue={Number(value).toFixed(2)} /></label>)}</div><label>Minimum recommendation score<input name="minimumScore" type="number" min="0" max="100" step="1" required defaultValue={settings.min_recommendation_score} /></label><button className="button button-blue" disabled={pending}>{pending?"Saving…":"Save matching weights"}<span>↗</span></button></form>;
}
