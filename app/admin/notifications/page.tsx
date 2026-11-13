import { requireRole } from "@/lib/auth/require-role";
import { AdminNotificationForm } from "@/components/admin-forms";

export default async function AdminNotificationsPage(){
 const {supabase}=await requireRole(["admin","super_admin"]);
 const {data,error}=await supabase.from("profiles").select("id,full_name,email").eq("status","active").is("deleted_at",null).order("full_name").limit(250);
 return <><div className="dashboard-page-heading"><div><div className="eyebrow">SYSTEM NOTIFICATIONS</div><h1>Send a platform update.</h1><p>Notifications are private to their recipient and appear in their account inbox.</p></div></div>
  {error?<p className="dashboard-alert">Active accounts could not be loaded.</p>:data?.length?<div className="dashboard-panel form-panel"><AdminNotificationForm users={data.map((user)=>({id:user.id,name:user.full_name,email:user.email}))}/></div>:<div className="dashboard-panel recommendation-empty"><h2>No active accounts found.</h2></div>}
 </>;
}
