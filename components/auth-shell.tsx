import type { ReactNode } from "react";
import { PublicFooter, PublicHeader } from "@/components/public-chrome";

export function AuthShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  return <><PublicHeader /><main className="auth-page"><div className="auth-layout"><aside className="auth-intro"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p><div className="auth-side-note"><span className="live-dot" /> VERIFIED PLACEMENTS · CLEAR NEXT STEPS</div></aside><section className="auth-card">{children}</section></div></main><PublicFooter /></>;
}
