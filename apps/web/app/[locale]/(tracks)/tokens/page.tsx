"use client";

import { useTranslations } from "next-intl";
import { motion, type Variants } from "framer-motion";
import {
  Coins,
  ArrowLeftRight,
  Image,
  Layers,
  Clock,
  FileText,
  Store,
  TrendingDown,
  Crown,
  Scale,
  Link,
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
  { key: "erc20Creator", slug: "erc20-creator", icon: Coins, difficulty: "beginner", featured: true },
  { key: "tokenAllowance", slug: "token-allowance", icon: ArrowLeftRight, difficulty: "beginner" },
  { key: "erc721Minter", slug: "erc721-minter", icon: Image, difficulty: "beginner" },
  { key: "erc1155MultiToken", slug: "erc1155-multi-token", icon: Layers, difficulty: "beginner" },
  { key: "tokenVesting", slug: "token-vesting", icon: Clock, difficulty: "intermediate" },
  { key: "nftMetadata", slug: "nft-metadata", icon: FileText, difficulty: "intermediate" },
  { key: "nftMarketplace", slug: "nft-marketplace", icon: Store, difficulty: "intermediate" },
  { key: "dutchAuction", slug: "dutch-auction", icon: TrendingDown, difficulty: "intermediate" },
  { key: "eip2981Royalties", slug: "eip2981-royalties", icon: Crown, difficulty: "advanced" },
  { key: "tokenGovernance", slug: "token-governance", icon: Scale, difficulty: "advanced" },
  { key: "soulboundTokens", slug: "soulbound-tokens", icon: Link, difficulty: "advanced" },
];

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
  { value: 4, label: "Standards" },
] as const;

export default function TokensPage() {
  const t = useTranslations("tokens");

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
                colors={["#e11d48", "#f43f5e", "#fb7185", "#fda4af"]}
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
                      href={`tokens/demo/${demo.slug}`}
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
