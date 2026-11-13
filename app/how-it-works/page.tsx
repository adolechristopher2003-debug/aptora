import { PublicPage } from "@/components/public-chrome";

const workflows = [
  { role: "STUDENT JOURNEY", steps: ["Create an account and complete your profile.", "Add your academic details, technical skills, and interests.", "Review opportunities and see why each recommendation may fit.", "Apply, then follow status updates and messages in one place."] },
  { role: "EMPLOYER JOURNEY", steps: ["Create an organization account and submit verification information.", "After approval, publish a detailed technology placement.", "Review applications from eligible students.", "Update application progress and communicate with candidates."] },
  { role: "COORDINATOR JOURNEY", steps: ["Review employer verification requests and supporting information.", "Approve suitable opportunities before they appear publicly.", "Monitor applications and placement activity.", "Use reports and audit history to support oversight."] },
];

export default function HowItWorksPage() {
  return <PublicPage eyebrow="HOW IT WORKS" title={<>A practical path from<br /><em>interest to opportunity.</em></>}>
    <p className="public-lead">APTORA brings each part of the placement journey into a shared workflow, with clear steps for students, employers, and university coordinators.</p>
    <div className="workflow-list">{workflows.map((workflow, index) => <section className="workflow-row" key={workflow.role}><div className="workflow-label"><span className="public-number">0{index + 1}</span><span>{workflow.role}</span></div><ol>{workflow.steps.map((step, stepIndex) => <li key={step}><span>{String(stepIndex + 1).padStart(2, "0")}</span>{step}</li>)}</ol></section>)}</div>
    <p className="public-disclaimer">Recommendations are decision support. Placement eligibility and selection are confirmed through the published requirements and the employer’s review.</p>
  </PublicPage>;
}
