export type SceneIntersection = {
  index: number;
  ratio: number;
  isIntersecting: boolean;
};

export function pickActiveScene(entries: SceneIntersection[]): number | null {
  const visible = entries.filter((entry) => entry.isIntersecting);
  if (visible.length === 0) return null;
  return visible.reduce((best, entry) => (entry.ratio > best.ratio ? entry : best)).index;
}

export function sceneIndexAfterKey(index: number, key: string, total: number): number {
  if (total <= 0) return 0;
  if (key === "Home") return 0;
  if (key === "End") return total - 1;
  if (key === "ArrowDown" || key === "PageDown") return Math.min(total - 1, index + 1);
  if (key === "ArrowUp" || key === "PageUp") return Math.max(0, index - 1);
  return Math.max(0, Math.min(total - 1, index));
}
