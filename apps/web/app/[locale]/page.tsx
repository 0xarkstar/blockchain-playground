"use client";

import { useTranslations } from "next-intl";
import { CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { MagicCard } from "../../components/ui/magic-card";
import { BorderBeam } from "../../components/ui/border-beam";
import { NumberTicker } from "../../components/ui/number-ticker";
import { Button } from "../../components/ui/button";
import { Link } from "../../i18n/navigation";
import { TrackProgressBar } from "../../components/shared/track-progress-bar";
import { useProgress } from "../../lib/tracks/use-progress";
import {
  tracks,
  trackBadgeColors,
  trackThemeIconColors,
} from "../../lib/tracks/registry";

export default function HomePage() {
  const t = useTranslations("home");
  const tTracks = useTranslations("tracks");
  const { overallProgress, lastVisited } = useProgress();

  const lastVisitedTrack = lastVisited
    ? tracks.find((tr) => lastVisited.startsWith(tr.key + "/"))
    : null;
  const lastVisitedSlug = lastVisited ? lastVisited.split("/")[1] : null;
  const lastVisitedDemo = lastVisitedTrack?.demos.find(
    (d) => d.slug === lastVisitedSlug,
  );

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-5xl font-bold">{t("hero.title")}</h1>
          <p className="max-w-[600px] text-xl text-muted-foreground">
            {t("hero.description")}
          </p>

          <div className="mt-4">
            {lastVisitedTrack && lastVisitedDemo ? (
              <Button asChild size="lg">
                <Link
                  href={`${lastVisitedTrack.href}/demo/${lastVisitedDemo.slug}`}
                >
                  {t("hero.ctaContinue", {
                    demo: lastVisitedDemo.key,
                  })}
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link href="/fundamentals">{t("hero.cta")}</Link>
              </Button>
            )}
          </div>

          <div className="flex justify-center gap-8 mt-6">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">
                <NumberTicker value={66} />
              </span>
              <span className="text-sm text-muted-foreground">
                Interactive Demos
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">
                <NumberTicker value={6} />
              </span>
              <span className="text-sm text-muted-foreground">
                Learning Tracks
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">
                <NumberTicker value={14} />
              </span>
              <span className="text-sm text-muted-foreground">ZK Circuits</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">
                {overallProgress.completed}/{overallProgress.total}
              </span>
              <span className="text-sm text-muted-foreground">Progress</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">{t("tracks.title")}</h2>
          <p className="text-muted-foreground">{t("tracks.description")}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track) => (
            <Link key={track.key} href={track.href} className="cursor-pointer">
              <MagicCard className="h-full rounded-xl">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${trackThemeIconColors[track.color] ?? ""}`}
                      >
                        <track.icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {t("tracks.trackNumber", {
                          number: track.trackNumber,
                        })}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold">
                      {tTracks(`${track.key}.title`)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {tTracks(`${track.key}.description`)}
                    </p>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="secondary"
                        className={trackBadgeColors[track.color] ?? ""}
                      >
                        {tTracks(`${track.key}.demos`)}
                      </Badge>
                    </div>
                    <TrackProgressBar trackKey={track.key} showLabel />
                  </div>
                </CardContent>
                {track.key === "fundamentals" && <BorderBeam />}
              </MagicCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
