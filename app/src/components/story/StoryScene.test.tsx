import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SCENES } from "../../lib/scenes";
import { StoryScene } from "./StoryScene";

describe("StoryScene", () => {
  it("labels the premise without counting it as an evidence scene", () => {
    const html = renderToStaticMarkup(<StoryScene scene={SCENES[0]} index={0} total={4} />);

    expect(html).toContain("What the records show");
    expect(html).not.toContain("Scene 1 of 4");
  });

  it("numbers only the three scenes after the premise", () => {
    const html = renderToStaticMarkup(<StoryScene scene={SCENES[1]} index={1} total={4} />);

    expect(html).toContain("Scene 1 of 3");
  });
});
