import { PublicPage } from "@/components/public-chrome";

export default function TermsPage() {
  return <PublicPage eyebrow="TERMS OF USE" title={<>Clear expectations<br /><em>for everyone.</em></>}>
    <p className="public-lead">These draft terms describe responsible use of the APTORA platform. They require review by the project owner before production use.</p>
    <article className="legal-content">
      <h2>Use the platform responsibly</h2><p>Provide accurate account, academic, and organization information. Use APTORA only for legitimate placement, recruitment, and coordination activities. Do not impersonate another person, submit misleading opportunities, or attempt to access records that do not belong to you.</p>
      <h2>Student accounts</h2><p>Students are responsible for the accuracy of their profile and application materials. Applying through APTORA does not guarantee an interview, offer, or placement. Employers make their own selection decisions.</p>
      <h2>Employer accounts</h2><p>Organizations must provide accurate information and receive administrative approval before publishing placements. Each listing should describe the role, eligibility criteria, location, duration, and application deadline honestly.</p>
      <h2>Recommendations and availability</h2><p>Matching scores are decision-support estimates based on profile and opportunity data. They may be incomplete or change as information changes. Users should review the full opportunity requirements before applying.</p>
      <h2>Platform access</h2><p>The project team may suspend accounts or remove listings that appear misleading, unsafe, or inconsistent with platform rules. APTORA may be unavailable during development or maintenance.</p>
      <h2>Academic project</h2><p>APTORA is an academic software project and does not claim official endorsement by the University of Ilorin. These draft terms are not a substitute for institution-approved legal terms.</p>
      <p className="legal-updated">Last reviewed: November 2026</p>
    </article>
  </PublicPage>;
}
