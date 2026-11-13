import Link from "next/link";
import { connection } from "next/server";
import { searchOpportunities } from "@/lib/services/opportunities";

export async function FeaturedOpportunities() {
  await connection();
  const { placements, configured, failed } = await searchOpportunities({ pageSize: 3 });
  return <section className="featured-section"><div className="section-wrap">
    <div className="featured-heading"><div><div className="eyebrow">A PLACE TO BEGIN</div><h2>Opportunities with<br /><em>room to grow.</em></h2></div><Link className="text-link" href="/opportunities">Explore all opportunities <span aria-hidden="true">→</span></Link></div>
    {!configured ? <div className="featured-empty">Published placements will appear here when the platform database is connected.</div> : failed ? <div className="featured-empty">We couldn’t load opportunities right now. Please visit the opportunities page to try again.</div> : placements.length === 0 ? <div className="featured-empty">No published placements yet. Check back as verified organizations add opportunities.</div> : <div className="featured-grid">{placements.map((item) => <article className="featured-card" key={item.id}>
      <div className="featured-card-top"><span className="match-tag"><span className="live-dot" /> VERIFIED</span><span>{item.work_mode}</span></div>
      <p className="card-kicker">{item.category} · {item.employment_type}</p><h3>{item.title}</h3><p className="company-name">{item.organization_name}</p>
      <div className="featured-card-foot"><span>{item.location}</span><Link href={`/opportunities/${item.id}`} aria-label={`View ${item.title} at ${item.organization_name}`}>↗</Link></div>
    </article>)}</div>}
  </div></section>;
}
