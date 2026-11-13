import { PublicPage } from "@/components/public-chrome";

export default function PrivacyPage() {
  return <PublicPage eyebrow="PRIVACY" title={<>Your information<br /><em>deserves care.</em></>}>
    <p className="public-lead">This page describes the intended data practices for the APTORA platform. It should be reviewed and adapted by the project owner before any real deployment or collection of student data.</p>
    <article className="legal-content">
      <h2>Information used by APTORA</h2><p>When the platform is configured, account details, academic information, skills, career interests, applications, messages, uploaded documents, and account activity may be stored to provide placement services. Contact form messages are stored so an authorized administrator can respond.</p>
      <h2>How information is used</h2><p>Information supports account access, eligibility checks, explainable placement recommendations, application management, organization verification, platform security, and administrative oversight. Student academic and application records are intended to be visible only to the student, authorized administrators, and relevant employers for applications they receive.</p>
      <h2>Sharing and visibility</h2><p>Public visitors can see only approved and published opportunity information. Public listings do not include private employer contact details or student records. A student’s application information is shared with the employer receiving that application and authorized administrators.</p>
      <h2>Documents and security</h2><p>Documents are intended to be stored in private Supabase Storage buckets with ownership policies. Access controls reduce exposure but do not eliminate all risk. Do not upload information you are not authorized to share.</p>
      <h2>Retention and requests</h2><p>APTORA should retain information only as long as needed for placement workflows, academic administration, security, and applicable recordkeeping. Contact the platform administrator to request correction or deletion. Some records may need to be retained for application integrity or audit purposes.</p>
      <h2>Project status</h2><p>APTORA is an academic software project and does not claim official University of Ilorin endorsement. Before production use, the institution and project owner should review this notice, retention rules, consent flows, and applicable privacy obligations.</p>
      <p className="legal-updated">Last reviewed: November 2026</p>
    </article>
  </PublicPage>;
}
