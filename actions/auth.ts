"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { employerSignUpSchema, newPasswordSchema, resetRequestSchema, signInSchema, studentSignUpSchema } from "@/lib/validations/auth";

export type AuthActionState = { message?: string; success?: boolean };

function value(formData: FormData, key: string) {
  const field = formData.get(key);
  return typeof field === "string" ? field : "";
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function signIn(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({ email: value(formData, "email"), password: value(formData, "password") });
  if (!parsed.success) return { message: "Enter a valid email and password." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { message: "We couldn’t sign you in with those details." };

  const { data: profile } = await supabase.from("profiles").select("role,status").eq("id", data.user.id).maybeSingle();
  if (!profile || profile.status !== "active") {
    await supabase.auth.signOut();
    return { message: "This account can’t access APTORA right now. Contact support if you need help." };
  }

  if (profile.role === "student") redirect("/student/dashboard");
  if (profile.role === "employer") redirect("/employer/dashboard");
  redirect("/admin/dashboard");
}

export async function signUpStudent(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = studentSignUpSchema.safeParse({
    fullName: value(formData, "fullName"), email: value(formData, "email"), password: value(formData, "password"),
    matricNumber: value(formData, "matricNumber"), faculty: value(formData, "faculty"), department: value(formData, "department"),
    courseOfStudy: value(formData, "courseOfStudy"), level: value(formData, "level"), phone: value(formData, "phone"),
  });
  if (!parsed.success) return { message: "Check each field and try again. Passwords must have at least 10 characters." };

  const { fullName, email, password, ...student } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email, password,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/callback?next=%2Fverify-email%3Fverified%3D1`,
      data: { role: "student", full_name: fullName, matric_number: student.matricNumber, faculty: student.faculty, department: student.department, course_of_study: student.courseOfStudy, level: student.level, phone: student.phone || null },
    },
  });
  if (error) return { message: "We couldn’t create that account. Check the details or contact support." };
  return { success: true, message: "Your account request is ready. Check your email to verify the address before signing in." };
}

export async function signUpEmployer(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = employerSignUpSchema.safeParse({
    fullName: value(formData, "fullName"), email: value(formData, "email"), password: value(formData, "password"),
    organizationName: value(formData, "organizationName"), organizationEmail: value(formData, "organizationEmail"),
    phone: value(formData, "phone"), address: value(formData, "address"), website: value(formData, "website"), description: value(formData, "description"),
  });
  if (!parsed.success) return { message: "Check each field and try again. Passwords must have at least 10 characters." };

  const employer = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: employer.email, password: employer.password,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/callback?next=%2Fverify-email%3Fverified%3D1`,
      data: { role: "employer", full_name: employer.fullName, organization_name: employer.organizationName, organization_email: employer.organizationEmail, address: employer.address, phone: employer.phone, website_url: employer.website || null, description: employer.description || null },
    },
  });
  if (error) return { message: "We couldn’t create that account. Check the details or contact support." };
  return { success: true, message: "Your organization account request is ready. Verify your email, then complete verification before publishing opportunities." };
}

export async function requestPasswordReset(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = resetRequestSchema.safeParse({ email: value(formData, "email") });
  if (!parsed.success) return { message: "Enter a valid email address." };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl()}/auth/callback?next=%2Freset-password`,
  });
  // Same response for known and unknown addresses to avoid account enumeration.
  return { success: true, message: "If an account uses that email, a password reset link will arrive shortly." };
}

export async function setNewPassword(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = newPasswordSchema.safeParse({ password: value(formData, "password"), confirmPassword: value(formData, "confirmPassword") });
  if (!parsed.success) return { message: "Use a password of at least 10 characters and make sure both entries match." };
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { message: "This reset link is no longer valid. Request another one." };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { message: "We couldn’t update the password. Request a fresh reset link and try again." };
  redirect("/login?password=updated");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
