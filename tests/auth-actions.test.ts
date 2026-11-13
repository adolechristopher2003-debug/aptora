import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const profile = vi.fn();
  const supabase = {
    auth: {
      signInWithPassword: vi.fn(), signUp: vi.fn(), signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(), getUser: vi.fn(), updateUser: vi.fn(),
    },
    from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: profile })) })) })),
  };
  return { profile, supabase, redirect: vi.fn((path: string) => { throw new Error(`REDIRECT:${path}`); }) };
});

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn(async () => mocks.supabase) }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { requestPasswordReset, setNewPassword, signIn, signUpEmployer, signUpStudent } from "@/actions/auth";

function form(values: Record<string, string>) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

describe("authentication server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SITE_URL = "https://aptora.example";
  });

  it("registers a student with a fixed student role and verification callback", async () => {
    mocks.supabase.auth.signUp.mockResolvedValue({ error: null });
    const result = await signUpStudent({}, form({ fullName: "A Student", email: "student@example.com", password: "long-password", matricNumber: "UNI/24/001", faculty: "Engineering", department: "Computer Science", courseOfStudy: "Computer Science", level: "400" }));
    expect(result.success).toBe(true);
    expect(mocks.supabase.auth.signUp).toHaveBeenCalledWith(expect.objectContaining({ options: expect.objectContaining({ data: expect.objectContaining({ role: "student" }), emailRedirectTo: expect.stringContaining("/auth/callback") }) }));
  });

  it("registers an employer with a fixed employer role", async () => {
    mocks.supabase.auth.signUp.mockResolvedValue({ error: null });
    const result = await signUpEmployer({}, form({ fullName: "Recruiter", email: "recruiter@example.com", password: "long-password", organizationName: "Example Labs", organizationEmail: "jobs@example.com", phone: "+2348012345678", address: "12 Campus Road" }));
    expect(result.success).toBe(true);
    expect(mocks.supabase.auth.signUp).toHaveBeenCalledWith(expect.objectContaining({ options: expect.objectContaining({ data: expect.objectContaining({ role: "employer" }) }) }));
  });

  it("routes active student and employer profiles to their own dashboards", async () => {
    mocks.supabase.auth.signInWithPassword.mockResolvedValue({ data: { user: { id: "user-id" } }, error: null });
    mocks.profile.mockResolvedValueOnce({ data: { role: "student", status: "active" } });
    await expect(signIn({}, form({ email: "student@example.com", password: "long-password" }))).rejects.toThrow("REDIRECT:/student/dashboard");
    mocks.supabase.auth.signInWithPassword.mockResolvedValue({ data: { user: { id: "user-id" } }, error: null });
    mocks.profile.mockResolvedValueOnce({ data: { role: "employer", status: "active" } });
    await expect(signIn({}, form({ email: "employer@example.com", password: "long-password" }))).rejects.toThrow("REDIRECT:/employer/dashboard");
  });

  it("uses the same password reset response even when Supabase reports an error", async () => {
    mocks.supabase.auth.resetPasswordForEmail.mockResolvedValue({ error: new Error("unknown account") });
    const result = await requestPasswordReset({}, form({ email: "person@example.com" }));
    expect(result.success).toBe(true);
    expect(result.message).toContain("If an account uses that email");
    expect(mocks.supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith("person@example.com", expect.objectContaining({ redirectTo: expect.stringContaining("/auth/callback") }));
  });

  it("requires a valid recovery session before changing a password", async () => {
    mocks.supabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error("expired") });
    const result = await setNewPassword({}, form({ password: "new-password", confirmPassword: "new-password" }));
    expect(result.success).not.toBe(true);
    expect(mocks.supabase.auth.updateUser).not.toHaveBeenCalled();
  });

  it("updates a password in a valid recovery session and returns to login", async () => {
    mocks.supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user-id" } }, error: null });
    mocks.supabase.auth.updateUser.mockResolvedValue({ error: null });
    await expect(setNewPassword({}, form({ password: "new-password", confirmPassword: "new-password" }))).rejects.toThrow("REDIRECT:/login?password=updated");
    expect(mocks.supabase.auth.updateUser).toHaveBeenCalledWith({ password: "new-password" });
  });
});
