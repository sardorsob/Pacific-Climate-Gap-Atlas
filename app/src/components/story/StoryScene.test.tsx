import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SCENES } from "../../lib/scenes";
import { StoryScene } from "./StoryScene";

describe("StoryScene", () => {
  it("labels the premise without counting it as an evidence scene", () => {
    const html = renderToStaticMarkup(<StoryScene scene={SCENES[0]} index={0} total={6} />);

    expect(html).toContain("What this atlas is asking");
    expect(html).not.toContain("Scene 1 of 6");
  });

  it("numbers only the five evidence scenes", () => {
    const html = renderToStaticMarkup(<StoryScene scene={SCENES[1]} index={1} total={6} />);

    expect(html).toContain("Scene 1 of 5");
  });
});
