import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/actions/auth", () => ({
  signIn: vi.fn(async () => ({})),
  signUpStudent: vi.fn(async () => ({})),
  signUpEmployer: vi.fn(async () => ({})),
  requestPasswordReset: vi.fn(async () => ({})),
  setNewPassword: vi.fn(async () => ({})),
}));

import { SignInForm } from "@/components/auth-forms";

describe("sign-in form", () => {
  it("exposes labeled required credentials and a password recovery link", () => {
    render(<SignInForm />);
    expect(screen.getByLabelText("Email address")).toBeRequired();
    expect(screen.getByLabelText("Password")).toBeRequired();
    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute("href", "/forgot-password");
    expect(screen.getByRole("button", { name: /sign in/i })).toBeEnabled();
  });
});
