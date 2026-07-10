import type { ReactNode } from "react";
import type { Beat } from "../../lib/tour";

type StorySceneProps = {
  beat: Beat;
  index: number;
  total: number;
  children?: ReactNode;
};

export function StoryScene({ beat, index, total, children }: StorySceneProps) {
  return (
    <article className="story-scene__content">
      <p className="story-scene__eyebrow">
        Scene {index + 1} of {total} · {beat.short}
      </p>
      <h2 className="story-scene__title">{beat.title}</h2>
      <p className="story-scene__claim">{beat.claim}</p>
      <p className="story-scene__caveat">{beat.caveat}</p>
      {children && <div className="story-scene__extra">{children}</div>}
      {beat.source && <p className="story-scene__source">Evidence: {beat.source}</p>}
      {beat.action && <p className="story-scene__action">{beat.action}</p>}
    </article>
  );
}
