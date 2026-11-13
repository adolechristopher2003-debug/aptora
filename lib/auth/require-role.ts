import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/database";

export async function requireRole(allowed: AppRole[]) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) redirect("/login");

  const { data: profile, error } = await supabase.from("profiles").select("role,status,full_name,phone").eq("id", authData.user.id).maybeSingle();
  if (error || !profile || profile.status !== "active") redirect("/login?error=account");
  if (!allowed.includes(profile.role)) redirect("/unauthorized");

  return { supabase, user: authData.user, profile };
}
