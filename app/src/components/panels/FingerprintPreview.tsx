import { FlaskConical } from "lucide-react";
import { FINGERPRINT_PREVIEW, getGeo, type Geo } from "../../lib/atlasData";

// Small, static, clearly-labelled preview of the Evidence Fingerprint Divergence
// idea (TASK-019). It is analysis-ready but NOT app-wired: no live similarity
// ramp, no global explorer, no leaderboard.
export function FingerprintPreview({ geos }: { geos: Geo[] }) {
  const anchor = getGeo(geos, FINGERPRINT_PREVIEW.anchor);
  if (!anchor) return null;

  return (
    <section className="fingerprint" aria-label="Evidence fingerprint preview">
      <p className="fingerprint__flag">
        <FlaskConical aria-hidden="true" size={13} /> Analysis-ready, not app-wired
      </p>
      <p className="fingerprint__lede">
        Under this method, Nauru's evidence profile leans toward{" "}
        <strong>{FINGERPRINT_PREVIEW.anchorLeans}</strong>. Its most similar official-data profiles are:
      </p>
      <ul className="fingerprint__list">
        {FINGERPRINT_PREVIEW.neighbors.map((n) => (
          <li key={n.code} className="fingerprint__row">
            <span className="fingerprint__name">{n.name}</span>
            <span className="fingerprint__band">{n.band}</span>
            <span className="fingerprint__reason">{n.reason}</span>
          </li>
        ))}
      </ul>
      <p className="fingerprint__caveat">{FINGERPRINT_PREVIEW.caveat}</p>
    </section>
  );
}
