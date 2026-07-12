import type { Geo } from "../../lib/atlasData";
import { EvidencePortrait } from "./EvidencePortrait";

type PlaceComparisonSceneProps = {
  nauru: Geo;
  tuvalu: Geo;
};

export function PlaceComparisonScene({ nauru, tuvalu }: PlaceComparisonSceneProps) {
  return (
    <figure
      className="place-comparison-figure"
      data-stage-figure="comparison"
      aria-label="Nauru and Tuvalu official-evidence comparison"
    >
      <div className="place-comparison-figure__portraits">
        <EvidencePortrait geo={nauru} />
        <EvidencePortrait geo={tuvalu} />
      </div>
      <figcaption className="place-comparison-figure__caption">Same kind of mark. Different evidence pattern.</figcaption>
    </figure>
  );
}
