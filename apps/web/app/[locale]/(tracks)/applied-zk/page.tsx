"use client";

import { motion, type Variants } from "motion/react";
import { useTranslations } from "next-intl";
import { BookOpen, Zap, GitCompare, CircuitBoard, Play } from "lucide-react";
import { TrackPageLayout } from "../../../../components/shared/track-page-layout";

const educationLinks = [
  { key: "snark", slug: "snark", icon: BookOpen },
  { key: "stark", slug: "stark", icon: Zap },
  { key: "comparison", slug: "comparison", icon: GitCompare },
] as const;

const visualizationLinks = [
  { key: "circuit", slug: "circuit", icon: CircuitBoard },
  { key: "proof", slug: "proof", icon: Play },
] as const;

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

export default function AppliedZKPage() {
  const t = useTranslations("appliedZk");

  const extraSections = (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Education & Visualization
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {educationLinks.map((link, i) => (
          <motion.a
            key={link.key}
            href={`education/${link.slug}`}
            className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={i}
          >
            <link.icon className="h-4 w-4 text-violet-500 shrink-0" />
            <span className="truncate">
              {t(`education.${link.key}.title`)}
            </span>
          </motion.a>
        ))}
        {visualizationLinks.map((link, i) => (
          <motion.a
            key={link.key}
            href={`visualization/${link.slug}`}
            className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={i + educationLinks.length}
          >
            <link.icon className="h-4 w-4 text-indigo-500 shrink-0" />
            <span className="truncate">
              {t(`visualization.${link.key}.title`)}
            </span>
          </motion.a>
        ))}
      </div>
    </div>
  );

  return <TrackPageLayout trackKey="appliedZk" extraSections={extraSections} />;
}
