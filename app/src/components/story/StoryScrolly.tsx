import { useEffect, useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { BookOpen, Compass } from "lucide-react";
import type { Beat } from "../../lib/tour";
import { pickActiveScene, sceneIndexAfterKey } from "../../lib/sceneState";
import { SceneProgress } from "./SceneProgress";
import { StoryScene } from "./StoryScene";

type StoryScrollyProps = {
  beats: Beat[];
  index: number;
  onActiveChange: (index: number) => void;
  onExplore: () => void;
  onOpenMethod: () => void;
  renderExtra?: (beat: Beat) => ReactNode;
};

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function StoryScrolly({
  beats,
  index,
  onActiveChange,
  onExplore,
  onOpenMethod,
  renderExtra,
}: StoryScrollyProps) {
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const intersections = useRef(new Map<number, { index: number; ratio: number; isIntersecting: boolean }>());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sceneIndex = Number((entry.target as HTMLElement).dataset.sceneIndex);
          intersections.current.set(sceneIndex, {
            index: sceneIndex,
            ratio: entry.intersectionRatio,
            isIntersecting: entry.isIntersecting,
          });
        });
        const active = pickActiveScene(Array.from(intersections.current.values()));
        if (active !== null) onActiveChange(active);
      },
      { root: null, rootMargin: "-20% 0px -20% 0px", threshold: [0.25, 0.5, 0.75, 1] },
    );

    sectionRefs.current.forEach((section) => section && observer.observe(section));
    return () => observer.disconnect();
  }, [beats.length, onActiveChange]);

  const jumpToScene = (sceneIndex: number) => {
    const next = Math.max(0, Math.min(beats.length - 1, sceneIndex));
    sectionRefs.current[next]?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    jumpToScene(sceneIndexAfterKey(index, event.key, beats.length));
  };

  return (
    <main className="story-scrolly" aria-label="Guided atlas story" tabIndex={0} onKeyDown={onKeyDown}>
      <div className="story-scrolly__top">
        <span className="story-scrolly__brand">
          <Compass aria-hidden="true" size={14} /> Guided atlas
        </span>
        <div className="story-scrolly__actions">
          <button type="button" className="ghost-btn" onClick={onOpenMethod}>
            <BookOpen aria-hidden="true" size={14} /> Methods
          </button>
          <button type="button" className="ghost-btn ghost-btn--accent" onClick={onExplore}>
            Explore freely
          </button>
        </div>
      </div>

      <SceneProgress beats={beats} index={index} onJump={jumpToScene} />

      <div className="story-scrolly__sections">
        {beats.map((beat, beatIndex) => (
          <section
            key={beat.id}
            id={beat.id}
            className="story-scene"
            data-scene-index={beatIndex}
            data-active={beatIndex === index ? "true" : "false"}
            ref={(element) => {
              sectionRefs.current[beatIndex] = element;
            }}
          >
            <StoryScene beat={beat} index={beatIndex} total={beats.length}>
              {renderExtra ? renderExtra(beat) : null}
            </StoryScene>
          </section>
        ))}
      </div>
    </main>
  );
}
