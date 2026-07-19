import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ScoreKey } from "../../lib/encoding";
import { atlasLayers } from "../../lib/layers";
import { LayerControls } from "./LayerControls";

function renderControls(
  viewMode: "overview" | "default" | "coverage" | "uncertainty" = "overview",
  outlookOn = false,
  activeScore: ScoreKey = "gap",
) {
  return renderToStaticMarkup(
    <LayerControls
      layers={atlasLayers}
      activeScore={activeScore}
      viewMode={viewMode}
      outlookOn={outlookOn}
      onScore={() => undefined}
      onViewMode={() => undefined}
      onToggleOutlook={() => undefined}
    />,
  );
}

function controlGroups(html: string) {
  const evidenceStart = html.indexOf('role="group" aria-label="Evidence views"');
  return {
    score: html.slice(html.indexOf('role="group" aria-label="Score layer"'), evidenceStart),
    evidence: html.slice(evidenceStart),
  };
}

function buttonText(group: string, accessibleName: string) {
  const label = `aria-label="${accessibleName}"`;
  const labelStart = group.indexOf(label);
  const buttonStart = group.lastIndexOf("<button", labelStart);
  const contentStart = group.indexOf(">", buttonStart);
  const contentEnd = group.indexOf("</button>", contentStart);

  if (
    labelStart < 0 ||
    buttonStart < 0 ||
    contentStart < 0 ||
    contentEnd < 0 ||
    buttonStart > labelStart ||
    labelStart + label.length > contentStart ||
    contentStart > contentEnd
  ) {
    throw new Error(`Could not find button content for ${accessibleName}`);
  }

  return group.slice(contentStart + 1, contentEnd).replace(/<[^>]+>/g, "").trim();
}

describe("LayerControls", () => {
  it("presents complete score and evidence-view groups", () => {
    const html = renderControls();
    const groups = controlGroups(html);

    expect((groups.score.match(/<button/g) ?? [])).toHaveLength(3);
    expect((groups.evidence.match(/<button/g) ?? [])).toHaveLength(3);
    expect(groups.evidence).toContain('class="controls__segment controls__segment--views"');
    expect(buttonText(groups.evidence, "Data coverage: show where official records are missing or sparse")).toBe("Data coverage");
    expect(buttonText(groups.evidence, "Rank ranges: show uncertainty across valid indicator choices")).toBe("Rank ranges");
    expect(buttonText(groups.evidence, "2030 stress test: explore a directional scenario, not a forecast")).toBe("2030 stress test");
  });

  it("preserves pressed state across all six actions", () => {
    for (const layer of atlasLayers) {
      const groups = controlGroups(renderControls("default", false, layer.id));
      expect((groups.score.match(/aria-pressed="true"/g) ?? [])).toHaveLength(1);
      expect(groups.score).toMatch(new RegExp(`aria-pressed="true"[^>]*>${layer.label}<`));
    }

    for (const [view, outlook, name] of [
      ["coverage", false, "Data coverage"],
      ["uncertainty", false, "Rank ranges"],
      ["default", true, "2030 stress test"],
    ] as const) {
      const groups = controlGroups(renderControls(view, outlook));
      expect((groups.evidence.match(/aria-pressed="true"/g) ?? [])).toHaveLength(1);
      expect(groups.evidence).toMatch(new RegExp(`aria-label="${name}:[^"]*"[^>]*aria-pressed="true"`));
    }
  });
});
