import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ExplorerPanelNav } from "./ExplorerPanelNav";

describe("ExplorerPanelNav", () => {
  it("shows Close only for a diagnostic root", () => {
    const html = renderToStaticMarkup(
      <ExplorerPanelNav
        title="Data coverage"
        expanded
        onClose={() => undefined}
        onToggleExpanded={() => undefined}
      />,
    );

    expect(html).toContain('aria-label="Panel navigation"');
    expect(html).toContain("Close");
    expect(html).not.toContain("Back to");
  });

  it("adds a contextual Back action for a diagnostic child", () => {
    const html = renderToStaticMarkup(
      <ExplorerPanelNav
        title="Nauru"
        backLabel="Back to data coverage"
        expanded
        onBack={() => undefined}
        onClose={() => undefined}
        onToggleExpanded={() => undefined}
      />,
    );

    expect(html).toContain("Back to data coverage");
    expect(html).toContain('aria-label="Close panel"');
    expect(html).toContain('aria-expanded="true"');
  });

  it("keeps ordinary selected-place detail to Close without Back", () => {
    const html = renderToStaticMarkup(
      <ExplorerPanelNav
        title="Nauru"
        expanded={false}
        onClose={() => undefined}
        onToggleExpanded={() => undefined}
      />,
    );

    expect(html).toContain('aria-label="Toggle Nauru panel"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-label="Close panel"');
    expect(html).not.toContain("Back to");
  });
});
