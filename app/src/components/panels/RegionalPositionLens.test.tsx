import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import generatedGeographies from "../../../public/data/geographies.json";
import { adaptGeographiesPayload } from "../../lib/atlasData";
import { RegionalPositionLens } from "./RegionalPositionLens";

const geos = adaptGeographiesPayload(generatedGeographies);

function renderLens(code: string, records = geos) {
  return renderToStaticMarkup(
    <RegionalPositionLens geo={records.find((geo) => geo.code === code)!} geos={records} />,
  );
}

describe("RegionalPositionLens", () => {
  it("renders all current peer marks with selected rings and descriptive medians", () => {
    const html = renderLens("NR");

    expect(html.match(/data-peer-mark/g) ?? []).toHaveLength(61);
    expect(html.match(/data-selected-mark/g) ?? []).toHaveLength(3);
    expect(html.match(/data-median-tick/g) ?? []).toHaveLength(3);
    expect(html).toContain("Where Nauru sits in the Pacific");
    expect(html).toContain("Selected: Nauru +1.92 percentage points");
    expect(html).toContain("Selected: Nauru 13 of 14");
    expect(html).toContain("−11.23 percentage points");
    expect(html).toContain("+18.49 percentage points");
    expect(html).toContain("regional median +0.67 percentage points");
    expect(html).toContain("3 unavailable");
  });

  it("keeps each selected change record's own reviewed clock visible", () => {
    const html = renderLens("NR");

    expect(html).toContain("2000 to 2020");
    expect(html).toContain("2000 to 2022");
  });

  it("keeps selected nulls outside the scale without a substitute ring", () => {
    const html = renderLens("PN");

    expect(html).toContain("Pitcairn unavailable for a comparable period in the reviewed regional series");
    expect(html.match(/data-selected-mark/g) ?? []).toHaveLength(1);
    expect(html.match(/data-unavailable-count/g) ?? []).toHaveLength(2);
  });

  it("keeps peer marks non-interactive while exposing a concise accessible summary", () => {
    const html = renderLens("AS");

    expect(html).toContain('aria-label="Safely managed drinking-water change. Selected American Samoa');
    expect(html).not.toMatch(/data-peer-mark[^>]*tabindex/);
    expect(html).not.toMatch(/data-median-tick[^>]*tabindex/);
  });

  it("keeps every tied peer and selected ring inside the strip viewBox", () => {
    const html = renderLens("NR");
    const positions = [...html.matchAll(/data-(?:peer|selected)-mark[^>]*cy="([^"]+)"[^>]*r="([^"]+)"/g)]
      .map(([, cy, radius]) => [Number(cy), Number(radius)]);

    expect(positions).toHaveLength(64);
    for (const [cy, radius] of positions) {
      expect(cy - radius).toBeGreaterThanOrEqual(0);
      expect(cy + radius).toBeLessThanOrEqual(46);
    }
  });

  it("renders endpoint and collision cases from the frozen model without changing its scale", () => {
    const records = geos.slice(0, 3).map((geo, index) => ({
      ...geo,
      regionalStory: {
        ...geo.regionalStory,
        water: { ...geo.regionalStory.water, changePercentagePoints: index ? 3 : -2 },
      },
    }));
    const html = renderLens(records[1].code, records);

    expect(html).toContain("−2.00 percentage points");
    expect(html).toContain("+3.00 percentage points");
    expect(html.match(/data-peer-mark/g) ?? []).toHaveLength(8);
  });
});
