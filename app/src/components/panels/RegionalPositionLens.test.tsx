import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import generatedGeographies from "../../../public/data/geographies.json";
import { adaptGeographiesPayload } from "../../lib/atlasData";
import { RegionalPositionLens, visibilityGroupLabels } from "./RegionalPositionLens";
import { buildRegionalPositionModel } from "./regionalPositionModel";

const geos = adaptGeographiesPayload(generatedGeographies);

function renderLens(code: string, records = geos) {
  return renderToStaticMarkup(
    <RegionalPositionLens geo={records.find((geo) => geo.code === code)!} geos={records} />,
  );
}

function stripHtml(html: string, id: string) {
  const start = html.indexOf(`data-regional-strip="${id}"`);
  const end = html.indexOf("</section>", start);
  return start < 0 || end < 0 ? "" : html.slice(start, end + "</section>".length);
}

describe("RegionalPositionLens", () => {
  it("makes each continuous selected value the entry point with its unit and own clock", () => {
    const html = renderLens("NR");
    const water = stripHtml(html, "water");
    const renewable = stripHtml(html, "renewable");

    expect(water).toContain('<h3 class="regional-lens__title">Safely managed drinking water</h3>');
    expect(water).toContain('<strong class="regional-lens__value">+1.92</strong><span>points</span>');
    expect(water).toContain('<span class="regional-lens__clock">Change · 2000–2020</span>');
    expect(renewable).toContain('<h3 class="regional-lens__title">Renewable energy share</h3>');
    expect(renewable).toContain('<strong class="regional-lens__value">+1.75</strong><span>points</span>');
    expect(renewable).toContain('<span class="regional-lens__clock">Change · 2000–2022</span>');
    expect((water.match(/>points</g) ?? [])).toHaveLength(1);
    expect((renewable.match(/>points</g) ?? [])).toHaveLength(1);
  });

  it("renders exactly two independent continuous zero and median references with bare endpoints", () => {
    const html = renderLens("NR");
    const water = stripHtml(html, "water");
    const renewable = stripHtml(html, "renewable");

    expect(html.match(/data-zero-reference/g) ?? []).toHaveLength(2);
    expect(html.match(/data-continuous-median/g) ?? []).toHaveLength(2);
    expect(water).toContain('data-endpoint="low"');
    expect(water).toContain('>−11.23</text>');
    expect(water).toContain('>+18.49</text>');
    expect(water).toContain('>regional median +0.67</text>');
    expect(renewable).toContain('>regional median +0.01</text>');
    expect(water).not.toMatch(/data-endpoint="(?:low|high)"[^>]*>[^<]*percentage points/);
    expect(renewable).not.toMatch(/data-endpoint="(?:low|high)"[^>]*>[^<]*percentage points/);
  });

  it("provides one named focus surface and one reserved live inspector per continuous metric", () => {
    const html = renderLens("AS");
    const water = stripHtml(html, "water");

    expect(html.match(/data-continuous-plot/g) ?? []).toHaveLength(2);
    expect((water + stripHtml(html, "renewable")).match(/tabindex="0"/g) ?? []).toHaveLength(2);
    expect((water + stripHtml(html, "renewable")).match(/aria-live="polite" aria-atomic="true"/g) ?? []).toHaveLength(2);
    expect(water).toContain('role="img" aria-label="Safely managed drinking water change. Selected: American Samoa');
    expect(water).not.toMatch(/^data-regional-strip="water" role="group"/);
    expect(water).toContain('aria-describedby="water-inspector-instructions water-inspector"');
    expect(water).toContain("Use Left and Right to inspect regional peers; Escape clears inspection.");
    expect(water).toContain('id="water-inspector" class="regional-lens__meta regional-lens__inspector" aria-live="polite" aria-atomic="true">19 places with comparable change · 3 unavailable</p>');
    expect(html).not.toMatch(/data-peer-mark[^>]*tabindex/);
  });

  it("shows explicit continuous unavailable states while keeping essential counts visible", () => {
    const html = renderLens("PN");
    const water = stripHtml(html, "water");
    const renewable = stripHtml(html, "renewable");
    const visibility = stripHtml(html, "visibility");

    expect(water).toContain('<strong class="regional-lens__unavailable">Unavailable</strong>');
    expect(water).toContain("No comparable period in the reviewed regional series");
    expect(water).toContain("19 places with comparable change · 3 unavailable");
    expect(renewable).toContain("20 places with comparable change · 2 unavailable");
    expect(water).not.toContain("data-selected-mark");
    expect(renewable).not.toContain("data-selected-mark");
    expect(visibility).toContain("data-selected-mark");
  });

  it("renders visibility as six ordered categorical groups with exact counts and marks", () => {
    const html = renderLens("NR");
    const visibility = stripHtml(html, "visibility");

    expect([...visibility.matchAll(/data-visibility-group="(\d+)" data-group-count="(\d+)"/g)]
      .map(([, value, count]) => [Number(value), Number(count)]))
      .toEqual([[6, 1], [10, 2], [11, 3], [12, 2], [13, 2], [14, 12]]);
    expect(visibility.match(/data-visibility-mark/g) ?? []).toHaveLength(22);
    expect(visibility).toMatch(/data-selected-mark="true" data-selected-group="13"/);
    expect(visibility).toContain('<h3 class="regional-lens__title">Reviewed datasets with a record</h3>');
    expect(visibility).toContain('<strong class="regional-lens__value">13 of 14</strong>');
    expect(visibility).toContain("12 of 22 places have records in all 14 reviewed datasets");
  });

  it("uses one inspectable tally without a visibility median or continuous axis", () => {
    const html = renderLens("NR");
    const visibility = stripHtml(html, "visibility");

    expect(visibility.match(/data-visibility-tally/g) ?? []).toHaveLength(1);
    expect(visibility.match(/tabindex="0"/g) ?? []).toHaveLength(1);
    expect(visibility.match(/aria-live="polite" aria-atomic="true"/g) ?? []).toHaveLength(1);
    expect(visibility).toContain('aria-describedby="visibility-inspector-instructions visibility-inspector"');
    expect(visibility).toContain("Use Left and Right to inspect visibility groups; Escape clears inspection.");
    expect(visibility).not.toMatch(/data-(?:continuous-)?median|regional median|data-zero-reference|regional-lens__axis|data-endpoint/);
  });

  it("keeps full group names accessible while truncating the long visible list", () => {
    const visibility = buildRegionalPositionModel(geos, "FJ")[2];
    const labels = visibilityGroupLabels(visibility.groups.at(-1)!);

    expect(labels.visible).toBe("14 of 14: Fiji, Federated States of Micronesia, Kiribati +9 more");
    expect(labels.full).toBe("14 of 14: Fiji, Federated States of Micronesia, Kiribati, Marshall Islands, New Caledonia, French Polynesia, Papua New Guinea, Palau, Solomon Islands, Tonga, Vanuatu, Samoa");
    expect(labels.full).not.toContain("best");
    expect(labels.full).not.toContain("complete");
  });

  it("keeps the accepted continuous-strip contract alongside the tally", () => {
    const html = renderLens("PN");

    expect(html.match(/data-continuous-plot/g) ?? []).toHaveLength(2);
    expect(html.match(/data-continuous-median/g) ?? []).toHaveLength(2);
    expect(html.match(/data-zero-reference/g) ?? []).toHaveLength(2);
    expect(html).toContain("19 places with comparable change · 3 unavailable");
    expect(html).toContain("20 places with comparable change · 2 unavailable");
  });

  it("keeps every peer and selected ring inside the larger continuous viewBox", () => {
    const html = renderLens("NR");
    const continuous = stripHtml(html, "water") + stripHtml(html, "renewable");
    const positions = [...continuous.matchAll(/data-(?:peer|selected)-mark[^>]*cx="([^"]+)" cy="([^"]+)" r="([^"]+)"/g)]
      .map(([, cx, cy, radius]) => [Number(cx), Number(cy), Number(radius)]);

    expect(positions).toHaveLength(41);
    for (const [cx, cy, radius] of positions) {
      expect(cx - radius).toBeGreaterThanOrEqual(0);
      expect(cx + radius).toBeLessThanOrEqual(320);
      expect(cy - radius).toBeGreaterThanOrEqual(0);
      expect(cy + radius).toBeLessThanOrEqual(80);
    }
  });

  it("renders endpoint and tie cases from the frozen model without changing its scale", () => {
    const records = geos.slice(0, 3).map((geo, index) => ({
      ...geo,
      regionalStory: {
        ...geo.regionalStory,
        water: { ...geo.regionalStory.water, changePercentagePoints: index ? 3 : -2 },
      },
    }));
    const html = renderLens(records[1].code, records);
    const water = stripHtml(html, "water");

    expect(water).toContain(">−2.00</text>");
    expect(water).toContain(">+3.00</text>");
    expect(water.match(/data-peer-mark/g) ?? []).toHaveLength(3);
  });

  it("keeps the selected ring unfilled", () => {
    const css = readFileSync(new URL("../../styles/base.css", import.meta.url), "utf8");

    expect(css).toMatch(/\.regional-lens__selected\s*\{[^}]*fill:\s*none;/);
  });

  it("uses one centered measure column and the approved type and spacing rhythm", () => {
    const css = readFileSync(new URL("../../styles/base.css", import.meta.url), "utf8");

    expect(css).toMatch(/\.regional-lens\s*\{[^}]*gap:\s*18px;[^}]*\}/);
    expect(css).toMatch(/\.regional-lens\s*>\s*\.panel__h,\s*\.regional-lens__strip\s*\{[^}]*width:\s*min\(100%,\s*320px\);[^}]*justify-self:\s*center;/);
    expect(css).toMatch(/\.regional-lens__strip\s*\{[^}]*gap:\s*3px;/);
    expect(css).toMatch(/\.regional-lens__head\s*\{[^}]*display:\s*grid;[^}]*gap:\s*3px;/);
    expect(css).toMatch(/\.regional-lens__title\s*\{[^}]*font:\s*600\s+12\.5px\s+Georgia,\s*serif;/);
    expect(css).toMatch(/\.regional-lens__readout\s*\{[^}]*display:\s*flex;[^}]*align-items:\s*baseline;[^}]*flex-wrap:\s*wrap;/);
    expect(css).toMatch(/\.regional-lens__value\s*\{[^}]*font:\s*700\s+24px\s+var\(--font-sans\);/);
    expect(css).toMatch(/\.regional-lens__readout\s*>\s*span\s*\{[^}]*font-size:\s*11px;/);
    expect(css).toMatch(/\.regional-lens__plot\s*\{[^}]*margin-top:\s*5px;/);
    expect(css).toMatch(/\.regional-lens__plot\s+text\s*\{[^}]*font:\s*10px\s+var\(--font-sans\);/);
    expect(css).toMatch(/\.regional-lens__plot\s+\.regional-lens__group-value\s*\{[^}]*font-size:\s*11px;/);
    expect(css).toMatch(/\.regional-lens__inspector\s*\{[^}]*min-height:\s*2\.7em;/);
    expect(css).not.toMatch(/\.regional-lens__clock\s*\{[^}]*float:/);
    expect(css).not.toContain(".regional-lens__label");
  });

  it("bounds the continuous hit surface while preserving visibility overflow", () => {
    const css = readFileSync(new URL("../../styles/base.css", import.meta.url), "utf8");

    expect(css).toMatch(/\.regional-lens__peer\s*\{[^}]*fill:\s*var\(--line\);/);
    expect(css).toMatch(/\.regional-lens__plot\s*\{[^}]*overflow:\s*visible;/);
    expect(css).toMatch(/\.regional-lens__plot--continuous\s*\{[^}]*max-width:\s*320px;[^}]*justify-self:\s*center;/);
    const continuous = stripHtml(renderLens("NR"), "water") + stripHtml(renderLens("NR"), "renewable");
    expect(continuous.match(/class="regional-lens__hit-band"[^>]*height="44" fill="transparent" style="pointer-events:all"/g) ?? []).toHaveLength(2);
  });
});
