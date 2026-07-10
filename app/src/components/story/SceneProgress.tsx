import type { Beat } from "../../lib/tour";

type SceneProgressProps = {
  beats: Beat[];
  index: number;
  onJump: (index: number) => void;
};

export function SceneProgress({ beats, index, onJump }: SceneProgressProps) {
  return (
    <ol className="scene-progress" aria-label="Story progress">
      {beats.map((beat, beatIndex) => (
        <li key={beat.id}>
          <button
            type="button"
            className="scene-progress__item"
            aria-current={beatIndex === index ? "step" : undefined}
            onClick={() => onJump(beatIndex)}
          >
            <span className="scene-progress__dot" aria-hidden="true" />
            <span>{beat.short}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}
