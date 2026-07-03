import { useEffect, useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Compass } from "lucide-react";
import type { Beat } from "../../lib/tour";
import { BeatProgress } from "./BeatProgress";
import { StoryBeat } from "./StoryBeat";

type StoryRailProps = {
  beats: Beat[];
  index: number;
  onBeat: (i: number) => void;
  onExplore: () => void;
  onOpenMethod: () => void;
  renderExtra?: (beat: Beat) => ReactNode;
};

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function StoryRail({ beats, index, onBeat, onExplore, onOpenMethod, renderExtra }: StoryRailProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const total = beats.length;
  const isLast = index === total - 1;

  // Desktop scroll sets the active beat. Sections are hidden on mobile, so the observer
  // simply never fires there and the stepper drives instead.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        let best: { i: number; ratio: number } | null = null;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = Number((e.target as HTMLElement).dataset.i);
          if (!best || e.intersectionRatio > best.ratio) best = { i, ratio: e.intersectionRatio };
        }
        if (best && best.ratio >= 0.5) onBeat(best.i);
      },
      { root, threshold: [0.5, 0.75, 1] },
    );
    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [total, onBeat]);

  useEffect(() => {
    const syncScroll = () => {
      sectionRefs.current[index]?.scrollIntoView({ behavior: "auto", block: "start" });
    };
    syncScroll();
    window.addEventListener("resize", syncScroll);
    return () => window.removeEventListener("resize", syncScroll);
  }, [index]);

  const goTo = (i: number) => {
    const next = Math.max(0, Math.min(total - 1, i));
    onBeat(next);
    const el = sectionRefs.current[next];
    if (el) el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  };

  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      goTo(index - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(total - 1);
    }
  };

  return (
    <aside className="story-rail" aria-label="Guided atlas tour" onKeyDown={onKey}>
      <div className="story-rail__top">
        <span className="story-rail__brand">
          <Compass aria-hidden="true" size={14} /> Guided atlas
        </span>
        <div className="story-rail__top-actions">
          <button type="button" className="ghost-btn" onClick={onOpenMethod}>
            <BookOpen aria-hidden="true" size={14} /> Methods
          </button>
          <button type="button" className="ghost-btn ghost-btn--accent" onClick={onExplore}>
            Explore freely
          </button>
        </div>
      </div>

      <BeatProgress beats={beats} index={index} onJump={goTo} />

      <div className="story-rail__scroll" ref={scrollRef}>
        {beats.map((beat, i) => (
          <section
            key={beat.id}
            className="story-section"
            data-i={i}
            data-active={i === index ? "true" : "false"}
            ref={(el) => {
              sectionRefs.current[i] = el;
            }}
          >
            <StoryBeat beat={beat} index={i} total={total}>
              {renderExtra ? renderExtra(beat) : null}
            </StoryBeat>
          </section>
        ))}
      </div>

      <div className="story-rail__nav">
        <button type="button" className="tour__btn" disabled={index === 0} onClick={() => goTo(index - 1)}>
          <ChevronLeft aria-hidden="true" size={16} /> Back
        </button>
        <span className="story-rail__count">
          {index + 1} / {total}
        </span>
        {isLast ? (
          <button type="button" className="tour__btn tour__btn--primary" onClick={onExplore}>
            Explore freely
          </button>
        ) : (
          <button type="button" className="tour__btn tour__btn--primary" onClick={() => goTo(index + 1)}>
            Next <ChevronRight aria-hidden="true" size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
