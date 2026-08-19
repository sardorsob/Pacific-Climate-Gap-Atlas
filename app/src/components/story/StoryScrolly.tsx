import { useEffect, useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { BookOpen, Compass, Map as MapIcon } from "lucide-react";
import type { Scene } from "../../lib/scenes";
import { pickActiveScene, requestedSceneIndexAfterKey } from "../../lib/sceneState";
import { SceneProgress } from "./SceneProgress";
import { StoryScene } from "./StoryScene";

type StoryScrollyProps = {
  scenes: Scene[];
  handoffCopy: string;
  index: number;
  onActiveChange: (index: number) => void;
  onHandoffActive: () => void;
  onExplore: () => void;
  onOpenMethod: () => void;
  renderExtra?: (scene: Scene) => ReactNode;
};

export function isStoryNavigationControl(target: EventTarget | null): boolean {
  return Boolean((target as Element | null)?.closest?.("button, a, input, select, textarea"));
}

export function StoryScrolly({
  scenes,
  handoffCopy,
  index,
  onActiveChange,
  onHandoffActive,
  onExplore,
  onOpenMethod,
  renderExtra,
}: StoryScrollyProps) {
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const handoffRef = useRef<HTMLElement | null>(null);
  const requestedIndexRef = useRef<number | null>(null);
  const intersections = useRef(new Map<number, { index: number; ratio: number; isIntersecting: boolean }>());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let handoffActive = false;
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          if (target.dataset.storyHandoff === "true") {
            handoffActive = entry.isIntersecting;
            return;
          }
          const sceneIndex = Number(target.dataset.sceneIndex);
          intersections.current.set(sceneIndex, {
            index: sceneIndex,
            ratio: entry.intersectionRatio,
            isIntersecting: entry.isIntersecting,
          });
        });
        const active = pickActiveScene(Array.from(intersections.current.values()));
        if (active !== null) onActiveChange(active);
        if (handoffActive) onHandoffActive();
      },
      { root: null, rootMargin: "-20% 0px -20% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    sectionRefs.current.forEach((section) => section && observer.observe(section));
    if (handoffRef.current) observer.observe(handoffRef.current);
    return () => observer.disconnect();
  }, [scenes.length, onActiveChange, onHandoffActive]);

  const jumpToScene = (sceneIndex: number) => {
    const next = Math.max(0, Math.min(scenes.length - 1, sceneIndex));
    requestedIndexRef.current = next;
    sectionRefs.current[next]?.scrollIntoView({
      behavior: "auto",
      block: "start",
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (isStoryNavigationControl(event.target)) return;
    if (!["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    jumpToScene(requestedSceneIndexAfterKey(index, requestedIndexRef.current, event.key, scenes.length));
  };

  const clearRequestedIndex = () => {
    requestedIndexRef.current = null;
  };

  return (
    <main
      className="story-scrolly"
      aria-label="Guided atlas story"
      data-active-visual={scenes[index]?.visual}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={clearRequestedIndex}
      onTouchStart={clearRequestedIndex}
      onWheel={clearRequestedIndex}
    >
      {scenes[index]?.visual !== "premise" && (
        <div className="story-scrolly__chrome">
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
        </div>
      )}

      <div className="story-scrolly__sections">
        {scenes.map((scene, sceneIndex) => (
          <section
            key={scene.id}
            id={scene.id}
            className="story-scene"
            data-scene-index={sceneIndex}
            data-active={sceneIndex === index ? "true" : "false"}
            data-stage-mode={scene.stage}
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

      <section
        ref={handoffRef}
        className="story-handoff"
        data-stage-mode="map-immersive"
        data-story-handoff="true"
        aria-label="Return to the Pacific"
      >
        <p className="story-scene__eyebrow">Return to the Pacific</p>
        <p className="story-handoff__copy">{handoffCopy}</p>
        <button
          type="button"
          className="ghost-btn ghost-btn--accent story-handoff__action"
          onClick={onExplore}
        >
          <MapIcon aria-hidden="true" size={14} /> Explore the map
        </button>
      </section>
    </main>
  );
}
