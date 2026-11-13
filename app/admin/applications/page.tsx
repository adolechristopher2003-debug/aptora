import { requireRole } from "@/lib/auth/require-role";
import { AdminApplicationReview } from "@/components/admin-forms";
import type { ApplicationStatus } from "@/types/database";

export const instant=false;
type Query=string|string[]|undefined;
const allStatuses:ApplicationStatus[]=["submitted","under_review","shortlisted","interview","accepted","rejected","withdrawn"];

export default async function AdminApplicationsPage({searchParams}:{searchParams:Promise<Record<string,Query>>}){
 const {supabase}=await requireRole(["admin","super_admin"]);const params=await searchParams;
 const status=typeof params.status==="string"&&allStatuses.includes(params.status as ApplicationStatus)?params.status as ApplicationStatus:null;
 const page=Math.min(10000,Math.max(1,Number(params.page)||1));
 let query=supabase.from("applications").select("id,student_id,placement_id,status,submitted_at,reviewed_at").order("submitted_at",{ascending:false}).range((page-1)*50,page*50-1);
 if(status)query=query.eq("status",status);
 const {data:applications,error}=await query;
 const studentIds=[...new Set((applications??[]).map(a=>a.student_id))];const placementIds=[...new Set((applications??[]).map(a=>a.placement_id))];
 const [students,placements]=await Promise.all([
  studentIds.length?supabase.from("profiles").select("id,full_name,email").in("id",studentIds):Promise.resolve({data:[]}),
  placementIds.length?supabase.from("placements").select("id,title,employer_id").in("id",placementIds):Promise.resolve({data:[]}),
 ]);
 const studentMap=new Map((students.data??[]).map(s=>[s.id,s]));const placementMap=new Map((placements.data??[]).map(p=>[p.id,p]));
 const employerIds=[...new Set((placements.data??[]).map(p=>p.employer_id))];const {data:employers}=employerIds.length?await supabase.from("employers").select("id,organization_name").in("id",employerIds):{data:[]};const employerMap=new Map((employers??[]).map(e=>[e.id,e.organization_name]));
 return <><div className="dashboard-page-heading"><div><div className="eyebrow">APPLICATION OVERSIGHT</div><h1>Monitor placement applications.</h1><p>Administrative status changes are recorded in the application timeline and audit log.</p></div></div>
  <form className="dashboard-filter-form admin-filter" action="/admin/applications"><select name="status" defaultValue={status??""} aria-label="Application status"><option value="">All statuses</option>{allStatuses.map(s=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select><button className="button button-dark">Filter</button></form>
  {error?<p className="dashboard-alert">Applications could not be loaded.</p>:applications?.length?<div className="admin-record-list">{applications.map(app=>{const student=studentMap.get(app.student_id);const placement=placementMap.get(app.placement_id);return <article className="dashboard-panel admin-application-card" key={app.id}><div className="admin-record-heading"><div><h2>{student?.full_name??"Student"}</h2><p>{student?.email??"Account unavailable"}</p></div><span className={`status-badge status-${app.status}`}>{app.status.replaceAll("_"," ")}</span></div><div className="candidate-facts"><span>{placement?.title??"Placement"}</span><span>{employerMap.get(placement?.employer_id??"")??"Organization"}</span><span>Applied {new Date(app.submitted_at).toLocaleDateString("en-NG",{dateStyle:"medium",timeZone:"UTC"})}</span></div>{!["accepted","rejected","withdrawn"].includes(app.status)?<AdminApplicationReview applicationId={app.id} status={app.status}/>:null}</article>})}</div>:<div className="dashboard-panel recommendation-empty"><h2>No applications match.</h2><p>Try another status filter.</p></div>}
  <nav className="opportunity-pagination" aria-label="Application pages">{page>1?<a href={`/admin/applications?status=${status??""}&page=${page-1}`}>← Previous</a>:<span/>}<span>Page {page}</span>{applications?.length===50?<a href={`/admin/applications?status=${status??""}&page=${page+1}`}>Next →</a>:<span/>}</nav>
 </>;
}
