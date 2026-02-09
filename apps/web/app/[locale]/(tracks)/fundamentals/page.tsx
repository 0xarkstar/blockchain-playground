import { useTranslations } from "next-intl";
import {
  Hash,
  Key,
  Box,
  Link2,
  GitBranch,
  Pickaxe,
  ArrowLeftRight,
  Wallet,
  Network,
  Database,
  Flame,
} from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Separator } from "../../../../components/ui/separator";

const demos = [
  {
    key: "hashExplorer" as const,
    slug: "hash-explorer",
    icon: Hash,
    difficulty: "beginner",
    onChain: false,
  },
  {
    key: "signatureStudio" as const,
    slug: "signature-studio",
    icon: Key,
    difficulty: "beginner",
    onChain: true,
  },
  {
    key: "blockBuilder" as const,
    slug: "block-builder",
    icon: Box,
    difficulty: "beginner",
    onChain: false,
  },
  {
    key: "chainIntegrity" as const,
    slug: "chain-integrity",
    icon: Link2,
    difficulty: "beginner",
    onChain: false,
  },
  {
    key: "merkleProof" as const,
    slug: "merkle-proof",
    icon: GitBranch,
    difficulty: "beginner",
    onChain: true,
  },
  {
    key: "miningSimulator" as const,
    slug: "mining-simulator",
    icon: Pickaxe,
    difficulty: "intermediate",
    onChain: false,
  },
  {
    key: "transactionBuilder" as const,
    slug: "transaction-builder",
    icon: ArrowLeftRight,
    difficulty: "intermediate",
    onChain: true,
  },
  {
    key: "walletWorkshop" as const,
    slug: "wallet-workshop",
    icon: Wallet,
    difficulty: "intermediate",
    onChain: false,
  },
  {
    key: "consensusPlayground" as const,
    slug: "consensus-playground",
    icon: Network,
    difficulty: "intermediate",
    onChain: false,
  },
  {
    key: "stateExplorer" as const,
    slug: "state-explorer",
    icon: Database,
    difficulty: "advanced",
    onChain: false,
  },
  {
    key: "gasEstimator" as const,
    slug: "gas-estimator",
    icon: Flame,
    difficulty: "advanced",
    onChain: true,
  },
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

export default function FundamentalsPage() {
  const t = useTranslations("fundamentals");

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
              <Badge
                variant="secondary"
                className={`text-sm ${difficultyColors[level]}`}
              >
                {t(level)}
              </Badge>
              <Separator className="flex-1" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups[level].map((demo) => (
                <a
                  key={demo.slug}
                  href={`fundamentals/demo/${demo.slug}`}
                  className="block rounded-lg border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${themeIconColors[demo.difficulty]}`}>
                        <demo.icon className="h-5 w-5" />
                      </div>
                      {demo.onChain && (
                        <Badge variant="secondary" className="bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300 text-xs">
                          On-Chain
                        </Badge>
                      )}
                    </div>
                    <h4 className="text-lg font-semibold">{t(`demos.${demo.key}.title`)}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t(`demos.${demo.key}.description`)}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
