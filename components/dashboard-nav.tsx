"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export type DashboardNavItem = { label: string; href: string; icon: string };

const icons: Record<string, ReactNode> = {
  home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></>,
  profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  academic: <><path d="m2 9 10-5 10 5-10 5z" /><path d="M6 11v5c3 3 9 3 12 0v-5M22 9v6" /></>,
  skills: <><path d="m12 3 2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5z" /><path d="m19 16 1.2 2.8L23 20l-2.8 1.2L19 24l-1.2-2.8L15 20l2.8-1.2z" /></>,
  interests: <><path d="M20.8 8.6c0 5.4-8.8 11-8.8 11s-8.8-5.6-8.8-11A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.4Z" /></>,
  search: <><circle cx="10.8" cy="10.8" r="7.3" /><path d="m16.2 16.2 5 5" /></>,
  recommend: <><path d="m12 3 2.4 5.1 5.6.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.6-.8z" /></>,
  applications: <><path d="M7 3h8l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M15 3v5h5M9 13h6M9 17h6" /></>,
  saved: <><path d="M6 4h12v17l-6-4-6 4z" /></>,
  notifications: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
  documents: <><path d="M7 3h8l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M15 3v5h5M9 13h6M9 17h6" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.7-1.4-2.4 1.4-1.1A7 7 0 0 1 7 13l-1.8-.3V9.9L7 9.6a7 7 0 0 1 .5-1.7L6.1 6.8l1.4-2.4 1.7.7a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 .5 1.7l1.8.3v2.8l-1.8.3a7 7 0 0 1-.5 2Z" /></>,
  employers: <><path d="M3 21V6l9-3 9 3v15M8 9h2m4 0h2M8 13h2m4 0h2M10 21v-4h4v4" /></>,
  verification: <><path d="M12 3 20 6v6c0 5-3.4 8-8 10-4.6-2-8-5-8-10V6z" /><path d="m8.5 12 2.3 2.3 4.7-4.7" /></>,
  placements: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2" /></>,
  analytics: <><path d="M4 20V10m5 10V4m5 16v-7m5 7V7" /></>,
  messages: <><path d="M4 5h16v12H9l-5 4z" /><path d="M8 9h8m-8 4h5" /></>,
  audit: <><path d="M5 4h14v17H5zM8 8h8m-8 4h8m-8 4h5" /></>,
};

export function DashboardNav({ items, mobile = false }: { items: DashboardNavItem[]; mobile?: boolean }) {
  const pathname = usePathname();
  return <nav className={mobile ? "mobile-dashboard-nav" : "dashboard-nav"} aria-label={mobile ? "Quick navigation" : "Dashboard navigation"}>
    {items.map((item) => {
      const active = pathname === item.href || (item.href !== "/student/dashboard" && pathname.startsWith(`${item.href}/`));
      return <Link href={item.href} key={item.href} aria-current={active ? "page" : undefined} className={active ? "is-active" : undefined}>
        <svg className="dashboard-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[item.icon] ?? icons.home}</svg>
        <span>{item.label}</span>
      </Link>;
    })}
  </nav>;
}
