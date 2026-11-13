import { requireRole } from "@/lib/auth/require-role";

export default async function AdminAnalyticsPage(){
 const {supabase}=await requireRole(["admin","super_admin"]);
 const states=["submitted","under_review","shortlisted","interview","accepted","rejected","withdrawn"] as const;
 const [students,employers,approvedEmployers,published,applications,contactMessages,...applicationStatuses]=await Promise.all([
  supabase.from("students").select("id",{count:"exact",head:true}),
  supabase.from("employers").select("id",{count:"exact",head:true}),
  supabase.from("employers").select("id",{count:"exact",head:true}).eq("verification_status","approved"),
  supabase.from("placements").select("id",{count:"exact",head:true}).eq("status","published"),
  supabase.from("applications").select("id",{count:"exact",head:true}),
  supabase.from("contact_messages").select("id",{count:"exact",head:true}),
  ...states.map(status=>supabase.from("applications").select("id",{count:"exact",head:true}).eq("status",status)),
 ]);
 const summary=[students,employers,approvedEmployers,published,applications,contactMessages];
 const errors=[...summary,...applicationStatuses].some(result=>result.error);
 const format=(result:{count:number|null,error:unknown})=>result.error?"—":result.count??0;
 return <><div className="dashboard-page-heading"><div><div className="eyebrow">PLATFORM ANALYTICS</div><h1>Activity across the platform.</h1><p>Live counts from Supabase. No sample or estimated activity is included.</p></div></div>
  {errors?<p className="dashboard-alert">Some analytics could not be loaded.</p>:null}
  <section className="dashboard-stats"><Stat label="Students" value={format(students)} note="active student records"/><Stat label="Organizations" value={format(employers)} note="all employer accounts"/><Stat label="Verified" value={format(approvedEmployers)} note="approved organizations"/><Stat label="Published roles" value={format(published)} note="public opportunities"/><Stat label="Applications" value={format(applications)} note="all statuses"/><Stat label="Contact messages" value={format(contactMessages)} note="all messages"/></section>
  <section className="dashboard-panel analytics-status-panel"><div className="eyebrow">APPLICATION STATUS</div><h2>Current application distribution.</h2><div className="analytics-status-list">{states.map((status,index)=><div className="analytics-status-row" key={status}><span>{status.replaceAll("_"," ")}</span><div className="analytics-track"><i style={{width:`${applications.count?Math.max(2,((applicationStatuses[index].count??0)/applications.count)*100):0}%`}}/></div><strong>{format(applicationStatuses[index])}</strong></div>)}</div></section>
 </>;
}
function Stat({label,value,note}:{label:string;value:number|string;note:string}){return <article className="dashboard-stat"><span>{label}</span><strong>{value}</strong><small>{note}</small></article>}
