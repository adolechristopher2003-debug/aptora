import type { ReactNode } from "react";
import { connection } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { DashboardShell } from "@/components/dashboard-shell";

export const instant = false;

export default async function StudentLayout({ children }: { children: ReactNode }) {
  await connection();
  const { profile } = await requireRole(["student"]);
  return <DashboardShell role="student" name={profile.full_name}>{children}</DashboardShell>;
}
