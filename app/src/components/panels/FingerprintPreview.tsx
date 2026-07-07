import { FlaskConical } from "lucide-react";
import { getGeo, type Geo } from "../../lib/atlasData";

// Small guide to the Evidence Fingerprint Divergence layer. The live values sit
// in each selected place's detail panel; the map itself is not a similarity ramp.
export function FingerprintPreview({ geos }: { geos: Geo[] }) {
  const anchor = getGeo(geos, "NR");
  if (!anchor || anchor.similarityNeighbors.length === 0) return null;
  const caveat = anchor.similarityNeighbors[0]?.caveat;

  return (
    <section className="fingerprint" aria-label="Evidence fingerprint preview">
      <p className="fingerprint__flag">
        <FlaskConical aria-hidden="true" size={13} /> Selected-place detail
      </p>
      <p className="fingerprint__lede">
        Under this method, Nauru's most similar official-data profiles are:
      </p>
      <ul className="fingerprint__list">
        {anchor.similarityNeighbors.map((n) => (
          <li key={n.code} className="fingerprint__row">
            <span className="fingerprint__name">{n.name}</span>
            <span className="fingerprint__band">{n.band}</span>
            <span className="fingerprint__reason">{n.reason}</span>
          </li>
        ))}
      </ul>
      {caveat && <p className="fingerprint__caveat">{caveat}</p>}
    </section>
  );
}
