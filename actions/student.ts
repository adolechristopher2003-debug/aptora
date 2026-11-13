"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { studentAcademicSchema, studentProfileSchema } from "@/lib/validations/auth";
import type { DocumentType } from "@/types/database";

export type StudentFormState = { message?: string; success?: boolean };
const field = (data: FormData, key: string) => { const value = data.get(key); return typeof value === "string" ? value.trim() : ""; };

export async function updateStudentProfile(_state: StudentFormState, formData: FormData): Promise<StudentFormState> {
  const parsed = studentProfileSchema.safeParse({
    fullName: field(formData, "fullName"), phone: field(formData, "phone"), address: field(formData, "address"), bio: field(formData, "bio"),
    linkedinUrl: field(formData, "linkedinUrl"), githubUrl: field(formData, "githubUrl"), portfolioUrl: field(formData, "portfolioUrl"),
  });
  if (!parsed.success) return { message: "Check your name, contact details, and profile links." };
  const { supabase, user } = await requireRole(["student"]);
  const data = parsed.data;
  const { error } = await supabase.from("profiles").update({ full_name: data.fullName, phone: data.phone || null, address: data.address || null, bio: data.bio || null, linkedin_url: data.linkedinUrl || null, github_url: data.githubUrl || null, portfolio_url: data.portfolioUrl || null }).eq("id", user.id);
  if (error) return { message: "We couldn’t save your profile. Please try again." };
  revalidatePath("/student");
  return { success: true, message: "Your profile has been updated." };
}

export async function updateStudentAcademics(_state: StudentFormState, formData: FormData): Promise<StudentFormState> {
  const parsed = studentAcademicSchema.safeParse({
    faculty: field(formData, "faculty"), department: field(formData, "department"), courseOfStudy: field(formData, "courseOfStudy"),
    level: field(formData, "level"), cgpa: field(formData, "cgpa"), graduationYear: field(formData, "graduationYear"),
    siwesEligible: formData.get("siwesEligible") === "on", preferredDurationWeeks: field(formData, "preferredDurationWeeks"),
  });
  if (!parsed.success) return { message: "Check the academic details and allowed ranges, then try again." };
  const { supabase, user } = await requireRole(["student"]);
  const data = parsed.data;
  const { error } = await supabase.from("students").update({
    faculty: data.faculty, department: data.department, course_of_study: data.courseOfStudy, level: data.level,
    cgpa: data.cgpa === "" ? null : data.cgpa, graduation_year: data.graduationYear === "" ? null : data.graduationYear,
    siwes_eligible: data.siwesEligible, preferred_duration_weeks: data.preferredDurationWeeks === "" ? null : data.preferredDurationWeeks,
  }).eq("id", user.id);
  if (error) return { message: "We couldn’t save your academic information. Please try again." };
  revalidatePath("/student");
  return { success: true, message: "Your academic information has been updated." };
}

export async function addStudentSkill(_state: StudentFormState, formData: FormData): Promise<StudentFormState> {
  const skillId = field(formData, "skillId");
  const proficiency = Number(field(formData, "proficiency"));
  if (!/^[0-9a-f-]{36}$/i.test(skillId) || !Number.isInteger(proficiency) || proficiency < 1 || proficiency > 5) return { message: "Choose a skill and a proficiency level." };
  const { supabase, user } = await requireRole(["student"]);
  const { error } = await supabase.from("student_skills").upsert({ student_id: user.id, skill_id: skillId, proficiency });
  if (error) return { message: "We couldn’t add that skill. Refresh and try again." };
  revalidatePath("/student/skills");
  return { success: true, message: "Skill saved." };
}

export async function removeStudentSkill(formData: FormData) {
  const skillId = field(formData, "skillId");
  if (!/^[0-9a-f-]{36}$/i.test(skillId)) return;
  const { supabase, user } = await requireRole(["student"]);
  await supabase.from("student_skills").delete().eq("student_id", user.id).eq("skill_id", skillId);
  revalidatePath("/student/skills");
}

export async function saveStudentInterest(_state: StudentFormState, formData: FormData): Promise<StudentFormState> {
  const category = field(formData, "category");
  const priority = Number(field(formData, "priority"));
  if (category.length < 2 || category.length > 80 || !Number.isInteger(priority) || priority < 1 || priority > 5) return { message: "Enter an interest area and choose its priority." };
  const { supabase, user } = await requireRole(["student"]);
  const { error } = await supabase.from("student_interests").upsert({ student_id: user.id, category, priority });
  if (error) return { message: "We couldn’t save that interest. Please try again." };
  revalidatePath("/student/interests");
  return { success: true, message: "Career interest saved." };
}

export async function removeStudentInterest(formData: FormData) {
  const category = field(formData, "category");
  if (!category || category.length > 80) return;
  const { supabase, user } = await requireRole(["student"]);
  await supabase.from("student_interests").delete().eq("student_id", user.id).eq("category", category);
  revalidatePath("/student/interests");
}

export async function recalculateStudentRecommendations() {
  const { supabase } = await requireRole(["student"]);
  await supabase.rpc("recalculate_recommendations");
  revalidatePath("/student/recommendations");
  revalidatePath("/student/dashboard");
}

export async function savePlacement(formData: FormData) {
  const placementId = field(formData, "placementId");
  if (!/^[0-9a-f-]{36}$/i.test(placementId)) return;
  const { supabase, user } = await requireRole(["student"]);
  await supabase.from("saved_placements").upsert({ student_id: user.id, placement_id: placementId });
  revalidatePath("/student/saved");
}

export async function unsavePlacement(formData: FormData) {
  const placementId = field(formData, "placementId");
  if (!/^[0-9a-f-]{36}$/i.test(placementId)) return;
  const { supabase, user } = await requireRole(["student"]);
  await supabase.from("saved_placements").delete().eq("student_id", user.id).eq("placement_id", placementId);
  revalidatePath("/student/saved");
}

export async function applyToPlacement(_state: StudentFormState, formData: FormData): Promise<StudentFormState> {
  const placementId = field(formData, "placementId");
  const coverLetter = field(formData, "coverLetter");
  const resumeDocumentId = field(formData, "resumeDocumentId");
  if (!/^[0-9a-f-]{36}$/i.test(placementId) || coverLetter.length > 10000 || resumeDocumentId && !/^[0-9a-f-]{36}$/i.test(resumeDocumentId)) return { message: "Check your application details and try again." };
  const { supabase } = await requireRole(["student"]);
  const { error } = await supabase.rpc("apply_to_placement", { p_placement_id: placementId, p_cover_letter: coverLetter || null, p_resume_document_id: resumeDocumentId || null });
  if (error) return { message: "We couldn’t submit this application. Check the eligibility requirements or your existing applications." };
  revalidatePath("/student/applications");
  revalidatePath("/student/dashboard");
  return { success: true, message: "Your application was submitted." };
}

export async function withdrawApplication(formData: FormData) {
  const applicationId = field(formData, "applicationId");
  if (!/^[0-9a-f-]{36}$/i.test(applicationId)) return;
  const { supabase, user } = await requireRole(["student"]);
  await supabase.from("applications").update({ status: "withdrawn" }).eq("id", applicationId).eq("student_id", user.id);
  revalidatePath("/student/applications");
  revalidatePath("/student/dashboard");
}

export async function markNotificationRead(formData: FormData) {
  const notificationId = field(formData, "notificationId");
  if (!/^[0-9a-f-]{36}$/i.test(notificationId)) return;
  const { supabase, user, profile } = await requireRole(["student", "employer", "admin", "super_admin"]);
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId).eq("user_id", user.id);
  revalidatePath(`/${profile.role === "super_admin" ? "admin" : profile.role}/notifications`);
}

export async function updateStudentVisibility(formData: FormData) {
  const visibility = field(formData, "profileVisibility");
  if (visibility !== "public" && visibility !== "private") return;
  const { supabase, user } = await requireRole(["student"]);
  await supabase.from("students").update({ profile_visibility: visibility === "public" }).eq("id", user.id);
  revalidatePath("/student/settings");
}

export async function uploadStudentDocument(_state: StudentFormState, formData: FormData): Promise<StudentFormState> {
  const { supabase, user } = await requireRole(["student"]);
  const file = formData.get("document");
  const documentType = field(formData, "documentType");
  const supportedTypes = new Set(["cv", "resume", "cover_letter", "transcript", "proof_of_enrollment", "portfolio", "other"]);
  const allowedMimeTypes = new Set(["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);
  if (!(file instanceof File) || file.size < 1 || file.size > 10 * 1024 * 1024 || !allowedMimeTypes.has(file.type) || !supportedTypes.has(documentType)) {
    return { message: "Choose a PDF or Word document no larger than 10 MB and select a document type." };
  }
  const safeName = file.name.normalize("NFKC").replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-180) || "document";
  const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;
  const { error: storageError } = await supabase.storage.from("aptora-documents").upload(path, file, { contentType: file.type, upsert: false });
  if (storageError) return { message: "We couldn’t upload the document. Please try again." };
  const { error: rowError } = await supabase.from("documents").insert({ owner_id: user.id, document_type: documentType as DocumentType, storage_path: path, original_filename: safeName, mime_type: file.type, file_size_bytes: file.size });
  if (rowError) {
    await supabase.storage.from("aptora-documents").remove([path]);
    return { message: "The document couldn’t be saved to your profile. Please try again." };
  }
  revalidatePath("/student/documents");
  return { success: true, message: "Your document has been uploaded." };
}

export async function deleteStudentDocument(formData: FormData) {
  const documentId = field(formData, "documentId");
  if (!/^[0-9a-f-]{36}$/i.test(documentId)) return;
  const { supabase, user } = await requireRole(["student"]);
  const { data: document } = await supabase.from("documents").select("storage_path").eq("id", documentId).eq("owner_id", user.id).maybeSingle();
  if (!document) return;
  const { error: storageError } = await supabase.storage.from("aptora-documents").remove([document.storage_path]);
  if (storageError) return;
  const { error } = await supabase.from("documents").delete().eq("id", documentId).eq("owner_id", user.id);
  if (!error) {
    revalidatePath("/student/documents");
    revalidatePath("/student/applications");
  }
}
