"use client";

import type { ReactNode } from "react";

interface DemoLayoutProps {
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  trackTitle: string;
  trackHref: string;
  onChain?: boolean;
  children: ReactNode;
}

const difficultyColors = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
} as const;

export function DemoLayout({
  title,
  description,
  difficulty,
  trackTitle,
  trackHref,
  onChain = false,
  children,
}: DemoLayoutProps) {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <a href={trackHref} className="hover:text-foreground transition-colors">
            {trackTitle}
          </a>
          <span>/</span>
          <span className="text-foreground">{title}</span>
        </nav>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyColors[difficulty]}`}>
              {difficulty}
            </span>
            {onChain && (
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300">
                On-Chain
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-lg text-muted-foreground mt-1">{description}</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
