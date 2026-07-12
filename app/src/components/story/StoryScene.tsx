import type { ReactNode } from "react";
import type { Scene } from "../../lib/scenes";

type StorySceneProps = {
  scene: Scene;
  index: number;
  total: number;
  children?: ReactNode;
};

export function StoryScene({ scene, index, total, children }: StorySceneProps) {
  const premise = scene.visual === "premise";
  const eyebrow = premise
    ? "What this atlas is asking"
    : `Scene ${index} of ${total - 1} · ${scene.short}`;

  return (
    <article className="story-scene__content">
      <p className="story-scene__eyebrow">{eyebrow}</p>
      <h2 className="story-scene__title">{scene.title}</h2>
      <p className="story-scene__claim">{scene.claim}</p>
      <p className="story-scene__caveat">{scene.caveat}</p>
      {children && <div className="story-scene__extra">{children}</div>}
      {scene.source && <p className="story-scene__source">Evidence: {scene.source}</p>}
    </article>
  );
}
