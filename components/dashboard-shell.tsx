import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { signOut } from "@/actions/auth";
import type { AppRole } from "@/types/database";
import { ThemeControl } from "@/components/theme-control";
import { DashboardNav, type DashboardNavItem } from "@/components/dashboard-nav";

const menus: Record<AppRole, DashboardNavItem[]> = {
  student: [
    { label: "Overview", href: "/student/dashboard", icon: "home" }, { label: "My profile", href: "/student/profile", icon: "profile" },
    { label: "Academic information", href: "/student/academics", icon: "academic" }, { label: "Technical skills", href: "/student/skills", icon: "skills" },
    { label: "Career interests", href: "/student/interests", icon: "interests" }, { label: "Find placements", href: "/student/opportunities", icon: "search" },
    { label: "Recommendations", href: "/student/recommendations", icon: "recommend" }, { label: "My applications", href: "/student/applications", icon: "applications" },
    { label: "Saved placements", href: "/student/saved", icon: "saved" }, { label: "Notifications", href: "/student/notifications", icon: "notifications" },
    { label: "Documents", href: "/student/documents", icon: "documents" }, { label: "Settings", href: "/student/settings", icon: "settings" },
  ],
  employer: [
    { label: "Overview", href: "/employer/dashboard", icon: "home" }, { label: "Organization profile", href: "/employer/profile", icon: "profile" },
    { label: "Verification", href: "/employer/verification", icon: "verification" }, { label: "Placements", href: "/employer/placements", icon: "placements" },
    { label: "Applications", href: "/employer/applications", icon: "applications" }, { label: "Notifications", href: "/employer/notifications", icon: "notifications" },
    { label: "Settings", href: "/employer/settings", icon: "settings" },
  ],
  admin: [
    { label: "Overview", href: "/admin/dashboard", icon: "home" }, { label: "Students", href: "/admin/students", icon: "profile" },
    { label: "Employers", href: "/admin/employers", icon: "employers" }, { label: "Verifications", href: "/admin/verifications", icon: "verification" },
    { label: "Placements", href: "/admin/placements", icon: "placements" }, { label: "Applications", href: "/admin/applications", icon: "applications" },
    { label: "Analytics", href: "/admin/analytics", icon: "analytics" }, { label: "Contact messages", href: "/admin/messages", icon: "messages" },
    { label: "Notifications", href: "/admin/notifications", icon: "notifications" }, { label: "Audit log", href: "/admin/audit-logs", icon: "audit" },
    { label: "Matching settings", href: "/admin/settings", icon: "settings" },
  ],
  super_admin: [],
};
menus.super_admin = menus.admin;

export function DashboardShell({ role, name, children }: { role: AppRole; name: string; children: ReactNode }) {
  const dashboardTitle = role === "super_admin" ? "Super admin" : role[0].toUpperCase() + role.slice(1);
  return <div className="dashboard-frame">
    <aside className="dashboard-sidebar">
      <Link className="brand" href="/" aria-label="Aptora home"><Image className="brand-logo" src="/android-chrome-512x512.png" alt="" width={39} height={39} priority /> aptora</Link>
      <span className="dashboard-role">{dashboardTitle} workspace</span>
      <DashboardNav items={menus[role]} />
      <div className="sidebar-bottom"><Link href="/faq"><span aria-hidden="true">?</span> Help and support</Link><form action={signOut}><button type="submit"><span aria-hidden="true">↪</span> Sign out</button></form></div>
    </aside>
    <div className="dashboard-main">
      <header className="dashboard-header"><div><span className="dashboard-role">{dashboardTitle} workspace</span><p>{name}</p></div><ThemeControl /><Link className="dashboard-avatar" href={role === "student" ? "/student/profile" : role === "employer" ? "/employer/profile" : "/admin/settings"} aria-label="Open profile settings">{name.slice(0, 1).toUpperCase()}</Link></header>
      <main className="dashboard-content">{children}</main>
    </div>
    <DashboardNav items={menus[role]} mobile />
  </div>;
}
