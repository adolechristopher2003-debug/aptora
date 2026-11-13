import { requireRole } from "@/lib/auth/require-role";
import { DeleteStudentDocumentForm, StudentDocumentUploadForm } from "@/components/student-preference-forms";

export default async function StudentDocumentsPage() {
  const { supabase, user } = await requireRole(["student"]);
  const { data: documents, error } = await supabase.from("documents").select("id,document_type,storage_path,original_filename,file_size_bytes,created_at").eq("owner_id", user.id).is("deleted_at", null).order("created_at", { ascending: false }).limit(30);
  const links = await Promise.all((documents ?? []).map(async (document) => {
    const { data } = await supabase.storage.from("aptora-documents").createSignedUrl(document.storage_path, 60);
    return [document.id, data?.signedUrl ?? null] as const;
  }));
  const signedLinks = new Map(links);
  return <><div className="dashboard-page-heading"><div><div className="eyebrow">DOCUMENTS</div><h1>Keep your documents ready.</h1><p>Files are private and visible only to you and authorized reviewers for relevant applications.</p></div></div>
    {error ? <p className="dashboard-alert">Your documents could not be loaded.</p> : <div className="documents-layout"><section className="dashboard-panel"><div className="panel-head"><div><div className="eyebrow">YOUR FILES</div><h2>Uploaded documents</h2></div></div>{documents?.length ? <div className="document-list">{documents.map((document) => <article className="document-row" key={document.id}><span className="document-glyph">PDF</span><span><strong>{document.original_filename}</strong><small>{document.document_type.replaceAll("_", " ")} · {(document.file_size_bytes / 1024 / 1024).toFixed(1)} MB</small></span>{signedLinks.get(document.id) ? <a href={signedLinks.get(document.id)!} target="_blank" rel="noreferrer">Open ↗</a> : <span className="document-unavailable">Unavailable</span>}<DeleteStudentDocumentForm documentId={document.id} /></article>)}</div> : <p className="panel-empty">No documents uploaded yet. Add a CV or resume so it’s ready when you apply.</p>}</section>
      <section className="dashboard-panel"><div className="eyebrow">UPLOAD A DOCUMENT</div><h2 className="form-section-title">Add a private file.</h2><StudentDocumentUploadForm /></section></div>}
  </>;
}
