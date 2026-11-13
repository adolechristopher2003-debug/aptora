"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import type { ApplicationStatus, AppRole, VerificationStatus } from "@/types/database";

export type AdminActionState = { message?: string; success?: boolean };
const field = (data: FormData, key: string) => { const value = data.get(key); return typeof value === "string" ? value.trim() : ""; };
const idPattern = /^[0-9a-f-]{36}$/i;

export async function decideEmployerVerification(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const employerId = field(formData, "employerId");
  const decision = field(formData, "decision");
  const reason = field(formData, "reason");
  if (!idPattern.test(employerId) || !["approved", "rejected", "under_review"].includes(decision) || reason.length > 2000) return { message: "Check the verification decision and note." };
  const { supabase, user } = await requireRole(["admin", "super_admin"]);
  if (decision === "approved") {
    const { data: document } = await supabase.from("documents").select("id").eq("owner_id", employerId).eq("document_type", "employer_verification").is("deleted_at", null).limit(1).maybeSingle();
    if (!document) return { message: "Upload and review at least one supporting verification document before approval." };
  }
  const { error } = await supabase.from("employers").update({ verification_status: decision as VerificationStatus, verified_at: decision === "approved" ? new Date().toISOString() : null, verified_by: decision === "under_review" ? null : user.id, rejection_reason: decision === "rejected" ? reason || "Please contact the placement office for review details." : null }).eq("id", employerId);
  if (error) return { message: "We couldn’t save this verification decision." };
  revalidatePath("/admin/verifications");
  revalidatePath("/admin/employers");
  revalidatePath("/employer/dashboard");
  return { success: true, message: `Organization marked ${decision.replaceAll("_", " ")}.` };
}

export async function decidePlacement(formData: FormData) {
  const placementId = field(formData, "placementId");
  const decision = field(formData, "decision");
  const reason = field(formData, "reason");
  if (!idPattern.test(placementId) || !["published", "rejected"].includes(decision) || reason.length > 2000) return;
  const { supabase, user } = await requireRole(["admin", "super_admin"]);
  const { error } = await supabase.from("placements").update({ status: decision as "published" | "rejected", approved_at: decision === "published" ? new Date().toISOString() : null, approved_by: decision === "published" ? user.id : null, rejection_reason: decision === "rejected" ? reason || "Please update the listing and resubmit." : null }).eq("id", placementId).eq("status", "pending_review");
  if (!error) {
    revalidatePath("/admin/placements");
    revalidatePath("/opportunities");
  }
}

export async function setUserAccountStatus(formData: FormData) {
  const userId = field(formData, "userId");
  const status = field(formData, "status");
  if (!idPattern.test(userId) || !["active", "suspended"].includes(status)) return;
  const { supabase, user, profile } = await requireRole(["admin", "super_admin"]);
  if (userId === user.id) return;
  const { data: target } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (!target || ["admin", "super_admin"].includes(target.role) && profile.role !== "super_admin") return;
  await supabase.from("profiles").update({ status: status as "active" | "suspended" }).eq("id", userId);
  revalidatePath("/admin/students");
  revalidatePath("/admin/employers");
}

export async function changeUserRole(formData: FormData) {
  const userId = field(formData, "userId");
  const role = field(formData, "role");
  if (!idPattern.test(userId) || !["student", "employer", "admin", "super_admin"].includes(role)) return;
  const { supabase, user } = await requireRole(["super_admin"]);
  if (userId === user.id) return;
  const { data: target } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (!target) return;
  await supabase.from("profiles").update({ role: role as AppRole }).eq("id", userId);
  revalidatePath("/admin/students");
  revalidatePath("/admin/employers");
}

export async function reviewAdminApplication(formData: FormData) {
  const applicationId = field(formData, "applicationId");
  const status = field(formData, "status");
  if (!idPattern.test(applicationId) || !["under_review", "shortlisted", "interview", "accepted", "rejected", "withdrawn"].includes(status)) return;
  const { supabase } = await requireRole(["admin", "super_admin"]);
  await supabase.from("applications").update({ status: status as ApplicationStatus }).eq("id", applicationId);
  revalidatePath("/admin/applications");
}

export async function updateContactMessage(formData: FormData) {
  const messageId = field(formData, "messageId");
  const status = field(formData, "status");
  if (!idPattern.test(messageId) || !["new", "in_progress", "resolved", "spam"].includes(status)) return;
  const { supabase, user } = await requireRole(["admin", "super_admin"]);
  await supabase.from("contact_messages").update({ status, assigned_to: user.id, resolved_at: status === "resolved" ? new Date().toISOString() : null }).eq("id", messageId);
  revalidatePath("/admin/messages");
}

export async function sendAdminNotification(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const userId = field(formData, "userId");
  const title = field(formData, "title");
  const body = field(formData, "body");
  const type = field(formData, "type");
  if (!idPattern.test(userId) || title.length < 1 || title.length > 160 || body.length < 1 || body.length > 2000 || !["system", "placement", "verification", "application", "message", "deadline", "recommendation"].includes(type)) return { message: "Check the notification recipient and message." };
  const { supabase } = await requireRole(["admin", "super_admin"]);
  const { error } = await supabase.from("notifications").insert({ user_id: userId, title, body, notification_type: type as "system" });
  if (error) return { message: "We couldn’t send this notification. Check the recipient ID." };
  return { success: true, message: "Notification sent." };
}

export async function updateMatchingWeights(_state: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const skill = Number(field(formData, "skillWeight"));
  const academic = Number(field(formData, "academicWeight"));
  const interest = Number(field(formData, "interestWeight"));
  const location = Number(field(formData, "locationWeight"));
  const duration = Number(field(formData, "durationWeight"));
  const minimum = Number(field(formData, "minimumScore"));
  const values = [skill, academic, interest, location, duration];
  if (values.some((value) => !Number.isFinite(value) || value < 0 || value > 1) || Math.abs(values.reduce((sum, value) => sum + value, 0) - 1) > 0.0001 || !Number.isFinite(minimum) || minimum < 0 || minimum > 100) {
    return { message: "Weights must be between 0 and 1, add up to exactly 1, and the minimum score must be from 0 to 100." };
  }
  const { supabase, user } = await requireRole(["admin", "super_admin"]);
  const { error } = await supabase.from("match_settings").update({ skill_weight: skill, academic_weight: academic, interest_weight: interest, location_weight: location, duration_weight: duration, min_recommendation_score: minimum, updated_by: user.id }).eq("id", 1);
  if (error) return { message: "We couldn’t save the matching settings." };
  revalidatePath("/admin/settings");
  return { success: true, message: "Matching settings updated." };
}
