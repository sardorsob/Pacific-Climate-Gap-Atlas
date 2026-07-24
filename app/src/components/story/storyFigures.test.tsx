import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import generatedGeographies from "../../../public/data/geographies.json";
import { adaptGeographiesPayload } from "../../lib/atlasData";
import { RegionalEvidenceScene } from "./RegionalEvidenceScene";

const regionalGeos = adaptGeographiesPayload(generatedGeographies);
const styles = readFileSync(new URL("../../styles/base.css", import.meta.url), "utf8");

describe("story figures", () => {
  it("renders the complete signed movement field with an explicit incomplete rail", () => {
    const html = renderToStaticMarkup(<RegionalEvidenceScene geos={regionalGeos} mode="movement" />);

    expect(html).toContain('data-mode="movement"');
    expect(html).toContain('data-complete-count="19"');
    expect(html).toContain('data-incomplete-count="3"');
    expect(html).toContain('data-present-count="277"');
    expect(html).toContain('data-absent-count="31"');
    expect((html.match(/data-region-kind="complete"/g) ?? [])).toHaveLength(19);
    expect((html.match(/data-region-kind="incomplete"/g) ?? [])).toHaveLength(3);
    expect((html.match(/class="evidence-mark evidence-mark--neutral" width="14" height="14"/g) ?? [])).toHaveLength(19);
    expect(html).toContain('data-zero-line="water"');
    expect(html).toContain('data-zero-line="renewable"');
    expect(html).toContain("Safely managed drinking water change (percentage points)");
    expect(html).toContain("Renewable energy share change (percentage points)");
    expect(html).toContain("Water up, renewable down");
    expect(html).toContain(">7<");
    expect(html).toContain("Both up");
    expect(html).toContain(">6<");
    expect(html).toContain("Guam");
    expect(html).toContain("renewable +6.11 pp, 2000–2022");
    expect(html).toContain("American Samoa: safely managed drinking water +9.27 percentage points, 2000–2021; renewable energy share +0.49 percentage points, 2000–2022");
  });

  it("renders all 308 visibility cells, the numbered key, and direct coverage facts", () => {
    const html = renderToStaticMarkup(<RegionalEvidenceScene geos={regionalGeos} mode="visibility" />);

    expect(html).toContain('data-mode="visibility"');
    expect((html.match(/data-region-kind="visibility"/g) ?? [])).toHaveLength(22);
    expect((html.match(/data-visibility-cell=/g) ?? [])).toHaveLength(308);
    expect((html.match(/data-cell-state="present"/g) ?? [])).toHaveLength(277);
    expect((html.match(/data-cell-state="absent"/g) ?? [])).toHaveLength(31);
    expect((html.match(/data-key-position=/g) ?? [])).toHaveLength(14);
    expect(html).toContain("277 present");
    expect(html).toContain("31 absent");
    expect(html).toContain("Recorded direct disaster loss 12/22");
    expect(html).toContain("Meteorological monitoring network 18/22");
    expect(html).toContain("Power generation 18/22");
    expect(html).toContain("Safely managed drinking water 19/22");
    expect(html).toContain("Renewable energy share 20/22");
    expect(html).toContain('data-visibility-cell="AS-direct-disaster-economic-loss" data-cell-state="absent" data-role="reporting_visibility_only"');
    expect(html).toContain("American Samoa — Recorded direct disaster loss: absent; role reporting visibility only; latest year unavailable");
    expect(html).toContain('data-visibility-cell="CK-meteorological-monitoring-network" data-cell-state="present" data-role="reporting_presence"');
    expect(html).toContain("Cook Islands — Meteorological monitoring network: present; role reporting presence; latest year 2026");
    expect(html).toContain('class="regional-evidence__cell regional-evidence__cell--absent"');
  });

  it("keeps the exact evidence geometry on pale flat surfaces with static UI-only scene light", () => {
    const rules = styles.match(/[^{}]+\{[^{}]*\}/g) ?? [];
    const rule = (selector: RegExp) => rules.filter((candidate) => selector.test(candidate.split("{")[0].trim())).join("\n");
    const dataRules = rule(/\.map-evidence-mark|\.regional-evidence__movement-point|\.regional-evidence__cell|\[data-cell-state\]/);
    const frameRules = rule(/\.story-scene\[data-stage-mode="figure-takeover"\]|\.story-handoff|\.scene-progress__item\[aria-current="step"\]/);

    expect(rule(/\.story-scene\[data-stage-mode="figure-takeover"\]$/)).toMatch(/background:\s*var\(--paper\);[^}]*border-top:\s*2px solid var\(--ui-light\);/);
    expect(rule(/\.regional-evidence__movement-plot$/)).toMatch(/height:\s*clamp\(20rem,\s*48svh,\s*28rem\);[^}]*background:\s*var\(--paper-2\);/);
    expect(rule(/\.regional-evidence__visibility-row$/)).toMatch(/grid-template-columns:\s*minmax\(4\.5rem,\s*7rem\) repeat\(14,\s*minmax\(0,\s*1fr\)\);/);
    expect(rule(/\.regional-evidence__cell$/)).toMatch(/width:\s*clamp\(9px,\s*1\.15vw,\s*14px\);[^}]*height:\s*clamp\(9px,\s*1\.15vw,\s*14px\);/);
    expect(rule(/\.scene-progress__item\[aria-current="step"\] \.scene-progress__dot$/)).toMatch(/outline:\s*2px solid var\(--ui-light\);[^}]*outline-offset:\s*2px;/);
    expect(rule(/\.story-handoff$/)).toMatch(/border-top:\s*2px solid var\(--ui-light\);/);
    expect(dataRules).not.toMatch(/(?:box-shadow|text-shadow|(?:-webkit-)?(?:backdrop-)?filter|animation(?:-[\w-]+)?|background(?:-image)?\s*:[^;}]*gradient|var\(--ui-light\))/i);
    expect(frameRules).not.toMatch(/var\(--caveat|#e9c98f|(?:pulse|sweep|ripple|shimmer)/i);
    expect(styles).not.toMatch(/@keyframes\s+(?:pulse|sweep|ripple|shimmer)\b/i);
  });
});
