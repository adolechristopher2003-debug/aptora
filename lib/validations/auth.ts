import { z } from "zod";
import { isUnilorinItDepartment } from "@/lib/data/unilorin-it-faculties";

const email = z.email().trim().max(320);
const password = z.string().min(10, "Use at least 10 characters.").max(128);

export const signInSchema = z.object({ email, password });
export const resetRequestSchema = z.object({ email });
export const newPasswordSchema = z.object({ password, confirmPassword: z.string() }).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"], message: "The passwords do not match.",
});

export const studentSignUpSchema = z.object({
  fullName: z.string().trim().min(2).max(160), email, password,
  matricNumber: z.string().trim().min(3).max(40), faculty: z.string().trim().min(2).max(180),
  department: z.string().trim().min(2).max(180), courseOfStudy: z.string().trim().min(2).max(180),
  level: z.coerce.number().int().min(100).max(800), phone: z.string().trim().max(40).optional(),
}).refine((data) => isUnilorinItDepartment(data.faculty, data.department), {
  path: ["department"], message: "Choose a department offered by the selected IT-related faculty.",
});

export const employerSignUpSchema = z.object({
  fullName: z.string().trim().min(2).max(160), email, password,
  organizationName: z.string().trim().min(2).max(200), organizationEmail: email,
  phone: z.string().trim().min(6).max(40), address: z.string().trim().min(5).max(300),
  website: z.union([z.literal(""), z.url().startsWith("http")]).optional(),
  description: z.string().trim().max(5000).optional(),
});

export const studentProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(160), phone: z.string().trim().max(40).optional(),
  address: z.string().trim().max(300).optional(), bio: z.string().trim().max(2000).optional(),
  linkedinUrl: z.union([z.literal(""), z.url()]).optional(), githubUrl: z.union([z.literal(""), z.url()]).optional(),
  portfolioUrl: z.union([z.literal(""), z.url()]).optional(),
});

export const studentAcademicSchema = z.object({
  faculty: z.string().trim().min(2).max(180), department: z.string().trim().min(2).max(180),
  courseOfStudy: z.string().trim().min(2).max(180), level: z.coerce.number().int().min(100).max(800),
  cgpa: z.union([z.literal(""), z.coerce.number().min(0).max(5)]),
  graduationYear: z.union([z.literal(""), z.coerce.number().int().min(2000).max(2150)]),
  siwesEligible: z.boolean(), preferredDurationWeeks: z.union([z.literal(""), z.coerce.number().int().min(1).max(104)]),
});
