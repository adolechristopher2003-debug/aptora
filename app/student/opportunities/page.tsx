import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { searchOpportunities } from "@/lib/services/opportunities";
import { SavePlacementButton } from "@/components/student-placement-actions";

export const instant = false;
type Value = string | string[] | undefined;

export default async function StudentOpportunitiesPage({ searchParams }: { searchParams: Promise<Record<string, Value>> }) {
  const { supabase, user } = await requireRole(["student"]);
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : "";
  const location = typeof params.location === "string" ? params.location : "";
  const mode = typeof params.mode === "string" ? params.mode : "";
  const type = typeof params.type === "string" ? params.type : "";
  const sort = typeof params.sort === "string" ? params.sort : "newest";
  const page = Math.min(10000, Math.max(1, Number(params.page) || 1));
  const [result, savedResult] = await Promise.all([
    searchOpportunities({ query, category, location, workMode: mode, employmentType: type, sort, page }),
    supabase.from("saved_placements").select("placement_id").eq("student_id", user.id),
  ]);
  const saved = new Set((savedResult.data ?? []).map((item) => item.placement_id));

  return <><div className="dashboard-page-heading"><div><div className="eyebrow">FIND PLACEMENTS</div><h1>Explore your next step.</h1><p>Only published opportunities from verified organizations are listed.</p></div><Link className="button button-outline" href="/opportunities">Public view <span>↗</span></Link></div>
    <form className="dashboard-filter-form" action="/student/opportunities"><input name="q" type="search" defaultValue={query} placeholder="Search roles, skills, organizations" aria-label="Search roles, skills, organizations" /><select name="category" defaultValue={category} aria-label="Technology area"><option value="">All areas</option><option>Software</option><option>Data</option><option>Cybersecurity</option><option>Networking</option><option>Product Design</option><option>IT Support</option></select><input name="location" defaultValue={location} placeholder="Location" aria-label="Location" /><select name="mode" defaultValue={mode} aria-label="Work mode"><option value="">Any mode</option><option value="onsite">On-site</option><option value="hybrid">Hybrid</option><option value="remote">Remote</option></select><select name="type" defaultValue={type} aria-label="Opportunity type"><option value="">Any type</option><option value="internship">Internship</option><option value="siwes">SIWES</option><option value="graduate">Graduate placement</option></select><select name="sort" defaultValue={sort} aria-label="Sort opportunities"><option value="newest">Newest</option><option value="deadline">Deadline</option><option value="title">Title</option></select><button className="button button-dark">Search</button></form>
    {!result.configured ? <p className="dashboard-alert">Opportunity search is not configured yet.</p> : result.failed ? <p className="dashboard-alert">We couldn’t load opportunities. Try again shortly.</p> : result.placements.length === 0 ? <div className="dashboard-panel"><p className="panel-empty">No matching opportunities yet. Try changing your filters or check back later.</p></div> : <><div className="student-opportunity-grid">{result.placements.map((item) => <article className="dashboard-panel student-opportunity-card" key={item.id}><div className="opportunity-card-top"><span className="match-tag"><span className="live-dot" /> VERIFIED</span><span>{item.work_mode}</span></div><p className="card-kicker">{item.category} · {item.employment_type}</p><h2>{item.title}</h2><p className="company-name">{item.organization_name}</p><p className="opportunity-location">{item.location}{item.duration_weeks ? ` · ${item.duration_weeks} weeks` : ""}</p><div className="opportunity-skills">{item.required_skills.slice(0, 4).map((skill) => <span key={skill}>{skill}</span>)}</div><div className="student-opportunity-actions"><Link href={`/opportunities/${item.id}`}>View details ↗</Link><SavePlacementButton placementId={item.id} saved={saved.has(item.id)} /></div></article>)}</div><nav className="opportunity-pagination" aria-label="Opportunity pages">{page > 1 ? <Link href={makeHref(params, page - 1)}>← Previous</Link> : <span />}<span>Page {page}</span>{result.placements.length === 12 ? <Link href={makeHref(params, page + 1)}>Next →</Link> : <span />}</nav></>}
  </>;
}

function makeHref(params: Record<string, Value>, page: number) {
  const search = new URLSearchParams();
  for (const key of ["q", "category", "location", "mode", "type", "sort"]) if (typeof params[key] === "string" && params[key]) search.set(key, params[key] as string);
  search.set("page", String(page));
  return `/student/opportunities?${search.toString()}`;
}
