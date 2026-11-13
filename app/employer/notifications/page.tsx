import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { markNotificationRead } from "@/actions/student";

export default async function EmployerNotificationsPage() {
  const { supabase, user } = await requireRole(["employer"]);
  const { data, error } = await supabase.from("notifications").select("id,notification_type,title,body,href,read_at,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
  return <><div className="dashboard-page-heading"><div><div className="eyebrow">NOTIFICATIONS</div><h1>Organization updates.</h1><p>Verification, applications, and placement decisions appear here.</p></div></div>
    {error ? <p className="dashboard-alert">Notifications could not be loaded.</p> : data?.length ? <div className="dashboard-panel notification-list">{data.map((notification) => { const href = notification.href?.startsWith("/") && !notification.href.startsWith("//") ? notification.href : null; return <article className={`notification-item ${notification.read_at ? "is-read" : ""}`} key={notification.id}><span className="notification-dot" /><div className="notification-copy"><span className="eyebrow">{notification.notification_type.replaceAll("_", " ")}</span><strong>{notification.title}</strong><p>{notification.body}</p><time dateTime={notification.created_at}>{new Date(notification.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC</time>{href ? <Link href={href}>Open update →</Link> : null}</div>{!notification.read_at ? <form action={markNotificationRead}><input type="hidden" name="notificationId" value={notification.id} /><button className="text-action">Mark read</button></form> : null}</article>; })}</div> : <div className="dashboard-panel recommendation-empty"><h2>You’re all caught up.</h2><p>New organization updates will show here.</p></div>}
  </>;
}
