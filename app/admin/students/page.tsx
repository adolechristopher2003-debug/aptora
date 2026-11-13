import { requireRole } from "@/lib/auth/require-role";
import { UserRoleForm, UserStatusForm } from "@/components/admin-forms";

export const instant = false;
type Query = string | string[] | undefined;

export default async function AdminStudentsPage({ searchParams }: { searchParams: Promise<Record<string, Query>> }) {
  const { supabase, profile } = await requireRole(["admin", "super_admin"]);
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const page = Math.min(10000, Math.max(1, Number(params.page) || 1));
  let profilesQuery = supabase.from("profiles").select("id,full_name,email,role,status,created_at").eq("role", "student").order("created_at", { ascending: false }).range((page - 1) * 50, page * 50 - 1);
  if (search) profilesQuery = profilesQuery.ilike("full_name", `%${search}%`);
  const { data: profiles, error } = await profilesQuery;
  const ids = (profiles ?? []).map((item) => item.id);
  const { data: students } = ids.length ? await supabase.from("students").select("id,matric_number,department,course_of_study,level,cgpa").in("id", ids) : { data: [] };
  const studentMap = new Map((students ?? []).map((student) => [student.id, student]));
  const canChangeRoles = profile.role === "super_admin";
  return <><div className="dashboard-page-heading"><div><div className="eyebrow">STUDENT RECORDS</div><h1>Manage student accounts.</h1><p>Student records are restricted to authorized administrators.</p></div></div>
    <form className="dashboard-filter-form admin-filter" action="/admin/students"><input name="q" defaultValue={search} placeholder="Search by student name" aria-label="Search students"/><button className="button button-dark">Search</button></form>
    {error ? <p className="dashboard-alert">Student records could not be loaded.</p> : profiles?.length ? <div className="dashboard-panel admin-user-list">{profiles.map((item) => { const student = studentMap.get(item.id); return <article className="admin-user-row" key={item.id}><span className="list-avatar">{item.full_name.slice(0,1).toUpperCase()}</span><span className="admin-user-main"><strong>{item.full_name}</strong><small>{item.email} · {student?.matric_number ?? "No matric number"}</small><small>{student?.department ?? "Department not set"} · {student?.course_of_study ?? "Course not set"}{student ? ` · ${student.level} level · CGPA ${student.cgpa ?? "—"}` : ""}</small></span><span className={`status-badge status-${item.status}`}>{item.status}</span><UserStatusForm userId={item.id} status={item.status}/>{canChangeRoles ? <UserRoleForm userId={item.id} role={item.role}/> : null}</article>; })}</div> : <div className="dashboard-panel recommendation-empty"><h2>No student profiles match.</h2><p>Try another name or check back when students register.</p></div>}
    <nav className="opportunity-pagination" aria-label="Student account pages">{page>1?<a href={`/admin/students?q=${encodeURIComponent(search)}&page=${page-1}`}>← Previous</a>:<span/>}<span>Page {page}</span>{profiles?.length===50?<a href={`/admin/students?q=${encodeURIComponent(search)}&page=${page+1}`}>Next →</a>:<span/>}</nav>
  </>;
}
