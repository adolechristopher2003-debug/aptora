import { z } from "zod";

export const employerProfileSchema = z.object({
  organizationName: z.string().trim().min(2).max(200), organizationType: z.string().trim().max(100).optional(),
  industry: z.string().trim().max(120).optional(), website: z.union([z.literal(""), z.url()]).optional(),
  organizationEmail: z.email().max(320), phone: z.string().trim().max(40).optional(), address: z.string().trim().min(5).max(300),
  city: z.string().trim().max(100).optional(), state: z.string().trim().max(100).optional(), description: z.string().trim().max(5000).optional(),
});

export const placementSchema = z.object({
  title: z.string().trim().min(5).max(180), slug: z.string().trim().max(180).optional(),
  category: z.string().trim().min(2).max(80), employmentType: z.enum(["internship", "siwes", "graduate", "industrial_training", "other"]),
  workMode: z.enum(["onsite", "hybrid", "remote"]), location: z.string().trim().min(2).max(180),
  description: z.string().trim().min(40).max(12000), responsibilities: z.string().max(5000).optional(),
  requiredSkills: z.string().max(1000).optional(), preferredSkills: z.string().max(1000).optional(), requiredDepartments: z.string().max(1000).optional(),
  minLevel: z.union([z.literal(""), z.coerce.number().int().min(100).max(800)]), maxLevel: z.union([z.literal(""), z.coerce.number().int().min(100).max(800)]),
  minCgpa: z.union([z.literal(""), z.coerce.number().min(0).max(5)]), siwesRequired: z.boolean(),
  durationWeeks: z.union([z.literal(""), z.coerce.number().int().min(1).max(104)]), slots: z.coerce.number().int().min(1).max(1000),
  applicationInstructions: z.string().max(4000).optional(), applicationDeadline: z.union([z.literal(""), z.iso.datetime({ local: true })]),
  startDate: z.union([z.literal(""), z.iso.date()]), endDate: z.union([z.literal(""), z.iso.date()]),
}).refine((data) => data.minLevel === "" || data.maxLevel === "" || Number(data.minLevel) <= Number(data.maxLevel), { path: ["maxLevel"], message: "Maximum level must be at least the minimum level." });
