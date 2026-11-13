import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { PublicStatistics } from "@/components/public-statistics";
import { FeaturedOpportunities } from "@/components/featured-opportunities";

const steps = [
  ["01", "Build your profile", "Share your academic background, skills, and placement interests."],
  ["02", "Find your fit", "Explore opportunities matched to your qualifications and goals."],
  ["03", "Apply with clarity", "Understand why a role fits and keep your applications in one place."],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Aptora home">
        <Image className="brand-logo" src="/android-chrome-512x512.png" alt="" width={38} height={38} priority />
        aptora</Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link href="/about">About</Link><Link href="/how-it-works">How it works</Link><Link href="/opportunities">Opportunities</Link><Link href="/contact">Contact</Link>
        </nav>
        <div className="header-actions"><Link className="login-link" href="/login">Sign in</Link><Link className="button button-dark button-small" href="/register">Get started <span aria-hidden="true">↗</span></Link></div>
      </header>

      <section className="hero section-wrap">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> PLACEMENT, WITH PURPOSE</div>
          <h1>Good work starts<br />with the <span>right fit.</span></h1>
          <p className="hero-description">A clearer path from what you’re learning to where you can make an impact. Discover technology placements built around your skills and ambitions.</p>
          <div className="hero-actions"><Link className="button button-blue" href="/register">Find your placement <span aria-hidden="true">↗</span></Link><Link className="text-link" href="/opportunities">Explore opportunities <span aria-hidden="true">→</span></Link></div>
          <div className="hero-note"><div className="avatar-stack" aria-hidden="true"><span>✳</span><span>U</span><span>+</span></div><span>Made for technology students<br /><strong>at the University of Ilorin</strong></span></div>
        </div>

        <div className="hero-art" aria-label="Illustration of an opportunity match">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="orbit-label label-top">YOUR NEXT CHAPTER</div><div className="orbit-label label-bottom">BUILT AROUND YOU</div>
          <div className="match-card">
            <div className="match-card-top"><span className="match-tag"><span className="live-dot" /> STRONG MATCH</span><span className="bookmark-mark">⌑</span></div>
            <div className="company-symbol">n<span>✳</span></div>
            <p className="card-kicker">SOFTWARE · HYBRID</p>
            <h2>Frontend Engineering<br />Intern</h2>
            <p className="company-name">Northstar Labs <span>↗</span></p>
            <div className="match-divider" />
            <div className="match-score-row"><div className="score-ring"><span>92</span></div><div><strong>A fit that makes sense.</strong><small>Your skills align with this role.</small></div></div>
            <div className="skill-pills"><span>React</span><span>TypeScript</span><span>UI Design</span></div>
          </div>
          <div className="floating-note"><span className="floating-icon">✳</span><span><strong>Made for your next step</strong><small>Skills. Goals. Opportunity.</small></span></div>
          <div className="decor-star star-a">✳</div><div className="decor-star star-b">✦</div>
        </div>
        <div className="hero-index"><span>01</span><i /> A MORE CONSIDERED WAY TO BEGIN</div>
      </section>

      <Suspense fallback={<section className="trust-strip"><div className="section-wrap trust-inner"><span>PLATFORM ACTIVITY</span><p className="stats-empty">Loading live platform counts…</p></div></section>}><PublicStatistics /></Suspense>

      <Suspense fallback={<section className="featured-section"><div className="section-wrap featured-empty">Loading verified opportunities…</div></section>}><FeaturedOpportunities /></Suspense>

      <section className="steps-section section-wrap">
        <div className="section-heading"><div><div className="eyebrow">A BETTER WAY THROUGH</div><h2>Make your next move<br />a <span>thoughtful one.</span></h2></div><p>Less guesswork. More momentum. A placement journey that starts with your potential and keeps you in control.</p></div>
        <div className="steps-grid">{steps.map(([number, title, description]) => <article className="step-card" key={number}><div className="step-top"><span>{number}</span><i>↗</i></div><div className={`step-glyph glyph-${number}`} aria-hidden="true">{number === "01" ? "◎" : number === "02" ? "✳" : "↗"}</div><h3>{title}</h3><p>{description}</p></article>)}</div>
      </section>

      <section className="closing-cta"><div className="section-wrap closing-inner"><div className="eyebrow"><span className="live-dot" /> YOUR NEXT CHAPTER STARTS HERE</div><h2>Let’s find the work<br />that <span>moves you forward.</span></h2><Link className="button button-white" href="/register">Create your profile <span aria-hidden="true">↗</span></Link><div className="cta-orb" aria-hidden="true">a</div></div></section>

      <footer className="site-footer"><div className="section-wrap footer-inner"><Link className="brand" href="/"><span className="brand-mark">a</span> aptora</Link><p>A more considered start to your technology career.</p><div className="footer-links"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/faq">FAQs</Link><span>University of Ilorin · Nigeria</span></div><small>© Aptora</small></div></footer>
    </main>
  );
}
