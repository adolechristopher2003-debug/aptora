import { describe, expect, it } from "vitest";
import { employerSignUpSchema, newPasswordSchema, signInSchema, studentSignUpSchema } from "@/lib/validations/auth";

describe("authentication input validation", () => {
  it("accepts a valid login and rejects malformed email or short passwords", () => {
    expect(signInSchema.safeParse({ email: "student@example.com", password: "long-enough-password" }).success).toBe(true);
    expect(signInSchema.safeParse({ email: "not-an-email", password: "short" }).success).toBe(false);
  });

  it("limits public student registration data to validated student fields", () => {
    const valid = { fullName: "Ada Student", email: "ada@example.com", password: "long-enough-password", matricNumber: "UNI/24/001", faculty: "Engineering", department: "Computer Science", courseOfStudy: "Computer Science", level: "400" };
    expect(studentSignUpSchema.safeParse(valid).success).toBe(true);
    expect(studentSignUpSchema.safeParse({ ...valid, level: "900" }).success).toBe(false);
  });

  it("requires employer contact and organization information", () => {
    const valid = { fullName: "A. Recruiter", email: "recruiter@example.org", password: "long-enough-password", organizationName: "Example Labs", organizationEmail: "careers@example.org", phone: "+2348012345678", address: "12 Campus Road" };
    expect(employerSignUpSchema.safeParse(valid).success).toBe(true);
    expect(employerSignUpSchema.safeParse({ ...valid, organizationEmail: "invalid" }).success).toBe(false);
  });

  it("rejects password confirmation mismatches", () => {
    expect(newPasswordSchema.safeParse({ password: "new-password", confirmPassword: "new-password" }).success).toBe(true);
    expect(newPasswordSchema.safeParse({ password: "new-password", confirmPassword: "different" }).success).toBe(false);
  });
});
