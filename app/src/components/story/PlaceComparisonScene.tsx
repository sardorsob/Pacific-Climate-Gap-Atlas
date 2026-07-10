import type { Geo } from "../../lib/atlasData";
import { EvidencePortrait } from "./EvidencePortrait";

type PlaceComparisonSceneProps = {
  nauru: Geo;
  tuvalu: Geo;
};

export function PlaceComparisonScene({ nauru, tuvalu }: PlaceComparisonSceneProps) {
  return (
    <figure className="place-comparison-figure">
      <div className="place-comparison-figure__portraits">
        <EvidencePortrait geo={nauru} selected />
        <EvidencePortrait geo={tuvalu} />
      </div>
      <figcaption className="place-comparison-figure__caption">Same kind of mark. Different evidence pattern.</figcaption>
    </figure>
  );
}
