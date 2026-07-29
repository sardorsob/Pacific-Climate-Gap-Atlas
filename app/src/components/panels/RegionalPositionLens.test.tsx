import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
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

function stripHtml(html: string, id: string) {
  return html.match(new RegExp(`data-regional-strip="${id}"[\\s\\S]*?</section>`))?.[0] ?? "";
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
    const water = stripHtml(html, "water");
    const renewable = stripHtml(html, "renewable");
    const visibility = stripHtml(html, "visibility");

    expect(html).toContain("Selected: Pitcairn 6 of 14");
    expect(water).toContain("3 unavailable");
    expect(renewable).toContain("2 unavailable");
    expect(water).not.toContain("data-selected-mark");
    expect(renewable).not.toContain("data-selected-mark");
    expect(visibility).toContain("data-selected-mark");
  });

  it("keeps peer marks non-interactive while exposing a concise accessible summary", () => {
    const html = renderLens("AS");
    const water = stripHtml(html, "water");

    expect(water).toMatch(/^data-regional-strip="water" role="img" aria-label="Safely managed drinking-water change. Selected American Samoa/);
    expect(water).toContain('class="regional-lens__label" aria-hidden="true"');
    expect(water).toContain('class="regional-lens__plot" viewBox="0 0 320 46" aria-hidden="true"');
    expect(water).toContain('class="regional-lens__meta" aria-hidden="true"');
    expect(html).not.toMatch(/data-peer-mark[^>]*tabindex/);
    expect(html).not.toMatch(/data-median-tick[^>]*tabindex/);
  });

  it("aligns observed endpoint labels to their independent padded scales", () => {
    const html = renderLens("NR");
    const waterXs = [...stripHtml(html, "water").matchAll(/<text x="([^"]+)"/g)].map(([, x]) => Number(x));
    const visibilityXs = [...stripHtml(html, "visibility").matchAll(/<text x="([^"]+)"/g)].map(([, x]) => Number(x));

    expect(waterXs[0]).toBeCloseTo(29.0909, 3);
    expect(visibilityXs).toEqual([139.42857142857142, 304]);
  });

  it("keeps the selected ring unfilled", () => {
    const css = readFileSync(new URL("../../styles/base.css", import.meta.url), "utf8");

    expect(css).toMatch(/\.regional-lens__selected\s*\{[^}]*fill:\s*none;/);
  });

  it("uses the existing 3:1 panel-boundary token for neutral peer marks", () => {
    const css = readFileSync(new URL("../../styles/base.css", import.meta.url), "utf8");

    expect(css).toMatch(/\.regional-lens__peer\s*\{[^}]*fill:\s*var\(--line\);/);
  });

  it("keeps every tied peer and selected ring inside the strip viewBox", () => {
    const html = renderLens("NR");
    const positions = [...html.matchAll(/data-(?:peer|selected)-mark[^>]*cx="([^"]+)" cy="([^"]+)" r="([^"]+)"/g)]
      .map(([, cx, cy, radius]) => [Number(cx), Number(cy), Number(radius)]);

    expect(positions).toHaveLength(64);
    for (const [cx, cy, radius] of positions) {
      expect(cx - radius).toBeGreaterThanOrEqual(0);
      expect(cx + radius).toBeLessThanOrEqual(320);
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
