import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { SavePlacementButton } from "@/components/student-placement-actions";

export default async function SavedPlacementsPage() {
  const { supabase, user } = await requireRole(["student"]);
  const { data: saved, error } = await supabase.from("saved_placements").select("placement_id,created_at").eq("student_id", user.id).order("created_at", { ascending: false });
  const ids = (saved ?? []).map((item) => item.placement_id);
  const { data: placements } = ids.length ? await supabase.from("public_placements").select("id,title,organization_name,category,location,work_mode").in("id", ids) : { data: [] };
  return <><div className="dashboard-page-heading"><div><div className="eyebrow">SAVED PLACEMENTS</div><h1>Keep promising roles close.</h1><p>Saved opportunities stay here while they remain active and published.</p></div></div>
    {error ? <p className="dashboard-alert">Saved placements could not be loaded.</p> : placements?.length ? <div className="saved-placement-grid">{placements.map((placement) => <article className="dashboard-panel saved-placement-card" key={placement.id}><span className="eyebrow">{placement.category} · {placement.work_mode}</span><h2>{placement.title}</h2><p>{placement.organization_name} · {placement.location}</p><div><Link href={`/opportunities/${placement.id}`}>View placement ↗</Link><SavePlacementButton placementId={placement.id} saved /></div></article>)}</div> : <div className="dashboard-panel recommendation-empty"><span className="empty-mark">⌑</span><h2>No saved placements yet.</h2><p>Save interesting roles while you compare your options.</p><Link href="/student/opportunities">Explore placements ↗</Link></div>}
  </>;
}
