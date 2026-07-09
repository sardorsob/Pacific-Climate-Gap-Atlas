import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Geo } from "../../lib/atlasData";
import { CountryPanel } from "./CountryPanel";

const geo = {
  code: "NR",
  name: "Nauru",
  subregion: "Micronesia",
  status: "Country",
  lon: 166.93,
  lat: -0.52,
  gap: 89,
  pressure: 62,
  capacity: 27,
  indicators: 8,
  reportingStatus: "reported_zero_latest_count",
  monitoringCount: 0,
  latestMonitoringYear: 2026,
  storyPriority: 1,
  rankMin: 1,
  rankMax: 7,
  rankRange: 6,
  robustness: "fragile",
  storyLabel: "High gap with a reporting caveat.",
  topPressure: ["Sea level (75.0)"],
  topCapacity: ["Monitoring (0.0)"],
  indicatorRows: [],
  similarityNeighbors: [
    { code: "MP", name: "Northern Mariana Islands", rank: 1, jsd: 0.0797, band: "similar profile", reason: "First reason.", caveat: "Profile caveat." },
    { code: "GU", name: "Guam", rank: 2, jsd: 0.0809, band: "similar profile", reason: "Second reason.", caveat: "Profile caveat." },
  ],
  outlook2030Flat: 70,
  outlookDisplay: "show_with_strong_caveat",
} satisfies Geo;

describe("CountryPanel", () => {
  it("uses the visible similarity-neighbor limit shared with map arcs", () => {
    const html = renderToStaticMarkup(
      <CountryPanel
        geo={geo}
        similarityNeighborLimit={1}
        onClose={() => undefined}
        onOpenMethod={() => undefined}
      />,
    );

    expect(html).toContain("Northern Mariana Islands");
    expect(html).toContain("JSD 0.080");
    expect(html).not.toContain("Guam");
    expect(html).not.toContain("JSD 0.081");
  });
});
