"use client";

import { Progress } from "../ui/progress";
import { useProgress } from "../../lib/tracks/use-progress";

interface TrackProgressBarProps {
  readonly trackKey: string;
  readonly showLabel?: boolean;
}

export function TrackProgressBar({
  trackKey,
  showLabel = false,
}: TrackProgressBarProps) {
  const { trackProgress } = useProgress();
  const { completed, total } = trackProgress(trackKey);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex items-center gap-2 w-full">
      <Progress value={pct} className="h-2 flex-1" />
      {showLabel && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {completed}/{total}
        </span>
      )}
    </div>
  );
}
