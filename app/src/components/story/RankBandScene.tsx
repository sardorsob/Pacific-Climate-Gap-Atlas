import { useEffect, useState, type CSSProperties } from "react";
import type { Geo } from "../../lib/atlasData";
import { buildRankBandRows, rankBandTransition } from "./rankBandModel";

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

function axisX(rank: number): number {
  return 132 + ((Math.max(1, Math.min(22, rank)) - 1) / 21) * 250;
}

export function RankBandScene({ geos, reducedMotion }: RankBandSceneProps) {
  const mediaReducedMotion = usePrefersReducedMotion();
  const transition = rankBandTransition(reducedMotion ?? mediaReducedMotion);
  const rows = buildRankBandRows(geos);
  const height = Math.max(150, rows.length * 22 + 42);

  return (
    <figure
      className="rank-band-figure"
      data-motion-mode={transition.mode}
      style={{ "--rank-band-duration": `${transition.duration}ms` } as CSSProperties}
      aria-label="Sensitivity rank bands for the 22 Pacific geographies"
    >
      <p className="rank-band-figure__intro">Sensitivity bands, not a fixed scoreboard</p>
      <svg className="rank-band-figure__svg" viewBox={`0 0 400 ${height}`} role="img" aria-label="Rank bands run from 1 to 22; wider bands show more sensitivity to indicator choices.">
        <line className="rank-band-figure__axis" x1={axisX(1)} y1="18" x2={axisX(22)} y2="18" />
        {[1, 11, 22].map((rank) => (
          <text key={rank} className="rank-band-figure__axis-label" x={axisX(rank)} y="11" textAnchor="middle">{rank}</text>
        ))}
        {rows.map((row, index) => {
          const y = 36 + index * 22;
          return (
            <g
              key={row.code}
              className={`rank-band-figure__row${row.highlight ? " rank-band-figure__row--highlight" : ""}`}
              data-code={row.code}
              data-highlight={row.highlight ? "true" : "false"}
              aria-label={`${row.name}, sensitivity band ${row.min} to ${row.max}`}
            >
              <text className="rank-band-figure__name" x="0" y={y + 4}>{row.name}</text>
              <line className="rank-band-figure__band" x1={axisX(row.min)} y1={y} x2={axisX(row.max)} y2={y} />
              <circle className="rank-band-figure__midpoint" cx={axisX(row.midpoint)} cy={y} r={row.highlight ? 4 : 3} />
              {row.highlight && <text className="rank-band-figure__value" x={axisX(row.max) + 7} y={y + 4}>4–19</text>}
            </g>
          );
        })}
      </svg>
      <figcaption className="rank-band-figure__caption">The bands are sensitivity diagnostics, not confidence intervals or a definitive leaderboard.</figcaption>
    </figure>
  );
}
