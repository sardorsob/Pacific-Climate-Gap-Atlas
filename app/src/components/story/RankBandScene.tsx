import { useEffect, useState, type CSSProperties } from "react";
import type { Geo } from "../../lib/atlasData";
import { buildRankBandRows, rankBandTransition, rankToPercent } from "./rankBandModel";

type RankBandSceneProps = {
  geos: Geo[];
  reducedMotion?: boolean;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setReduced(media.matches);
    handleChange();
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return reduced;
}

type RankStyle = CSSProperties & {
  "--rank-start": string;
  "--rank-width": string;
};

export function RankBandScene({ geos, reducedMotion }: RankBandSceneProps) {
  const mediaReducedMotion = usePrefersReducedMotion();
  const transition = rankBandTransition(reducedMotion ?? mediaReducedMotion);
  const rows = buildRankBandRows(geos);

  return (
    <figure
      className="rank-band-figure"
      data-stage-figure="rank-bands"
      data-motion-mode={transition.mode}
      style={{ "--rank-band-duration": `${transition.duration}ms` } as CSSProperties}
      aria-label="Sensitivity rank bands for the 22 Pacific geographies"
    >
      <div className="rank-band-figure__sticky-head">
        <p className="rank-band-figure__intro">Sensitivity bands, not a fixed scoreboard</p>
        <div className="rank-band-figure__axis" aria-hidden="true">
          {[1, 8, 15, 22].map((rank) => (
            <span key={rank} style={{ "--rank-tick": `${rankToPercent(rank)}%` } as CSSProperties}>{rank}</span>
          ))}
        </div>
      </div>
      <ul className="rank-band-figure__rows">
        {rows.map((row) => {
          const start = rankToPercent(row.min);
          const end = rankToPercent(row.max);
          const style = {
            "--rank-start": `${start}%`,
            "--rank-width": `${Math.max(0, end - start)}%`,
          } as RankStyle;
          return (
            <li
              key={row.code}
              className={`rank-band-figure__row${row.highlight ? " rank-band-figure__row--highlight" : ""}`}
              data-code={row.code}
              data-highlight={row.highlight ? "true" : "false"}
              aria-label={`${row.name}, sensitivity band ${row.min} to ${row.max}`}
            >
              <span className="rank-band-figure__name">{row.name}</span>
              <span className="rank-band-figure__plot" style={style} aria-hidden="true">
                <span className="rank-band-figure__band" />
                {row.highlight && <span className="rank-band-figure__value">4–19</span>}
              </span>
            </li>
          );
        })}
      </ul>
      <figcaption className="rank-band-figure__caption">The bands are sensitivity diagnostics, not confidence intervals or a definitive leaderboard.</figcaption>
    </figure>
  );
}
