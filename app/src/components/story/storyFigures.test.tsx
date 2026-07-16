import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import generatedGeographies from "../../../public/data/geographies.json";
import { adaptGeographiesPayload } from "../../lib/atlasData";
import { RegionalEvidenceScene } from "./RegionalEvidenceScene";

const regionalGeos = adaptGeographiesPayload(generatedGeographies);

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
});
