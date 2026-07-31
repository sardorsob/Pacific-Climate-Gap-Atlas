import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => {
  type Listener = (event?: unknown) => void;
  type Effect = () => void | (() => void);

  type State = {
    constructorError: Error | null;
    failurePoint: string | null;
    throwPoint: string | null;
    failureSent: boolean;
    operations: string[];
    removeCount: number;
    removeError: boolean;
    removedDuringDispatch: boolean;
    dispatchDepth: number;
    effects: Effect[];
    refIndex: number;
    stateCalls: unknown[][];
    microtasks: Array<() => void>;
    frames: Map<number, () => void>;
    nextFrame: number;
    instance: FakeMap | null;
    container: { clientWidth: number; clientHeight: number };
  };

  const state: State = {
    constructorError: null,
    failurePoint: null,
    throwPoint: null,
    failureSent: false,
    operations: [],
    removeCount: 0,
    removeError: false,
    removedDuringDispatch: false,
    dispatchDepth: 0,
    effects: [],
    refIndex: 0,
    stateCalls: [],
    microtasks: [],
    frames: new Map(),
    nextFrame: 1,
    instance: null,
    container: { clientWidth: 1440, clientHeight: 900 },
  };

  class FakeCanvas {
    style = { cursor: "" };
    listeners = new Map<string, Set<Listener>>();

    addEventListener(type: string, listener: Listener) {
      state.operations.push(`canvas:on:${type}`);
      const listeners = this.listeners.get(type) ?? new Set<Listener>();
      listeners.add(listener);
      this.listeners.set(type, listeners);
    }

    removeEventListener(type: string, listener: Listener) {
      state.operations.push(`canvas:off:${type}`);
      this.listeners.get(type)?.delete(listener);
    }

    dispatch(type: string, event: unknown) {
      state.dispatchDepth += 1;
      try {
        for (const listener of this.listeners.get(type) ?? []) listener(event);
      } finally {
        state.dispatchDepth -= 1;
      }
    }
  }

  class FakeMap {
    canvas = new FakeCanvas();
    listeners = new Map<string, Set<Listener>>();
    sources = new Set<string>();
    layers = new Set<string>();
    removed = false;
    touchZoomRotate = { disableRotation: () => this.operation("touch.disableRotation") };
    keyboard = { disableRotation: () => this.operation("keyboard.disableRotation") };

    constructor() {
      if (state.constructorError) throw state.constructorError;
      state.operations.push("construct");
      state.instance = this;
    }

    private operation(name: string) {
      state.operations.push(name);
      if (state.throwPoint === name) throw new Error(`thrown at ${name}`);
      if (state.failurePoint === name && !state.failureSent) {
        state.failureSent = true;
        this.emit("error", { error: new Error(`error at ${name}`) });
      }
    }

    on(type: string, layerOrListener: string | Listener, maybeListener?: Listener) {
      const listener = typeof layerOrListener === "function" ? layerOrListener : maybeListener;
      state.operations.push(`on:${type}${typeof layerOrListener === "string" ? `:${layerOrListener}` : ""}`);
      if (listener && typeof layerOrListener === "function") {
        const listeners = this.listeners.get(type) ?? new Set<Listener>();
        listeners.add(listener);
        this.listeners.set(type, listeners);
      }
      return this;
    }

    off(type: string, layerOrListener: string | Listener, maybeListener?: Listener) {
      const listener = typeof layerOrListener === "function" ? layerOrListener : maybeListener;
      state.operations.push(`off:${type}${typeof layerOrListener === "string" ? `:${layerOrListener}` : ""}`);
      if (listener && typeof layerOrListener === "function") this.listeners.get(type)?.delete(listener);
      return this;
    }

    emit(type: string, event: unknown = {}) {
      state.dispatchDepth += 1;
      try {
        for (const listener of this.listeners.get(type) ?? []) listener(event);
      } finally {
        state.dispatchDepth -= 1;
      }
    }

    getCanvas() { return this.canvas; }
    getContainer() { return state.container; }
    stop() { this.operation("stop"); }
    easeTo() { this.operation("easeTo"); }
    resize() { this.operation("resize"); }
    isStyleLoaded() { return true; }
    project([x, y]: [number, number]) { return { x, y }; }
    getSource(id: string) { return this.sources.has(id) ? { setData: () => this.operation(`setData:${id}`) } : undefined; }

    addSource(id: string) {
      this.operation(`addSource:${id}`);
      this.sources.add(id);
    }

    getLayer(id: string) { return this.layers.has(id) ? { id } : undefined; }

    addLayer(layer: { id: string }) {
      this.operation(`addLayer:${layer.id}`);
      this.layers.add(layer.id);
    }

    setPaintProperty(layer: string, property: string) {
      this.operation(`paint:${layer}:${property}`);
    }

    remove() {
      state.operations.push("remove");
      state.removeCount += 1;
      if (state.dispatchDepth > 0) state.removedDuringDispatch = true;
      if (state.removeError) throw new Error("remove failed");
      if (this.removed) throw new Error("map removed twice");
      this.removed = true;
    }
  }

  return { state, FakeMap };
});

vi.mock("react", () => ({
  useCallback: <T>(callback: T) => callback,
  useEffect: (effect: () => void | (() => void)) => { harness.state.effects.push(effect); },
  useMemo: <T>(factory: () => T) => factory(),
  useRef: <T>(initial: T) => {
    const index = harness.state.refIndex++;
    return { current: index === 0 ? harness.state.container : initial };
  },
  useState: <T>(initial: T | (() => T)) => {
    const value = typeof initial === "function" ? (initial as () => T)() : initial;
    const calls: unknown[] = [];
    harness.state.stateCalls.push(calls);
    return [value, (next: unknown) => calls.push(next)];
  },
}));

vi.mock("maplibre-gl", () => ({ default: { Map: harness.FakeMap } }));

import { useAtlasMap } from "./useAtlasMap";

const options = {
  geos: [],
  atlasFeatures: { type: "FeatureCollection" as const, features: [] },
  selectedCode: null,
  focusSelection: false,
  panelOpen: false,
  panelExpanded: false,
  onSelect: () => undefined,
  reducedMotion: false,
};

function flushMicrotasks() {
  while (harness.state.microtasks.length > 0) harness.state.microtasks.shift()?.();
}

function mountMap() {
  const result = useAtlasMap(options);
  // usePrefersReducedMotion, four ref-sync effects, and land fetch precede the mount effect.
  const cleanup = harness.state.effects[6]?.() ?? (() => undefined);
  return { result, cleanup, map: harness.state.instance };
}

function mapErrorCalls() {
  return harness.state.stateCalls[2];
}

beforeEach(() => {
  Object.assign(harness.state, {
    constructorError: null,
    failurePoint: null,
    throwPoint: null,
    failureSent: false,
    operations: [],
    removeCount: 0,
    removeError: false,
    removedDuringDispatch: false,
    dispatchDepth: 0,
    effects: [],
    refIndex: 0,
    stateCalls: [],
    microtasks: [],
    frames: new Map(),
    nextFrame: 1,
    instance: null,
  });
  vi.stubGlobal("window", {
    matchMedia: () => ({ matches: false, addEventListener: () => undefined, removeEventListener: () => undefined }),
    addEventListener: (type: string) => harness.state.operations.push(`window:on:${type}`),
    removeEventListener: (type: string) => harness.state.operations.push(`window:off:${type}`),
    setTimeout: (callback: () => void) => { harness.state.microtasks.push(callback); return 1; },
  });
  vi.stubGlobal("requestAnimationFrame", (callback: () => void) => {
    const id = harness.state.nextFrame++;
    harness.state.frames.set(id, callback);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => { harness.state.frames.delete(id); });
  vi.stubGlobal("queueMicrotask", (callback: () => void) => { harness.state.microtasks.push(callback); });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("useAtlasMap lifecycle", () => {
  it("turns a constructor throw into an error state with no live projection", () => {
    harness.state.constructorError = new Error("Failed to initialize WebGL");

    const { result, cleanup, map } = mountMap();

    expect(map).toBeNull();
    expect(mapErrorCalls()).toEqual([true]);
    expect(result.project(166.93, -0.52)).toBeNull();
    cleanup();
    expect(harness.state.removeCount).toBe(0);
  });

  it("defers re-entrant setup failure retirement and stops later setup", () => {
    harness.state.failurePoint = "touch.disableRotation";

    const { result, cleanup } = mountMap();

    expect(harness.state.removedDuringDispatch).toBe(false);
    expect(harness.state.removeCount).toBe(0);
    expect(harness.state.operations).not.toContain("keyboard.disableRotation");
    expect(harness.state.operations).not.toContain("on:load");
    expect(result.project(166.93, -0.52)).toBeNull();
    flushMicrotasks();
    expect(harness.state.removeCount).toBe(1);
    expect(mapErrorCalls()).toEqual([true]);
    expect(result.project(166.93, -0.52)).toBeNull();
    cleanup();
    expect(harness.state.removeCount).toBe(1);
  });

  it("catches a synchronous setup throw and retires the map once", () => {
    harness.state.throwPoint = "keyboard.disableRotation";

    const { result, cleanup } = mountMap();

    expect(mapErrorCalls()).toEqual([true]);
    expect(harness.state.removeCount).toBe(1);
    expect(result.project(166.93, -0.52)).toBeNull();
    cleanup();
    expect(harness.state.removeCount).toBe(1);
  });

  it("stops load setup after a synchronous MapLibre error and retires later", () => {
    const { result, cleanup, map } = mountMap();
    harness.state.failurePoint = "addSource:atlas-graticule";

    map?.emit("load");

    expect(harness.state.removedDuringDispatch).toBe(false);
    expect(harness.state.removeCount).toBe(0);
    expect(harness.state.operations).not.toContain("addLayer:atlas-graticule-lines");
    expect(harness.state.operations).not.toContain("addSource:atlas-points");
    expect(harness.state.operations).not.toContain("on:click:atlas-centroid-points");
    expect(result.project(166.93, -0.52)).toBeNull();
    flushMicrotasks();
    expect(harness.state.removeCount).toBe(1);
    expect(mapErrorCalls()).toEqual([true]);
    expect(result.project(166.93, -0.52)).toBeNull();
    cleanup();
    expect(harness.state.removeCount).toBe(1);
  });

  it("ignores routine MapLibre errors after load", () => {
    const { result, cleanup, map } = mountMap();
    map?.emit("load");

    map?.emit("error", { error: new Error("tile warning") });
    flushMicrotasks();

    expect(mapErrorCalls()).toEqual([]);
    expect(harness.state.removeCount).toBe(0);
    expect(result.project(166.93, -0.52)).not.toBeNull();
    cleanup();
    expect(harness.state.removeCount).toBe(1);
  });

  it("prevents default context-loss handling and retires after dispatch", () => {
    const { result, cleanup, map } = mountMap();
    map?.emit("load");
    let prevented = 0;

    map?.canvas.dispatch("webglcontextlost", { preventDefault: () => { prevented += 1; } });

    expect(prevented).toBe(1);
    expect(harness.state.removedDuringDispatch).toBe(false);
    expect(harness.state.removeCount).toBe(0);
    expect(result.project(166.93, -0.52)).toBeNull();
    flushMicrotasks();
    expect(mapErrorCalls()).toEqual([true]);
    expect(harness.state.removeCount).toBe(1);
    expect(result.project(166.93, -0.52)).toBeNull();
    cleanup();
    expect(harness.state.removeCount).toBe(1);
  });

  it("makes repeated effect cleanup remove the map exactly once", () => {
    const { cleanup } = mountMap();

    cleanup();
    cleanup();
    flushMicrotasks();

    expect(harness.state.removeCount).toBe(1);
  });

  it("keeps cleanup nonfatal and records a rare removal failure in development", () => {
    harness.state.removeError = true;
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { cleanup } = mountMap();

    expect(() => cleanup()).not.toThrow();

    expect(harness.state.removeCount).toBe(1);
    expect(warning).toHaveBeenCalledWith("MapLibre cleanup failed after map retirement.", expect.any(Error));
  });
});
