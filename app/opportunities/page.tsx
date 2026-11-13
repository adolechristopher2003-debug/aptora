import Link from "next/link";
import { PublicPage } from "@/components/public-chrome";
import { searchOpportunities } from "@/lib/services/opportunities";

export const instant = false;

type SearchValue = string | string[] | undefined;
type PageProps = { searchParams: Promise<Record<string, SearchValue>> };

export default async function OpportunitiesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : "";
  const location = typeof params.location === "string" ? params.location : "";
  const mode = typeof params.mode === "string" ? params.mode : "";
  const employmentType = typeof params.type === "string" ? params.type : "";
  const sort = typeof params.sort === "string" ? params.sort : "newest";
  const page = Number(params.page) > 0 ? Number(params.page) : 1;
  const result = await searchOpportunities({ query, category, location, workMode: mode, employmentType, sort, page });

  return <PublicPage eyebrow="EXPLORE OPPORTUNITIES" title={<>Find work that fits<br /><em>where you want to go.</em></>}>
    <p className="public-lead">Browse active opportunities from approved organizations. Sign in to apply and track your progress.</p>
    <form className="opportunity-filters" action="/opportunities">
      <label>Search<input type="search" name="q" defaultValue={query} placeholder="Role, skill, organization" /></label>
      <label>Technology area<select name="category" defaultValue={category}><option value="">All areas</option><option>Software</option><option>Data</option><option>Cybersecurity</option><option>Networking</option><option>Product Design</option><option>IT Support</option></select></label>
      <label>Location<input name="location" defaultValue={location} placeholder="City or state" /></label>
      <label>Work mode<select name="mode" defaultValue={mode}><option value="">Any mode</option><option value="onsite">On-site</option><option value="hybrid">Hybrid</option><option value="remote">Remote</option></select></label>
      <label>Opportunity type<select name="type" defaultValue={employmentType}><option value="">Any type</option><option value="internship">Internship</option><option value="siwes">SIWES</option><option value="graduate">Graduate placement</option></select></label>
      <label>Sort by<select name="sort" defaultValue={sort}><option value="newest">Newest</option><option value="deadline">Deadline</option><option value="title">Title</option></select></label>
      <button className="button button-dark" type="submit">Search <span aria-hidden="true">↗</span></button>
    </form>
    {!result.configured ? <div className="empty-opportunities"><span className="empty-mark">○</span><h2>Opportunity search is being connected.</h2><p>Published opportunities will appear here after the Supabase project is configured.</p></div> : result.failed ? <div className="empty-opportunities"><span className="empty-mark">!</span><h2>We couldn’t load opportunities.</h2><p>Please try again shortly. Only published opportunities from approved organizations are shown here.</p></div> : result.placements.length === 0 ? <div className="empty-opportunities"><span className="empty-mark">○</span><h2>No matching opportunities yet.</h2><p>Try another search or check back as organizations publish new roles.</p><Link className="text-link" href="/opportunities">Clear filters <span aria-hidden="true">→</span></Link></div> : <><div className="opportunity-grid">{result.placements.map((placement) => <article className="opportunity-card" key={placement.id}>
      <div className="opportunity-card-top"><span className="match-tag"><span className="live-dot" /> VERIFIED ORGANIZATION</span><span>{placement.work_mode}</span></div>
      <div className="opportunity-company-mark">{placement.organization_name.slice(0, 1).toUpperCase()}</div>
      <p className="card-kicker">{placement.category} · {placement.employment_type}</p><h2>{placement.title}</h2><p className="company-name">{placement.organization_name}</p>
      <p className="opportunity-location">{placement.location}{placement.duration_weeks ? ` · ${placement.duration_weeks} weeks` : ""}</p>
      <div className="opportunity-skills">{placement.required_skills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}</div>
      <Link className="opportunity-open" href={`/opportunities/${placement.id}`}>View placement <span aria-hidden="true">↗</span></Link>
    </article>)}</div><nav className="opportunity-pagination" aria-label="Opportunity pages">{page > 1 ? <Link href={pageHref(params, page - 1)}>← Previous</Link> : <span /> }<span>Page {page}</span>{result.placements.length === 12 ? <Link href={pageHref(params, page + 1)}>Next →</Link> : <span />}</nav></>}
  </PublicPage>;
}

function pageHref(params: Record<string, SearchValue>, page: number) {
  const search = new URLSearchParams();
  for (const key of ["q", "category", "location", "mode", "type", "sort"]) {
    const value = params[key];
    if (typeof value === "string" && value) search.set(key, value);
  }
  search.set("page", String(page));
  return `/opportunities?${search.toString()}`;
}
