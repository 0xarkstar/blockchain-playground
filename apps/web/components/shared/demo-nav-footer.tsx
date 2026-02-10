"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Link } from "../../i18n/navigation";
import { Button } from "../ui/button";
import { getTrackByKey, getAdjacentDemos, getDemoIndex } from "../../lib/tracks/registry";
import { useProgress } from "../../lib/tracks/use-progress";
import confetti from "canvas-confetti";

interface DemoNavFooterProps {
  readonly trackKey: string;
  readonly currentSlug: string;
}

export function DemoNavFooter({ trackKey, currentSlug }: DemoNavFooterProps) {
  const t = useTranslations("common.progress");
  const tNav = useTranslations("common.nav");
  const tDemo = useTranslations(trackKey === "appliedZk" ? "appliedZk" : trackKey);
  const { prev, next } = getAdjacentDemos(trackKey, currentSlug);
  const track = getTrackByKey(trackKey);
  const { markComplete, isComplete } = useProgress();
  const completed = isComplete(trackKey, currentSlug);
  const idx = getDemoIndex(trackKey, currentSlug);
  const total = track ? track.demos.length : 0;

  const handleMarkComplete = () => {
    if (completed) return;
    markComplete(trackKey, currentSlug);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.8 },
    });
  };

  return (
    <div className="flex flex-col gap-4 border-t border-border pt-6 mt-6">
      <div className="flex items-center justify-center">
        <span className="text-sm text-muted-foreground">
          {t("stepOf", { current: idx + 1, total })}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        {prev ? (
          <Link
            href={`${track!.href}/demo/${prev.slug}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{tNav("previous")}:</span>
            <span>{tDemo(`demos.${prev.key}.title`)}</span>
          </Link>
        ) : (
          <div />
        )}

        <Button
          variant={completed ? "outline" : "default"}
          size="sm"
          onClick={handleMarkComplete}
          disabled={completed}
          className={completed ? "text-green-600 dark:text-green-400" : ""}
        >
          {completed ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              {t("markedComplete")}
            </>
          ) : (
            t("markComplete")
          )}
        </Button>

        {next ? (
          <Link
            href={`${track!.href}/demo/${next.slug}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>{tDemo(`demos.${next.key}.title`)}</span>
            <span className="hidden sm:inline">:{tNav("next")}</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
