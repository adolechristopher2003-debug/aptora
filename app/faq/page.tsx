import { PublicPage } from "@/components/public-chrome";

const questions = [
  ["Who can use APTORA?", "APTORA is designed for technology students at the University of Ilorin, organizations offering relevant industrial training or internship roles, and authorized placement coordinators."],
  ["Are organizations verified?", "Employers submit organization information for administrative review. Only approved employers and their published opportunities appear in public discovery."],
  ["How are placements recommended?", "Recommendations compare opportunity requirements with a student’s profile, including skills, academic eligibility, career interests, location, and duration preferences. The match score includes an explanation; it is guidance, not a guarantee of selection."],
  ["Can I apply without an account?", "Visitors can browse public opportunities. A verified student account is required to apply and manage application progress."],
  ["Who decides whether I am selected?", "Employers review applications and make selection decisions. APTORA supports discovery and communication; it does not guarantee a placement."],
  ["What if an opportunity looks incorrect?", "Use the Contact page to share the opportunity title and what appears wrong. Do not include passwords or sensitive documents."],
];

export default function FaqPage() {
  return <PublicPage eyebrow="FREQUENTLY ASKED QUESTIONS" title={<>A few things worth<br /><em>knowing up front.</em></>}>
    <p className="public-lead">Here are answers to common questions about accounts, verification, recommendations, and applications.</p>
    <div className="faq-list">{questions.map(([question, answer], index) => <details key={question} open={index === 0}><summary><span>{question}</span><i aria-hidden="true">＋</i></summary><p>{answer}</p></details>)}</div>
  </PublicPage>;
}
