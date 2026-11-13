"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { employerProfileSchema, placementSchema } from "@/lib/validations/employer";

export type EmployerFormState = { message?: string; success?: boolean };
const field = (data: FormData, key: string) => { const value = data.get(key); return typeof value === "string" ? value.trim() : ""; };
const csv = (value: string) => [...new Set(value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean))];

function parsePlacement(formData: FormData) {
  return placementSchema.safeParse({
    title: field(formData, "title"), category: field(formData, "category"), employmentType: field(formData, "employmentType"),
    workMode: field(formData, "workMode"), location: field(formData, "location"), description: field(formData, "description"),
    responsibilities: field(formData, "responsibilities"), requiredSkills: field(formData, "requiredSkills"),
    preferredSkills: field(formData, "preferredSkills"), requiredDepartments: field(formData, "requiredDepartments"),
    minLevel: field(formData, "minLevel"), maxLevel: field(formData, "maxLevel"), minCgpa: field(formData, "minCgpa"),
    siwesRequired: formData.get("siwesRequired") === "on", durationWeeks: field(formData, "durationWeeks"),
    slots: field(formData, "slots") || 1, applicationInstructions: field(formData, "applicationInstructions"),
    applicationDeadline: field(formData, "applicationDeadline"), startDate: field(formData, "startDate"), endDate: field(formData, "endDate"),
  });
}

function placementData(data: ReturnType<typeof placementSchema.parse>) {
  return {
    title: data.title, category: data.category, employment_type: data.employmentType, work_mode: data.workMode,
    location: data.location, description: data.description, responsibilities: csv(data.responsibilities || ""),
    required_skills: csv(data.requiredSkills || ""), preferred_skills: csv(data.preferredSkills || ""),
    required_departments: csv(data.requiredDepartments || ""), min_level: data.minLevel === "" ? null : data.minLevel,
    max_level: data.maxLevel === "" ? null : data.maxLevel, min_cgpa: data.minCgpa === "" ? null : data.minCgpa,
    siwes_required: data.siwesRequired, duration_weeks: data.durationWeeks === "" ? null : data.durationWeeks,
    slots: data.slots, application_instructions: data.applicationInstructions || null,
    application_deadline: data.applicationDeadline ? new Date(data.applicationDeadline).toISOString() : null,
    start_date: data.startDate || null, end_date: data.endDate || null,
  };
}

export async function updateEmployerProfile(_state: EmployerFormState, formData: FormData): Promise<EmployerFormState> {
  const parsed = employerProfileSchema.safeParse({
    organizationName: field(formData, "organizationName"), organizationType: field(formData, "organizationType"), industry: field(formData, "industry"),
    website: field(formData, "website"), organizationEmail: field(formData, "organizationEmail"), phone: field(formData, "phone"),
    address: field(formData, "address"), city: field(formData, "city"), state: field(formData, "state"), description: field(formData, "description"),
  });
  if (!parsed.success) return { message: "Check the organization details and try again." };
  const { supabase, user } = await requireRole(["employer"]);
  const data = parsed.data;
  const { error } = await supabase.from("employers").update({ organization_name: data.organizationName, organization_type: data.organizationType || null, industry: data.industry || null, website_url: data.website || null, organization_email: data.organizationEmail, organization_phone: data.phone || null, address: data.address, city: data.city || null, state: data.state || null, description: data.description || null }).eq("id", user.id);
  if (error) return { message: "We couldn’t save the organization profile." };
  revalidatePath("/employer");
  return { success: true, message: "Organization profile updated." };
}

export async function createPlacement(_state: EmployerFormState, formData: FormData): Promise<EmployerFormState> {
  const parsed = parsePlacement(formData);
  if (!parsed.success) return { message: "Check the placement details and required fields before saving." };
  const { supabase, user } = await requireRole(["employer"]);
  const slugBase = parsed.data.title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 150) || "placement";
  const { error } = await supabase.from("placements").insert({ ...placementData(parsed.data), employer_id: user.id, slug: `${slugBase}-${crypto.randomUUID().slice(0, 8)}` });
  if (error) return { message: "We couldn’t save this draft. Check the placement details and try again." };
  revalidatePath("/employer/placements");
  revalidatePath("/employer/dashboard");
  return { success: true, message: "Placement draft saved." };
}

export async function updatePlacement(_state: EmployerFormState, formData: FormData): Promise<EmployerFormState> {
  const placementId = field(formData, "placementId");
  const parsed = parsePlacement(formData);
  if (!/^[0-9a-f-]{36}$/i.test(placementId) || !parsed.success) return { message: "Check the placement details and try again." };
  const { supabase, user } = await requireRole(["employer"]);
  const { error } = await supabase.from("placements").update(placementData(parsed.data)).eq("id", placementId).eq("employer_id", user.id);
  if (error) return { message: "We couldn’t update this placement. Only your own placements can be edited." };
  revalidatePath("/employer/placements");
  revalidatePath(`/employer/placements/${placementId}`);
  return { success: true, message: "Placement draft updated." };
}

export async function submitPlacementForReview(formData: FormData) {
  const placementId = field(formData, "placementId");
  if (!/^[0-9a-f-]{36}$/i.test(placementId)) return;
  const { supabase, user } = await requireRole(["employer"]);
  await supabase.from("placements").update({ status: "pending_review" }).eq("id", placementId).eq("employer_id", user.id).in("status", ["draft", "rejected"]);
  revalidatePath("/employer/placements");
  revalidatePath(`/employer/placements/${placementId}`);
}

export async function closeEmployerPlacement(formData: FormData) {
  const placementId = field(formData, "placementId");
  if (!/^[0-9a-f-]{36}$/i.test(placementId)) return;
  const { supabase, user } = await requireRole(["employer"]);
  await supabase.from("placements").update({ status: "closed" }).eq("id", placementId).eq("employer_id", user.id).eq("status", "published");
  revalidatePath(`/employer/placements/${placementId}`);
  revalidatePath("/employer/placements");
}

export async function reviewEmployerApplication(_state: EmployerFormState, formData: FormData): Promise<EmployerFormState> {
  const applicationId = field(formData, "applicationId");
  const status = field(formData, "status");
  const notes = field(formData, "employerNotes");
  const allowed = new Set(["under_review", "shortlisted", "interview", "accepted", "rejected"]);
  if (!/^[0-9a-f-]{36}$/i.test(applicationId) || !allowed.has(status) || notes.length > 5000) return { message: "Check the review status and notes." };
  const { supabase } = await requireRole(["employer"]);
  const { error } = await supabase.from("applications").update({ status: status as "under_review", employer_notes: notes || null }).eq("id", applicationId);
  if (error) return { message: "We couldn’t save the application review. It may have already reached a final status." };
  revalidatePath("/employer/applications");
  revalidatePath("/employer/dashboard");
  return { success: true, message: "Application review saved." };
}

export async function uploadEmployerVerificationDocument(_state: EmployerFormState, formData: FormData): Promise<EmployerFormState> {
  const { supabase, user } = await requireRole(["employer"]);
  const file = formData.get("document");
  const allowed = new Set(["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);
  if (!(file instanceof File) || file.size < 1 || file.size > 10 * 1024 * 1024 || !allowed.has(file.type)) return { message: "Choose a PDF or Word document up to 10 MB." };
  const safeName = file.name.normalize("NFKC").replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-180) || "verification-document";
  const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;
  const { error: storageError } = await supabase.storage.from("aptora-documents").upload(path, file, { contentType: file.type, upsert: false });
  if (storageError) return { message: "We couldn’t upload this document." };
  const { error: rowError } = await supabase.from("documents").insert({ owner_id: user.id, document_type: "employer_verification", storage_path: path, original_filename: safeName, mime_type: file.type, file_size_bytes: file.size });
  if (rowError) {
    await supabase.storage.from("aptora-documents").remove([path]);
    return { message: "We couldn’t save the verification document." };
  }
  revalidatePath("/employer/verification");
  return { success: true, message: "Verification document uploaded." };
}
