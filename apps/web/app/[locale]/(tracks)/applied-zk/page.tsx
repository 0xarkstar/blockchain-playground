import { useTranslations } from "next-intl";
import {
  Hash,
  ShieldCheck,
  ThumbsUp,
  Plane,
} from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Separator } from "../../../../components/ui/separator";

const demos = [
  {
    key: "hashPreimage" as const,
    slug: "hash-preimage",
    icon: Hash,
    difficulty: "beginner",
  },
  {
    key: "ageVerification" as const,
    slug: "age-verification",
    icon: ShieldCheck,
    difficulty: "intermediate",
  },
  {
    key: "secretVoting" as const,
    slug: "secret-voting",
    icon: ThumbsUp,
    difficulty: "advanced",
  },
  {
    key: "privateAirdrop" as const,
    slug: "private-airdrop",
    icon: Plane,
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
        <div>
          <h1 className="text-3xl font-bold">{t("pageTitle")}</h1>
          <p className="text-lg text-muted-foreground mt-1">
            {t("pageDescription")}
          </p>
        </div>

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
                {groups[level].map((demo) => (
                  <a
                    key={demo.slug}
                    href={`applied-zk/demo/${demo.slug}`}
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
          ) : null,
        )}
      </div>
    </div>
  );
}
