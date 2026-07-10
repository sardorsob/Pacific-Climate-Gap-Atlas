import type { Scene } from "../../lib/scenes";

type SceneProgressProps = {
  scenes: Scene[];
  index: number;
  onJump: (index: number) => void;
};

export function SceneProgress({ scenes, index, onJump }: SceneProgressProps) {
  return (
    <ol className="scene-progress" aria-label="Story progress">
      {scenes.map((scene, sceneIndex) => (
        <li key={scene.id}>
          <button
            type="button"
            className="scene-progress__item"
            aria-current={sceneIndex === index ? "step" : undefined}
            onClick={() => onJump(sceneIndex)}
          >
            <span className="scene-progress__dot" aria-hidden="true" />
            <span>{scene.short}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}
