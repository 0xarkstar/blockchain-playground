"use client";

import { useTranslations } from "next-intl";
import { motion, type Variants } from "framer-motion";
import { Check } from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { AnimatedGridPattern } from "../../../../components/ui/animated-grid-pattern";
import { AuroraText } from "../../../../components/ui/aurora-text";
import { MagicCard } from "../../../../components/ui/magic-card";
import { BorderBeam } from "../../../../components/ui/border-beam";
import { NumberTicker } from "../../../../components/ui/number-ticker";
import { TrackProgressBar } from "../../../../components/shared/track-progress-bar";
import { useProgress } from "../../../../lib/tracks/use-progress";
import {
  getTrackByKey,
  difficultyColors,
  themeIconColors,
} from "../../../../lib/tracks/registry";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.4,
      ease: "easeOut" as const,
    },
  }),
};

const track = getTrackByKey("solidity")!;

export default function SolidityPage() {
  const t = useTranslations("solidity");
  const { isComplete } = useProgress();

  const firstIncompleteIdx = track.demos.findIndex(
    (d) => !isComplete("solidity", d.slug),
  );

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-8">
        <div className="relative overflow-hidden rounded-xl border bg-card p-8 mb-8">
          <AnimatedGridPattern
            className="absolute inset-0 opacity-30"
            numSquares={30}
            maxOpacity={0.3}
            duration={3}
          />
          <div className="relative z-10 flex flex-col items-center text-center gap-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              <AuroraText
                colors={[...track.auroraColors]}
                speed={0.8}
              >
                {t("pageTitle")}
              </AuroraText>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {t("pageDescription")}
            </p>
            <div className="w-full max-w-md mt-2">
              <TrackProgressBar trackKey="solidity" showLabel />
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-4">
              {track.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center gap-1 rounded-lg border bg-background/80 backdrop-blur-sm px-6 py-3"
                >
                  <NumberTicker
                    value={stat.value}
                    className="text-3xl font-bold"
                    delay={0.3}
                  />
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {track.demos.map((demo, i) => {
            const completed = isComplete("solidity", demo.slug);
            const isUpNext = i === firstIncompleteIdx;
            return (
              <motion.div
                key={demo.slug}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                custom={i}
              >
                <a
                  href={`solidity/demo/${demo.slug}`}
                  className="block h-full"
                >
                  <MagicCard className="relative h-full rounded-lg overflow-hidden">
                    <div className="flex flex-col gap-2 p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">
                            {i + 1}
                          </span>
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${themeIconColors[demo.difficulty]}`}
                          >
                            <demo.icon className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {completed && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                              <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                            </div>
                          )}
                          <Badge
                            variant="secondary"
                            className={`text-xs ${difficultyColors[demo.difficulty]}`}
                          >
                            {t(demo.difficulty)}
                          </Badge>
                        </div>
                      </div>
                      <h4 className="text-lg font-semibold">
                        {t(`demos.${demo.key}.title`)}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {t(`demos.${demo.key}.description`)}
                      </p>
                    </div>
                    {isUpNext ? <BorderBeam size={80} duration={8} /> : null}
                  </MagicCard>
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
