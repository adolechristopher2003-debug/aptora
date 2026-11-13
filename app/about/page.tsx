import { PublicPage } from "@/components/public-chrome";

const audiences = [
  ["For students", "Discover technology placements relevant to your course, skills, eligibility, and interests. Keep applications and progress together."],
  ["For employers", "Reach students whose academic background and technical interests fit the work you offer, with a clear placement review process."],
  ["For coordinators", "Review employers and opportunities, follow placement activity, and support a more transparent industrial training process."],
];

export default function AboutPage() {
  return <PublicPage eyebrow="ABOUT APTORA" title={<>A clearer connection between<br /><em>learning and doing.</em></>}>
    <p className="public-lead">APTORA is a placement platform designed to help University of Ilorin technology students find relevant industrial training and internship opportunities, and help organizations connect with emerging talent.</p>
    <section className="public-panel-grid">
      <article className="public-panel"><span className="public-number">01 / THE CHALLENGE</span><h2>Good opportunities can be hard to find.</h2><p>Students often search across disconnected channels and have limited information about whether a placement is relevant, active, or suitable for their academic requirements. Employers and coordinators also need a clearer way to manage the process.</p></article>
      <article className="public-panel"><span className="public-number">02 / OUR APPROACH</span><h2>Bring the process into view.</h2><p>APTORA is being built around verified organizations, structured opportunity details, explainable recommendations, and application tracking. Matching is intended to help students understand fit, while final decisions remain with students and employers.</p></article>
    </section>
    <section className="public-section"><div className="eyebrow">WHO IT SERVES</div><div className="audience-grid">{audiences.map(([title, body], index) => <article key={title}><span className="public-number">0{index + 1}</span><h2>{title}</h2><p>{body}</p></article>)}</div></section>
    <p className="public-disclaimer">APTORA is an independent academic software project. It does not claim official endorsement by the University of Ilorin.</p>
  </PublicPage>;
}
