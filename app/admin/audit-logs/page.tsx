import { requireRole } from "@/lib/auth/require-role";

export const instant=false;
type Query=string|string[]|undefined;

export default async function AdminAuditLogsPage({searchParams}:{searchParams:Promise<Record<string,Query>>}){
 const {supabase}=await requireRole(["admin","super_admin"]);const params=await searchParams;
 const entity=typeof params.entity==="string"?params.entity.trim().slice(0,80):"";const page=Math.min(10000,Math.max(1,Number(params.page)||1));
 let query=supabase.from("audit_logs").select("id,actor_id,action,entity_type,entity_id,old_values,new_values,created_at").order("created_at",{ascending:false}).range((page-1)*50,page*50-1);
 if(entity)query=query.eq("entity_type",entity);
 const {data,error}=await query;const actorIds=[...new Set((data??[]).flatMap(row=>row.actor_id?[row.actor_id]:[]))];const {data:actors}=actorIds.length?await supabase.from("profiles").select("id,full_name,email").in("id",actorIds):{data:[]};const actorMap=new Map((actors??[]).map(actor=>[actor.id,actor]));
 return <><div className="dashboard-page-heading"><div><div className="eyebrow">SECURITY AND AUDIT</div><h1>Administrative activity.</h1><p>Audit records are restricted to administrator accounts.</p></div></div>
  <form className="dashboard-filter-form admin-filter" action="/admin/audit-logs"><input name="entity" defaultValue={entity} placeholder="Entity type, e.g. placements" aria-label="Filter by entity type"/><button className="button button-dark">Filter</button></form>
  {error?<p className="dashboard-alert">Audit entries could not be loaded.</p>:data?.length?<div className="dashboard-panel audit-log-list">{data.map(row=>{const actor=row.actor_id?actorMap.get(row.actor_id):null;return <article className="audit-log-row" key={row.id}><div className="audit-log-meta"><span className="status-badge">{row.action}</span><strong>{row.entity_type}{row.entity_id?` · ${row.entity_id}`:""}</strong><time>{new Date(row.created_at).toLocaleString("en-NG",{dateStyle:"medium",timeStyle:"short",timeZone:"UTC"})} UTC</time></div><p>{actor?`${actor.full_name} · ${actor.email}`:"System or removed account"}</p><details><summary>Record change details</summary><pre>{JSON.stringify({before:row.old_values,after:row.new_values},null,2)}</pre></details></article>})}</div>:<div className="dashboard-panel recommendation-empty"><h2>No audit entries match.</h2><p>Administrative verification and placement changes will be recorded here.</p></div>}
  <nav className="opportunity-pagination" aria-label="Audit log pages">{page>1?<a href={`/admin/audit-logs?entity=${encodeURIComponent(entity)}&page=${page-1}`}>← Previous</a>:<span/>}<span>Page {page}</span>{data?.length===50?<a href={`/admin/audit-logs?entity=${encodeURIComponent(entity)}&page=${page+1}`}>Next →</a>:<span/>}</nav>
 </>;
}
