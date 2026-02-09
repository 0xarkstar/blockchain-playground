import { useTranslations } from "next-intl";
import {
  Hash,
  Eye,
  Fingerprint,
  ShieldCheck,
  SlidersHorizontal,
  GitFork,
  FunctionSquare,
  BarChart3,
  Puzzle,
  Database,
  EyeOff,
} from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Separator } from "../../../../components/ui/separator";

const demos = [
  {
    key: "hashCommitment" as const,
    slug: "hash-commitment",
    icon: Hash,
    difficulty: "beginner",
  },
  {
    key: "zkConcepts" as const,
    slug: "zk-concepts",
    icon: Eye,
    difficulty: "beginner",
  },
  {
    key: "schnorrProtocol" as const,
    slug: "schnorr-protocol",
    icon: Fingerprint,
    difficulty: "beginner",
  },
  {
    key: "pedersenCommitment" as const,
    slug: "pedersen-commitment",
    icon: ShieldCheck,
    difficulty: "intermediate",
  },
  {
    key: "rangeProof" as const,
    slug: "range-proof",
    icon: SlidersHorizontal,
    difficulty: "intermediate",
  },
  {
    key: "zkSetMembership" as const,
    slug: "zk-set-membership",
    icon: GitFork,
    difficulty: "intermediate",
  },
  {
    key: "arithmeticCircuits" as const,
    slug: "arithmetic-circuits",
    icon: FunctionSquare,
    difficulty: "intermediate",
  },
  {
    key: "r1csQap" as const,
    slug: "r1cs-qap",
    icon: BarChart3,
    difficulty: "advanced",
  },
  {
    key: "snarkPipeline" as const,
    slug: "snark-pipeline",
    icon: Puzzle,
    difficulty: "advanced",
  },
  {
    key: "zkRollup" as const,
    slug: "zk-rollup",
    icon: Database,
    difficulty: "advanced",
  },
  {
    key: "privateTransfer" as const,
    slug: "private-transfer",
    icon: EyeOff,
    difficulty: "advanced",
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

export default function ZKPage() {
  const t = useTranslations("zk");

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
                  href={`zk/demo/${demo.slug}`}
                  className="block rounded-lg border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${themeIconColors[demo.difficulty]}`}>
                        <demo.icon className="h-5 w-5" />
                      </div>
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
