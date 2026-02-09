"use client";

import { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface HashAvalancheVisualizerProps {
  binary1: string;
  binary2: string;
  diffBits: number[];
}

export function HashAvalancheVisualizer({
  binary1,
  binary2,
  diffBits,
}: HashAvalancheVisualizerProps) {
  const diffSet = useMemo(() => new Set(diffBits), [diffBits]);

  const gridSize = Math.ceil(Math.sqrt(binary1.length));
  const cellSize = Math.max(4, Math.min(8, Math.floor(320 / gridSize)));

  return (
    <div>
      <p className="text-sm font-semibold mb-1">
        Avalanche Effect Heat Map ({diffBits.length}/{binary1.length} bits
        changed)
      </p>
      <TooltipProvider>
        <div
          className="flex flex-wrap gap-0"
          style={{ maxWidth: gridSize * cellSize + 2 }}
        >
          {binary1.split("").map((_, i) => (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <div
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: diffSet.has(i)
                      ? "hsl(var(--destructive))"
                      : "hsl(142.1 76.2% 36.3%)",
                    opacity: diffSet.has(i) ? 1 : 0.3,
                    borderRadius: 1,
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Bit {i}: {binary1[i]} → {binary2[i]}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
      <div className="flex items-center gap-4 mt-1">
        <div className="flex items-center gap-1">
          <div
            className="rounded-sm"
            style={{
              width: 12,
              height: 12,
              backgroundColor: "hsl(var(--destructive))",
            }}
          />
          <p className="text-xs">Changed</p>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="rounded-sm"
            style={{
              width: 12,
              height: 12,
              backgroundColor: "hsl(142.1 76.2% 36.3%)",
              opacity: 0.3,
            }}
          />
          <p className="text-xs">Unchanged</p>
        </div>
      </div>
    </div>
  );
}
