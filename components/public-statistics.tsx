import { connection } from "next/server";
import type { ReactNode } from "react";
import { getPublicStatistics } from "@/lib/services/opportunities";

function Stat({ value, label }: { value: number; label: ReactNode }) {
  return <div className="trust-stat"><strong>{new Intl.NumberFormat("en-NG").format(value)}</strong><span>{label}</span></div>;
}

export async function PublicStatistics() {
  await connection();
  const statistics = await getPublicStatistics();
  return <section className="trust-strip"><div className="section-wrap trust-inner">
    {!statistics ? <><span>PLATFORM ACTIVITY</span><p className="stats-empty">Live platform counts will appear here once the database is connected.</p></> : <>
      <span>APTORA, IN NUMBERS</span>
      <Stat value={statistics.registered_students} label={<>registered<br />students</>} />
      <div className="trust-rule" />
      <Stat value={statistics.verified_organizations} label={<>verified<br />organizations</>} />
      <div className="trust-rule" />
      <Stat value={statistics.published_placements} label={<>published<br />placements</>} />
      <div className="trust-rule" />
      <Stat value={statistics.successful_placements} label={<>accepted<br />applications</>} />
    </>}
  </div></section>;
}
