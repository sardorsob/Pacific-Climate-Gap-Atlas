import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MethodDrawer } from "./MethodDrawer";
import { CountryPanel } from "./panels/CountryPanel";

describe("public opening copy", () => {
  it("frames methods around the regional evidence thesis rather than an index-first default", () => {
    const html = renderToStaticMarkup(<MethodDrawer open onClose={() => undefined} />);

    expect(html).toContain("How conditions and official records differ across 22 Pacific places.");
    expect(html).toContain("Official records show different changes across Pacific places");
    expect(html).not.toContain("maps where the gap looks widest");
  });

  it("documents both guided methods and exactly the 14 reviewed story datasets", () => {
    const html = renderToStaticMarkup(<MethodDrawer open onClose={() => undefined} />);
    const datasetList = html.match(/<h3>Datasets<\/h3><ul[^>]*>([\s\S]*?)<\/ul>/)?.[1] ?? "";
    const datasets = [
      "Mean sea-surface temperature anomalies",
      "Mean surface temperature anomalies",
      "Rainfall anomalies",
      "Sea level anomalies",
      "Directly affected persons (disasters)",
      "Meteorological monitoring network",
      "Power generation",
      "Fisheries management measures",
      "GHG emissions per capita (responsibility context)",
      "Projected population growth",
      "Renewable energy share",
      "Safely managed drinking water",
      "Recorded direct disaster loss (reporting visibility only)",
      "Climate-altering land-cover index",
    ];

    expect((datasetList.match(/<li>/g) ?? [])).toHaveLength(14);
    for (const dataset of datasets) expect(datasetList).toContain(dataset);
    expect(html).toContain("first-to-latest values within each place");
    expect(html).toContain("separate percentage-point changes");
    expect(html).toContain("own meaning, denominator, and reporting clock");
    expect(html).toContain("descriptive and non-causal");
    expect(html).toContain("whether each of 14 reviewed official datasets has a returned record");
    expect(html).toContain("Presence is not completeness, quality, currency, infrastructure, conditions, or local knowledge.");
    expect(html).toContain("does not mean zero loss");
  });

  it("opens the empty detail panel with the approved atlas title and thesis", () => {
    const html = renderToStaticMarkup(
      <CountryPanel geo={null} onClose={() => undefined} onOpenMethod={() => undefined} />,
    );

    expect(html).toContain("Pacific Climate Evidence Atlas");
    expect(html).toContain("How conditions and official records differ across 22 Pacific places.");
    expect(html).not.toContain("Where climate pressure and visible capacity are unevenly matched");
  });
});
