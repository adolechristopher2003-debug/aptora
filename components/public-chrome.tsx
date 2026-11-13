import Link from "next/link";
import Image from "next/image";
import { ThemeControl } from "@/components/theme-control";

export function PublicHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Aptora home"><Image className="brand-logo" src="/android-chrome-512x512.png" alt="" width={38} height={38} priority /> aptora</Link>
      <nav className="main-nav" aria-label="Main navigation">
        <Link href="/about">About</Link><Link href="/how-it-works">How it works</Link><Link href="/opportunities">Opportunities</Link><Link href="/contact">Contact</Link>
      </nav>
      <div className="header-actions"><ThemeControl /><Link className="login-link" href="/login">Sign in</Link><Link className="button button-dark button-small" href="/register">Get started <span aria-hidden="true">↗</span></Link></div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="site-footer"><div className="section-wrap footer-inner">
      <Link className="brand" href="/" aria-label="Aptora home"><Image className="brand-logo" src="/android-chrome-512x512.png" alt="" width={34} height={34} /> aptora</Link>
      <p>A more considered start to your technology career.</p>
      <div className="footer-links"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/faq">FAQs</Link><span>University of Ilorin · Nigeria</span></div>
      <small>© Aptora</small>
    </div></footer>
  );
}

export function PublicPage({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children: React.ReactNode }) {
  return <><PublicHeader /><main className="public-page"><div className="section-wrap"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{children}</div></main><PublicFooter /></>;
}
