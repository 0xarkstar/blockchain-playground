const STORAGE_KEY = "blockchain-playground-progress";

export interface ProgressData {
  readonly version: 1;
  readonly completedDemos: Record<string, number>;
  readonly lastVisited: string | null;
  readonly lastVisitedAt: number;
}

function defaultProgress(): ProgressData {
  return {
    version: 1,
    completedDemos: {},
    lastVisited: null,
    lastVisitedAt: 0,
  };
}

let listeners: Array<() => void> = [];

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribe(listener: () => void): () => void {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function loadProgress(): ProgressData {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as ProgressData;
    if (parsed.version !== 1) return defaultProgress();
    return parsed;
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(data: ProgressData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    emitChange();
  } catch {
    // localStorage full or unavailable
  }
}

export function markComplete(trackKey: string, slug: string): ProgressData {
  const current = loadProgress();
  const demoKey = `${trackKey}/${slug}`;
  if (current.completedDemos[demoKey]) return current;
  const next: ProgressData = {
    ...current,
    completedDemos: {
      ...current.completedDemos,
      [demoKey]: Date.now(),
    },
  };
  saveProgress(next);
  return next;
}

export function isComplete(trackKey: string, slug: string): boolean {
  const data = loadProgress();
  return Boolean(data.completedDemos[`${trackKey}/${slug}`]);
}

export function getTrackProgress(
  trackKey: string,
  totalDemos: number,
): { completed: number; total: number } {
  const data = loadProgress();
  const completed = Object.keys(data.completedDemos).filter((k) =>
    k.startsWith(`${trackKey}/`),
  ).length;
  return { completed, total: totalDemos };
}

export function getOverallProgress(totalDemos: number): {
  completed: number;
  total: number;
} {
  const data = loadProgress();
  return {
    completed: Object.keys(data.completedDemos).length,
    total: totalDemos,
  };
}

export function setLastVisited(trackKey: string, slug: string): void {
  const current = loadProgress();
  const next: ProgressData = {
    ...current,
    lastVisited: `${trackKey}/${slug}`,
    lastVisitedAt: Date.now(),
  };
  saveProgress(next);
}

let cachedSnapshot: ProgressData = defaultProgress();

export function getSnapshot(): ProgressData {
  const fresh = loadProgress();
  // Only return a new reference if data actually changed
  if (JSON.stringify(fresh) !== JSON.stringify(cachedSnapshot)) {
    cachedSnapshot = fresh;
  }
  return cachedSnapshot;
}

const SERVER_SNAPSHOT: ProgressData = defaultProgress();

export function getServerSnapshot(): ProgressData {
  return SERVER_SNAPSHOT;
}
