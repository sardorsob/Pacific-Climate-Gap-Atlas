import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FingerprintPreview } from "./FingerprintPreview";
import type { Geo } from "../../lib/atlasData";

describe("FingerprintPreview", () => {
  it("renders Nauru's live similarity neighbors", () => {
    const geos = [
      {
        code: "NR",
        name: "Nauru",
        similarityNeighbors: [
          {
            code: "TV",
            name: "Tuvalu",
            rank: 1,
            jsd: 0.03,
            band: "very similar profile",
            reason: "Live generated reason.",
            caveat: "Live generated caveat.",
          },
        ],
      },
    ] as Geo[];

    const html = renderToStaticMarkup(<FingerprintPreview geos={geos} />);

    expect(html).toContain("Tuvalu");
    expect(html).toContain("Live generated reason.");
    expect(html).toContain("Live generated caveat.");
  });
});
