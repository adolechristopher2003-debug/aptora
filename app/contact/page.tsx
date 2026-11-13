import { PublicPage } from "@/components/public-chrome";
import { submitContactMessage } from "@/actions/contact";

export const instant = false;

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state } = await searchParams;
  return <PublicPage eyebrow="CONTACT" title={<>We’re here to<br /><em>help you move forward.</em></>}>
    <p className="public-lead">Questions about using APTORA, listing an opportunity, or coordinating a placement? Send a note and the team can follow up.</p>
    <div className="contact-layout"><form className="contact-form" action={submitContactMessage}>
      {state === "sent" ? <p className="form-message success" role="status">Your message was received. Thank you for getting in touch.</p> : null}
      {state === "invalid" ? <p className="form-message error" role="alert">Check the details and make sure your message is between 10 and 5,000 characters.</p> : null}
      {state === "unavailable" ? <p className="form-message error" role="alert">We can’t send your message right now. Please try again later.</p> : null}
      <label>Your name<input name="name" required minLength={2} maxLength={160} autoComplete="name" /></label>
      <label>Email address<input name="email" type="email" required maxLength={320} autoComplete="email" /></label>
      <label>Subject<input name="subject" required minLength={2} maxLength={180} /></label>
      <label>Message<textarea name="message" required minLength={10} maxLength={5000} rows={6} /></label>
      <button type="submit" className="button button-blue">Send message <span aria-hidden="true">↗</span></button>
    </form><aside className="contact-aside"><div className="eyebrow">A NOTE ON APTORA</div><h2>Built for a clearer placement process.</h2><p>APTORA is an academic software project for University of Ilorin technology placement workflows. Please don’t include passwords, financial information, or sensitive identity documents in a contact message.</p><div className="contact-rule" /><span className="public-number">UNIVERSITY OF ILORIN · NIGERIA</span></aside></div>
  </PublicPage>;
}
