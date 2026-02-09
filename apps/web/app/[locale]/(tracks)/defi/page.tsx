import { useTranslations } from "next-intl";
import {
  ArrowLeftRight,
  Droplet,
  TrendingDown,
  Landmark,
  LineChart,
  Coins,
  Zap,
  Scale,
  Radio,
  AlertTriangle,
  Calculator,
} from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent } from "../../../../components/ui/card";
import { Separator } from "../../../../components/ui/separator";

const demos = [
  {
    key: "simpleSwap" as const,
    slug: "simple-swap",
    icon: ArrowLeftRight,
    difficulty: "beginner",
  },
  {
    key: "liquidityPool" as const,
    slug: "liquidity-pool",
    icon: Droplet,
    difficulty: "beginner",
  },
  {
    key: "impermanentLoss" as const,
    slug: "impermanent-loss",
    icon: TrendingDown,
    difficulty: "beginner",
  },
  {
    key: "lendingProtocol" as const,
    slug: "lending-protocol",
    icon: Landmark,
    difficulty: "beginner",
  },
  {
    key: "interestRateExplorer" as const,
    slug: "interest-rate-explorer",
    icon: LineChart,
    difficulty: "beginner",
  },
  {
    key: "stakingRewards" as const,
    slug: "staking-rewards",
    icon: Coins,
    difficulty: "intermediate",
  },
  {
    key: "flashLoan" as const,
    slug: "flash-loan",
    icon: Zap,
    difficulty: "intermediate",
  },
  {
    key: "arbitrageSimulator" as const,
    slug: "arbitrage-simulator",
    icon: Scale,
    difficulty: "intermediate",
  },
  {
    key: "oraclePriceFeed" as const,
    slug: "oracle-price-feed",
    icon: Radio,
    difficulty: "intermediate",
  },
  {
    key: "liquidationSimulator" as const,
    slug: "liquidation-simulator",
    icon: AlertTriangle,
    difficulty: "advanced",
  },
  {
    key: "yieldCalculator" as const,
    slug: "yield-calculator",
    icon: Calculator,
    difficulty: "advanced",
  },
] as const;

const difficultyBadgeClass = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
} as const;

const difficultyIconClass = {
  beginner: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
  intermediate: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
  advanced: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
} as const;

export default function DefiPage() {
  const t = useTranslations("defi");

  const groups = {
    beginner: demos.filter((d) => d.difficulty === "beginner"),
    intermediate: demos.filter((d) => d.difficulty === "intermediate"),
    advanced: demos.filter((d) => d.difficulty === "advanced"),
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">{t("pageTitle")}</h1>
          <p className="text-lg text-muted-foreground mt-1">
            {t("pageDescription")}
          </p>
        </div>

        {(["beginner", "intermediate", "advanced"] as const).map((level) => (
          <div key={level} className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <Badge variant="secondary" className={difficultyBadgeClass[level]}>
                {t(level)}
              </Badge>
              <Separator className="flex-1" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups[level].map((demo) => (
                <a
                  key={demo.slug}
                  href={`defi/demo/${demo.slug}`}
                  className="block"
                >
                  <Card className="h-full cursor-pointer transition-colors hover:bg-accent">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${difficultyIconClass[demo.difficulty]}`}
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
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
