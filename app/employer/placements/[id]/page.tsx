import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { PlacementEditorForm } from "@/components/employer-forms";
import { closeEmployerPlacement, submitPlacementForReview } from "@/actions/employer";

export const instant = false;

export default async function EmployerPlacementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireRole(["employer"]);
  const { data, error } = await supabase.from("placements").select("*").eq("id", id).eq("employer_id", user.id).maybeSingle();
  if (error || !data) notFound();
  const { count } = await supabase.from("applications").select("id", { count: "exact", head: true }).eq("placement_id", id);
  const editable = ["draft", "rejected"].includes(data.status);
  return <><div className="dashboard-page-heading"><div><div className="eyebrow">PLACEMENT DETAILS · {data.status.replaceAll("_", " ").toUpperCase()}</div><h1>{data.title}</h1><p>{data.category} · {data.location} · {data.work_mode}</p></div><Link className="button button-outline" href="/employer/placements">All placements</Link></div>
    <section className="placement-status-panel"><div><span className={`status-badge status-${data.status}`}>{data.status.replaceAll("_", " ")}</span><p>{data.status === "draft" ? "This draft is private. Submit it when the details are ready." : data.status === "pending_review" ? "An administrator is reviewing this opportunity." : data.status === "published" ? "This opportunity is public and accepting eligible applications." : data.status === "rejected" ? data.rejection_reason || "Review the details and update the draft before resubmitting." : "This opportunity is not currently accepting applications."}</p></div>
      {editable ? <form action={submitPlacementForReview}><input type="hidden" name="placementId" value={id} /><button className="button button-blue">Submit for review <span>↗</span></button></form> : null}
      {data.status === "published" ? <form action={closeEmployerPlacement}><input type="hidden" name="placementId" value={id} /><button className="button button-outline">Close applications</button></form> : null}
    </section>
    <section className="dashboard-panel placement-app-summary"><strong>{count ?? 0}</strong><span>applications received</span><Link href={`/employer/applications?placement=${id}`}>Review candidates →</Link></section>
    {editable ? <div className="dashboard-panel form-panel"><div className="eyebrow">{data.status === "rejected" ? "UPDATE AND RESUBMIT" : "EDIT DRAFT"}</div><h2 className="form-section-title">Keep the opportunity complete and accurate.</h2><PlacementEditorForm placement={data} /></div> : <div className="dashboard-panel"><div className="eyebrow">PLACEMENT DESCRIPTION</div><p className="employer-placement-description">{data.description}</p></div>}
  </>;
}
