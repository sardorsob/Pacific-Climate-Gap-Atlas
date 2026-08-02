import { readFileSync } from "node:fs";
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

    expect(water).toContain('<h3 class="regional-lens__title">Safely managed drinking-water change</h3>');
    expect(water).toContain('<strong class="regional-lens__value">+1.92</strong><span>points</span>');
    expect(water).toContain('<span class="regional-lens__clock">2000 to 2020</span>');
    expect(renewable).toContain('<strong class="regional-lens__value">+1.75</strong><span>points</span>');
    expect(renewable).toContain('<span class="regional-lens__clock">2000 to 2022</span>');
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
    expect(html.match(/tabindex="0"/g) ?? []).toHaveLength(2);
    expect(html.match(/aria-live="polite" aria-atomic="true"/g) ?? []).toHaveLength(2);
    expect(water).toContain('role="img" aria-label="Safely managed drinking-water change. Selected: American Samoa');
    expect(water).not.toMatch(/^data-regional-strip="water" role="group"/);
    expect(water).toContain('aria-describedby="water-inspector-instructions water-inspector"');
    expect(water).toContain("Use Left and Right to inspect regional peers; Escape clears inspection.");
    expect(water).toContain('id="water-inspector" class="regional-lens__meta regional-lens__inspector" aria-live="polite" aria-atomic="true">19 recorded · 3 unavailable</p>');
    expect(html).not.toMatch(/data-peer-mark[^>]*tabindex/);
  });

  it("shows explicit continuous unavailable states while keeping essential counts visible", () => {
    const html = renderLens("PN");
    const water = stripHtml(html, "water");
    const renewable = stripHtml(html, "renewable");
    const visibility = stripHtml(html, "visibility");

    expect(water).toContain('<strong class="regional-lens__unavailable">Unavailable</strong>');
    expect(water).toContain("No comparable period in the reviewed regional series");
    expect(water).toContain("19 recorded · 3 unavailable");
    expect(renewable).toContain("20 recorded · 2 unavailable");
    expect(water).not.toContain("data-selected-mark");
    expect(renewable).not.toContain("data-selected-mark");
    expect(visibility).toContain("data-selected-mark");
  });

  it("keeps the visibility strip rendering unchanged for TASK-109", () => {
    const html = renderLens("NR");
    const visibility = stripHtml(html, "visibility");
    const visibilityLabel = visibility.match(/aria-label="([^"]+)"/)?.[1] ?? "";

    expect(visibility).toMatch(/^data-regional-strip="visibility" role="img" aria-label="Reviewed datasets represented\./);
    expect(visibility).toContain('<div class="regional-lens__label" aria-hidden="true">');
    expect(visibility).toContain('<svg class="regional-lens__plot" viewBox="0 0 320 46" aria-hidden="true">');
    expect(visibility).toContain("Selected: Nauru 13 of 14");
    expect(visibilityLabel).toContain("Selected Nauru 13 of 14");
    expect(visibility).toContain("regional median 14 of 14");
    expect(visibility).toContain("data-median-tick");
    expect(visibility).not.toContain("data-continuous-plot");
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

  it("uses the existing panel-boundary token for neutral peer marks and a 44px hit band", () => {
    const css = readFileSync(new URL("../../styles/base.css", import.meta.url), "utf8");

    expect(css).toMatch(/\.regional-lens__peer\s*\{[^}]*fill:\s*var\(--line\);/);
    expect(renderLens("NR").match(/class="regional-lens__hit-band"[^>]*height="44" fill="transparent" style="pointer-events:all"/g) ?? []).toHaveLength(2);
  });
});
