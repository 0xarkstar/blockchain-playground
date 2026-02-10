"use client";

import { useEffect, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "../ui/badge";
import { DemoBreadcrumb } from "./demo-breadcrumb";
import { DemoNavFooter } from "./demo-nav-footer";
import { getTrackByKey, difficultyColors } from "../../lib/tracks/registry";
import { useProgress } from "../../lib/tracks/use-progress";

interface DemoPageWrapperProps {
  readonly trackKey: string;
  readonly demoSlug: string;
  readonly children: ReactNode;
}

export function DemoPageWrapper({
  trackKey,
  demoSlug,
  children,
}: DemoPageWrapperProps) {
  const ns = trackKey === "appliedZk" ? "appliedZk" : trackKey;
  const t = useTranslations(ns);
  const tCommon = useTranslations("common");
  const track = getTrackByKey(trackKey);
  const { setLastVisited } = useProgress();

  const demo = track?.demos.find((d) => d.slug === demoSlug);

  useEffect(() => {
    setLastVisited(trackKey, demoSlug);
  }, [trackKey, demoSlug, setLastVisited]);

  if (!track || !demo) return null;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-6">
        <DemoBreadcrumb trackKey={trackKey} demoSlug={demoSlug} />

        <div>
          <div className="flex items-center gap-1 mb-1">
            <Badge
              variant="secondary"
              className={difficultyColors[demo.difficulty]}
            >
              {tCommon(demo.difficulty)}
            </Badge>
            {demo.onChain && (
              <Badge
                variant="secondary"
                className="bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300"
              >
                On-Chain
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold">{t(`demos.${demo.key}.title`)}</h1>
          <p className="text-lg text-muted-foreground mt-1">
            {t(`demos.${demo.key}.description`)}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          {children}
        </div>

        <DemoNavFooter trackKey={trackKey} currentSlug={demoSlug} />
      </div>
    </div>
  );
}
