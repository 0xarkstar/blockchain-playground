"use client";

import type { ReactNode } from "react";

interface TrackLayoutProps {
  title: string;
  description: string;
  demoCount: number;
  moduleCount: number;
  children: ReactNode;
  theoryTab?: ReactNode;
  demoTab?: ReactNode;
}

export function TrackLayout({
  title,
  description,
  demoCount,
  moduleCount,
  children,
}: TrackLayoutProps) {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-lg text-muted-foreground mt-1">{description}</p>
          <div className="flex gap-2 mt-3">
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              {demoCount} Demos
            </span>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              {moduleCount} Modules
            </span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
