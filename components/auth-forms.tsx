"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { requestPasswordReset, setNewPassword, signIn, signUpEmployer, signUpStudent, type AuthActionState } from "@/actions/auth";
import { unilorinItFaculties } from "@/lib/data/unilorin-it-faculties";

function Feedback({ state }: { state: AuthActionState }) {
  if (!state.message) return null;
  return <p className={`form-message ${state.success ? "success" : "error"}`} role={state.success ? "status" : "alert"}>{state.message}</p>;
}

function Field({ label, name, type = "text", required = true, minLength, maxLength, autoComplete, placeholder }: { label: string; name: string; type?: string; required?: boolean; minLength?: number; maxLength?: number; autoComplete?: string; placeholder?: string }) {
  return <label className="auth-field">{label}<input name={name} type={type} required={required} minLength={minLength} maxLength={maxLength} autoComplete={autoComplete} placeholder={placeholder} /></label>;
}

export function SignInForm() {
  const [state, action, pending] = useActionState(signIn, {});
  return <form className="auth-form" action={action}><Feedback state={state} />
    <Field label="Email address" name="email" type="email" autoComplete="email" />
    <Field label="Password" name="password" type="password" autoComplete="current-password" />
    <div className="auth-form-row"><Link href="/forgot-password">Forgot password?</Link></div>
    <button className="button button-blue auth-submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}<span aria-hidden="true">↗</span></button>
  </form>;
}

export function StudentSignUpForm() {
  const [state, action, pending] = useActionState(signUpStudent, {});
  const [faculty, setFaculty] = useState("");
  const [courseOfStudy, setCourseOfStudy] = useState("");
  const departments = unilorinItFaculties.find((entry) => entry.name === faculty)?.departments ?? [];
  return <form className="auth-form" action={action}><Feedback state={state} />
    <div className="auth-field-grid"><Field label="Full name" name="fullName" autoComplete="name" /><Field label="Matriculation number" name="matricNumber" maxLength={40} />
      <Field label="Email address" name="email" type="email" autoComplete="email" /><Field label="Phone number" name="phone" type="tel" autoComplete="tel" required={false} />
      <label className="auth-field">Faculty<select name="faculty" required value={faculty} onChange={(event) => setFaculty(event.target.value)}><option value="" disabled>Select faculty</option>{unilorinItFaculties.map((entry) => <option key={entry.name} value={entry.name}>{entry.name}</option>)}</select></label>
      <label className="auth-field">Department<select key={faculty} name="department" required defaultValue="" disabled={!faculty} onChange={(event) => setCourseOfStudy(event.target.value)}><option value="" disabled>{faculty ? "Select department" : "Select a faculty first"}</option>{departments.map((department) => <option key={department} value={department}>{department}</option>)}</select></label>
      <label className="auth-field">Course of study<input name="courseOfStudy" value={courseOfStudy} onChange={(event) => setCourseOfStudy(event.target.value)} required minLength={2} maxLength={180} /></label><label className="auth-field">Academic level<select name="level" required defaultValue=""><option value="" disabled>Select level</option>{[100,200,300,400,500,600,700,800].map((level) => <option key={level} value={level}>{level} level</option>)}</select></label>
      <Field label="Password (10+ characters)" name="password" type="password" minLength={10} autoComplete="new-password" />
    </div>
    <p className="auth-legal-note">By creating an account, you agree to the <Link href="/terms">Terms</Link> and acknowledge the <Link href="/privacy">Privacy notice</Link>.</p>
    <button className="button button-blue auth-submit" disabled={pending}>{pending ? "Creating account…" : "Create student account"}<span aria-hidden="true">↗</span></button>
  </form>;
}

export function EmployerSignUpForm() {
  const [state, action, pending] = useActionState(signUpEmployer, {});
  return <form className="auth-form" action={action}><Feedback state={state} />
    <div className="auth-field-grid"><Field label="Contact person's full name" name="fullName" autoComplete="name" />
      <Field label="Account email" name="email" type="email" autoComplete="email" /><Field label="Official organization email" name="organizationEmail" type="email" />
      <Field label="Organization name" name="organizationName" /><Field label="Phone number" name="phone" type="tel" autoComplete="tel" />
      <Field label="Website" name="website" type="url" required={false} placeholder="https://" />
      <Field label="Organization address" name="address" maxLength={300} />
      <Field label="Password (10+ characters)" name="password" type="password" minLength={10} autoComplete="new-password" />
    </div>
    <label className="auth-field">Organization description<textarea name="description" rows={4} maxLength={5000} /></label>
    <p className="auth-legal-note">Employer accounts need administrative verification before they can publish opportunities. <Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link>.</p>
    <button className="button button-blue auth-submit" disabled={pending}>{pending ? "Creating account…" : "Create employer account"}<span aria-hidden="true">↗</span></button>
  </form>;
}

export function PasswordResetRequestForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, {});
  return <form className="auth-form" action={action}><Feedback state={state} /><Field label="Email address" name="email" type="email" autoComplete="email" /><button className="button button-blue auth-submit" disabled={pending}>{pending ? "Sending…" : "Send reset link"}<span aria-hidden="true">↗</span></button></form>;
}

export function SetNewPasswordForm() {
  const [state, action, pending] = useActionState(setNewPassword, {});
  return <form className="auth-form" action={action}><Feedback state={state} /><Field label="New password (10+ characters)" name="password" type="password" minLength={10} autoComplete="new-password" /><Field label="Confirm new password" name="confirmPassword" type="password" minLength={10} autoComplete="new-password" /><button className="button button-blue auth-submit" disabled={pending}>{pending ? "Updating…" : "Update password"}<span aria-hidden="true">↗</span></button></form>;
}
