import { useEffect, useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { BookOpen, Compass } from "lucide-react";
import type { Scene } from "../../lib/scenes";
import { pickActiveScene, sceneIndexAfterKey } from "../../lib/sceneState";
import { SceneProgress } from "./SceneProgress";
import { StoryScene } from "./StoryScene";

type StoryScrollyProps = {
  scenes: Scene[];
  handoffCopy: string;
  index: number;
  onActiveChange: (index: number) => void;
  onExplore: () => void;
  onOpenMethod: () => void;
  renderExtra?: (scene: Scene) => ReactNode;
};

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function StoryScrolly({
  scenes,
  handoffCopy,
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
  }, [scenes.length, onActiveChange]);

  const jumpToScene = (sceneIndex: number) => {
    const next = Math.max(0, Math.min(scenes.length - 1, sceneIndex));
    sectionRefs.current[next]?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    jumpToScene(sceneIndexAfterKey(index, event.key, scenes.length));
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
        </div>
      </div>

      <SceneProgress scenes={scenes} index={index} onJump={jumpToScene} />

      <div className="story-scrolly__sections">
        {scenes.map((scene, sceneIndex) => (
          <section
            key={scene.id}
            id={scene.id}
            className="story-scene"
            data-scene-index={sceneIndex}
            data-active={sceneIndex === index ? "true" : "false"}
            ref={(element) => {
              sectionRefs.current[sceneIndex] = element;
            }}
          >
            <StoryScene scene={scene} index={sceneIndex} total={scenes.length}>
              {renderExtra ? renderExtra(scene) : null}
            </StoryScene>
          </section>
        ))}
      </div>

      <section className="story-handoff" aria-label="Return to the Pacific">
        <p className="story-scene__eyebrow">Return to the Pacific</p>
        <p className="story-handoff__copy">{handoffCopy}</p>
        <button type="button" className="ghost-btn ghost-btn--accent" onClick={onExplore}>
          Explore freely
        </button>
      </section>
    </main>
  );
}
