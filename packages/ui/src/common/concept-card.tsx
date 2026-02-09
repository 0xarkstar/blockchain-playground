"use client";

import type { ReactNode } from "react";

interface ConceptCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  badge?: string;
  badgeColor?: string;
  href?: string;
  onClick?: () => void;
}

const colorMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  violet: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300",
  orange: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
};

export function ConceptCard({
  title,
  description,
  icon,
  badge,
  badgeColor = "blue",
  href,
  onClick,
}: ConceptCardProps) {
  const Comp = href ? "a" : "div";
  const interactiveProps = href
    ? { href }
    : onClick
      ? { onClick, role: "button" as const, tabIndex: 0 }
      : {};

  return (
    <Comp
      {...interactiveProps}
      className={`rounded-lg border border-border bg-card p-6 shadow-sm ${
        href || onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <h4 className="text-base font-semibold">{title}</h4>
          </div>
          {badge && (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorMap[badgeColor] || colorMap.blue}`}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Comp>
  );
}
