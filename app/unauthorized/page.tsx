import Link from "next/link";
import { PublicPage } from "@/components/public-chrome";

export default function UnauthorizedPage() {
  return <PublicPage eyebrow="ACCESS RESTRICTED" title={<>This space isn’t<br /><em>available to this account.</em></>}>
    <p className="public-lead">Your account doesn’t have permission to open that area. If you think this is a mistake, contact the platform administrator.</p>
    <Link className="button button-dark" href="/">Return home <span aria-hidden="true">↗</span></Link>
  </PublicPage>;
}
