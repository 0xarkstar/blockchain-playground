import { useTranslations } from "next-intl";
import {
  Database,
  Braces,
  FileCode,
  ShieldCheck,
  Flame,
  FileText,
  Box,
  PlugZap,
  Bug,
  Layers,
  Terminal,
} from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent } from "../../../../components/ui/card";
import { Separator } from "../../../../components/ui/separator";

const demos = [
  {
    key: "storageLayout" as const,
    slug: "storage-layout",
    icon: Database,
    difficulty: "beginner",
  },
  {
    key: "abiEncoder" as const,
    slug: "abi-encoder",
    icon: Braces,
    difficulty: "beginner",
  },
  {
    key: "dataTypes" as const,
    slug: "data-types",
    icon: FileCode,
    difficulty: "beginner",
  },
  {
    key: "accessControl" as const,
    slug: "access-control",
    icon: ShieldCheck,
    difficulty: "beginner",
  },
  {
    key: "gasOptimizer" as const,
    slug: "gas-optimizer",
    icon: Flame,
    difficulty: "intermediate",
  },
  {
    key: "eventLogInspector" as const,
    slug: "event-log-inspector",
    icon: FileText,
    difficulty: "intermediate",
  },
  {
    key: "dataLocations" as const,
    slug: "data-locations",
    icon: Box,
    difficulty: "intermediate",
  },
  {
    key: "contractInteractions" as const,
    slug: "contract-interactions",
    icon: PlugZap,
    difficulty: "intermediate",
  },
  {
    key: "reentrancyAttack" as const,
    slug: "reentrancy-attack",
    icon: Bug,
    difficulty: "advanced",
  },
  {
    key: "proxyPatterns" as const,
    slug: "proxy-patterns",
    icon: Layers,
    difficulty: "advanced",
  },
  {
    key: "assemblyPlayground" as const,
    slug: "assembly-playground",
    icon: Terminal,
    difficulty: "advanced",
  },
] as const;

const difficultyColors = {
  beginner:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  intermediate:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
} as const;

const difficultyIconBg = {
  beginner:
    "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
  intermediate:
    "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
  advanced: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
} as const;

export default function SolidityPage() {
  const t = useTranslations("solidity");

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
              <Badge variant="secondary" className={`text-sm ${difficultyColors[level]}`}>
                {t(level)}
              </Badge>
              <Separator className="flex-1" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups[level].map((demo) => (
                <a
                  key={demo.slug}
                  href={`solidity/demo/${demo.slug}`}
                  className="block"
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${difficultyIconBg[demo.difficulty]}`}
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
