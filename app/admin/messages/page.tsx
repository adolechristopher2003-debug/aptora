import { requireRole } from "@/lib/auth/require-role";
import { ContactMessageStatusForm } from "@/components/admin-forms";

export const instant=false;
type Query=string|string[]|undefined;

export default async function AdminMessagesPage({searchParams}:{searchParams:Promise<Record<string,Query>>}){
 const {supabase}=await requireRole(["admin","super_admin"]);const params=await searchParams;
 const filter=typeof params.status==="string"?params.status:"new";const page=Math.min(10000,Math.max(1,Number(params.page)||1));
 let query=supabase.from("contact_messages").select("id,name,email,subject,message,sender_id,status,created_at,assigned_to").order("created_at",{ascending:false}).range((page-1)*50,page*50-1);
 if(["new","in_progress","resolved","spam"].includes(filter))query=query.eq("status",filter as "new");
 const {data,error}=await query;const senderIds=[...new Set((data??[]).flatMap(m=>m.sender_id?[m.sender_id]:[]))];const {data:profiles}=senderIds.length?await supabase.from("profiles").select("id,full_name").in("id",senderIds):{data:[]};const names=new Map((profiles??[]).map(p=>[p.id,p.full_name]));
 return <><div className="dashboard-page-heading"><div><div className="eyebrow">CONTACT MESSAGES</div><h1>Respond to the community.</h1><p>Contact submissions are private and visible only to authorized administrators.</p></div></div>
  <form className="dashboard-filter-form admin-filter" action="/admin/messages"><select name="status" defaultValue={filter} aria-label="Filter message status"><option value="new">New</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="spam">Spam</option><option value="all">All messages</option></select><button className="button button-dark">Filter</button></form>
  {error?<p className="dashboard-alert">Contact messages could not be loaded.</p>:data?.length?<div className="admin-record-list">{data.map(message=><article className="dashboard-panel admin-message-card" key={message.id}><div className="admin-record-heading"><div><span className="eyebrow">{message.email}</span><h2>{message.subject}</h2><p>{message.name}{message.sender_id?` · Account: ${names.get(message.sender_id)??"unknown"}`:" · Visitor"}</p></div><span className={`status-badge status-${message.status}`}>{message.status.replaceAll("_"," ")}</span></div><p className="admin-message-body">{message.message}</p><small className="admin-message-date">Received {new Date(message.created_at).toLocaleString("en-NG",{dateStyle:"medium",timeStyle:"short",timeZone:"UTC"})} UTC</small><ContactMessageStatusForm messageId={message.id} status={message.status}/></article>)}</div>:<div className="dashboard-panel recommendation-empty"><h2>No messages in this view.</h2><p>New contact form submissions will appear here.</p></div>}
  <nav className="opportunity-pagination" aria-label="Message pages">{page>1?<a href={`/admin/messages?status=${filter}&page=${page-1}`}>← Previous</a>:<span/>}<span>Page {page}</span>{data?.length===50?<a href={`/admin/messages?status=${filter}&page=${page+1}`}>Next →</a>:<span/>}</nav>
 </>;
}
