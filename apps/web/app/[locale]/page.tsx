"use client";

import { useTranslations } from "next-intl";
import { Box, Coins, Code, Diamond, Lock, ShieldCheck } from "lucide-react";
import { CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { MagicCard } from "../../components/ui/magic-card";
import { BorderBeam } from "../../components/ui/border-beam";
import { NumberTicker } from "../../components/ui/number-ticker";

const tracks = [
  {
    key: "fundamentals" as const,
    icon: Box,
    color: "blue",
    href: "/fundamentals",
    ready: true,
  },
  {
    key: "defi" as const,
    icon: Coins,
    color: "green",
    href: "/defi",
    ready: true,
  },
  {
    key: "solidity" as const,
    icon: Code,
    color: "orange",
    href: "/solidity",
    ready: true,
  },
  {
    key: "tokens" as const,
    icon: Diamond,
    color: "violet",
    href: "/tokens",
    ready: true,
  },
  {
    key: "zk" as const,
    icon: Lock,
    color: "red",
    href: "/zk",
    ready: true,
  },
  {
    key: "appliedZk" as const,
    icon: ShieldCheck,
    color: "pink",
    href: "/applied-zk",
    ready: true,
  },
];

const themeIconColors: Record<string, string> = {
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
  green: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
  orange:
    "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
  violet:
    "bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-400",
  red: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
  pink: "bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-400",
};

const badgeColors: Record<string, string> = {
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  orange:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  violet:
    "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300",
  red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  pink: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  gray: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

export default function HomePage() {
  const t = useTranslations("home");
  const tTracks = useTranslations("tracks");

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-5xl font-bold">{t("hero.title")}</h1>
          <p className="max-w-[600px] text-xl text-muted-foreground">
            {t("hero.description")}
          </p>
          <div className="flex justify-center gap-8 mt-6">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold"><NumberTicker value={66} /></span>
              <span className="text-sm text-muted-foreground">Interactive Demos</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold"><NumberTicker value={6} /></span>
              <span className="text-sm text-muted-foreground">Learning Tracks</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold"><NumberTicker value={14} /></span>
              <span className="text-sm text-muted-foreground">ZK Circuits</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">{t("tracks.title")}</h2>
          <p className="text-muted-foreground">{t("tracks.description")}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track) => (
            <a
              key={track.key}
              href={track.href}
              className={
                track.ready
                  ? "cursor-pointer"
                  : "pointer-events-none opacity-70"
              }
            >
              <MagicCard className="h-full rounded-xl">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${themeIconColors[track.color] ?? ""}`}
                      >
                        <track.icon className="h-5 w-5" />
                      </div>
                      {!track.ready && (
                        <Badge variant="outline">Coming Soon</Badge>
                      )}
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
                        className={badgeColors[track.color] ?? ""}
                      >
                        {tTracks(`${track.key}.demos`)}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={badgeColors.gray}
                      >
                        {tTracks(`${track.key}.modules`)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                {track.key === "appliedZk" && <BorderBeam />}
              </MagicCard>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
