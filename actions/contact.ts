"use server";

import { redirect } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";

function textField(data: FormData, name: string) {
  const value = data.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitContactMessage(formData: FormData) {
  const name = textField(formData, "name");
  const email = textField(formData, "email");
  const subject = textField(formData, "subject");
  const message = textField(formData, "message");

  if (name.length < 2 || name.length > 160 || email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || subject.length < 2 || subject.length > 180 || message.length < 10 || message.length > 5000) {
    redirect("/contact?state=invalid");
  }

  const client = createPublicClient();
  if (!client) redirect("/contact?state=unavailable");

  const { error } = await client.rpc("submit_contact_message", {
    p_name: name,
    p_email: email,
    p_subject: subject,
    p_message: message,
  });

  if (error) redirect("/contact?state=unavailable");
  redirect("/contact?state=sent");
}
