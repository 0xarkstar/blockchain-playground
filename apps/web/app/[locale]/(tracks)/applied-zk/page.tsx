"use client";

import { useTranslations } from "next-intl";
import { motion, type Variants } from "framer-motion";
import {
  Hash,
  KeyRound,
  Grid3x3,
  Award,
  ShieldCheck,
  Palette,
  ThumbsUp,
  Plane,
  Shuffle,
  Users,
  Gavel,
  BookOpen,
  Zap,
  GitCompare,
  CircuitBoard,
  Play,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Separator } from "../../../../components/ui/separator";
import { AnimatedGridPattern } from "../../../../components/ui/animated-grid-pattern";
import { AuroraText } from "../../../../components/ui/aurora-text";
import { MagicCard } from "../../../../components/ui/magic-card";
import { BorderBeam } from "../../../../components/ui/border-beam";
import { NumberTicker } from "../../../../components/ui/number-ticker";

interface Demo {
  readonly key: string;
  readonly slug: string;
  readonly icon: LucideIcon;
  readonly difficulty: "beginner" | "intermediate" | "advanced";
  readonly featured?: boolean;
}

const demos: readonly Demo[] = [
  { key: "hashPreimage", slug: "hash-preimage", icon: Hash, difficulty: "beginner", featured: true },
  { key: "passwordProof", slug: "password-proof", icon: KeyRound, difficulty: "beginner" },
  { key: "sudoku", slug: "sudoku", icon: Grid3x3, difficulty: "beginner" },
  { key: "credential", slug: "credential", icon: Award, difficulty: "beginner" },
  { key: "ageVerification", slug: "age-verification", icon: ShieldCheck, difficulty: "intermediate" },
  { key: "mastermind", slug: "mastermind", icon: Palette, difficulty: "intermediate" },
  { key: "secretVoting", slug: "secret-voting", icon: ThumbsUp, difficulty: "advanced" },
  { key: "privateAirdrop", slug: "private-airdrop", icon: Plane, difficulty: "advanced" },
  { key: "mixer", slug: "mixer", icon: Shuffle, difficulty: "advanced" },
  { key: "privateClub", slug: "private-club", icon: Users, difficulty: "advanced" },
  { key: "sealedAuction", slug: "sealed-auction", icon: Gavel, difficulty: "advanced" },
];

const educationLinks = [
  { key: "snark", slug: "snark", icon: BookOpen },
  { key: "stark", slug: "stark", icon: Zap },
  { key: "comparison", slug: "comparison", icon: GitCompare },
] as const;

const visualizationLinks = [
  { key: "circuit", slug: "circuit", icon: CircuitBoard },
  { key: "proof", slug: "proof", icon: Play },
] as const;

const difficultyColors = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
} as const;

const themeIconColors = {
  beginner: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
  intermediate: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
  advanced: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
} as const;

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

const stats = [
  { value: 11, label: "Demos" },
  { value: 14, label: "Circuits" },
  { value: 7, label: "Contracts" },
] as const;

export default function AppliedZKPage() {
  const t = useTranslations("appliedZk");

  const groups = {
    beginner: demos.filter((d) => d.difficulty === "beginner"),
    intermediate: demos.filter((d) => d.difficulty === "intermediate"),
    advanced: demos.filter((d) => d.difficulty === "advanced"),
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Hero Section */}
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
                colors={["#7c3aed", "#6366f1", "#8b5cf6", "#a78bfa"]}
                speed={0.8}
              >
                {t("pageTitle")}
              </AuroraText>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {t("pageDescription")}
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-4">
              {stats.map((stat) => (
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

        {/* Quick Access: Education & Visualization */}
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

        {/* Demo Sections by Difficulty */}
        {(["beginner", "intermediate", "advanced"] as const).map((level) =>
          groups[level].length > 0 ? (
            <div key={level} className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Separator className="flex-1" />
                <Badge
                  variant="secondary"
                  className={`text-sm ${difficultyColors[level]}`}
                >
                  {t(level)}
                </Badge>
                <Separator className="flex-1" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups[level].map((demo, i) => (
                  <motion.div
                    key={demo.slug}
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    custom={i}
                  >
                    <a
                      href={`demo/${demo.slug}`}
                      className="block h-full"
                    >
                      <MagicCard className="relative h-full rounded-lg overflow-hidden">
                        <div className="flex flex-col gap-2 p-6">
                          <div className="flex items-center justify-between">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-lg ${themeIconColors[demo.difficulty]}`}
                            >
                              <demo.icon className="h-5 w-5" />
                            </div>
                          </div>
                          <h4 className="text-lg font-semibold">
                            {t(`demos.${demo.key}.title`)}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {t(`demos.${demo.key}.description`)}
                          </p>
                        </div>
                        {demo.featured ? <BorderBeam size={80} duration={8} /> : null}
                      </MagicCard>
                    </a>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}
