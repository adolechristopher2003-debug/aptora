import Link from "next/link";
import { PlacementEditorForm } from "@/components/employer-forms";

export default function NewEmployerPlacementPage() {
  return <><div className="dashboard-page-heading"><div><div className="eyebrow">NEW PLACEMENT</div><h1>Describe the opportunity.</h1><p>Clear requirements help students decide whether to apply.</p></div><Link className="button button-outline" href="/employer/placements">Cancel</Link></div>
    <div className="dashboard-panel form-panel"><PlacementEditorForm /></div>
  </>;
}
