"use client";

import { useSyncExternalStore, useCallback } from "react";
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  markComplete as storeMarkComplete,
  setLastVisited as storeSetLastVisited,
  type ProgressData,
} from "./progress-store";
import { tracks } from "./registry";

const TOTAL_DEMOS = tracks.reduce((sum, t) => sum + t.demos.length, 0);

export function useProgress() {
  const data: ProgressData = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const markComplete = useCallback((trackKey: string, slug: string) => {
    storeMarkComplete(trackKey, slug);
  }, []);

  const setLastVisited = useCallback((trackKey: string, slug: string) => {
    storeSetLastVisited(trackKey, slug);
  }, []);

  const isComplete = useCallback(
    (trackKey: string, slug: string) => {
      return Boolean(data.completedDemos[`${trackKey}/${slug}`]);
    },
    [data.completedDemos],
  );

  const trackProgress = useCallback(
    (trackKey: string) => {
      const track = tracks.find((t) => t.key === trackKey);
      const total = track ? track.demos.length : 0;
      const completed = Object.keys(data.completedDemos).filter((k) =>
        k.startsWith(`${trackKey}/`),
      ).length;
      return { completed, total };
    },
    [data.completedDemos],
  );

  const overallProgress = {
    completed: Object.keys(data.completedDemos).length,
    total: TOTAL_DEMOS,
  };

  return {
    markComplete,
    isComplete,
    trackProgress,
    overallProgress,
    lastVisited: data.lastVisited,
    setLastVisited,
  };
}
