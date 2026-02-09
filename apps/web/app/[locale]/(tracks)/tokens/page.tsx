import { useTranslations } from "next-intl";
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
} from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent } from "../../../../components/ui/card";
import { Separator } from "../../../../components/ui/separator";

const demos = [
  {
    key: "erc20Creator" as const,
    slug: "erc20-creator",
    icon: Coins,
    difficulty: "beginner",
  },
  {
    key: "tokenAllowance" as const,
    slug: "token-allowance",
    icon: ArrowLeftRight,
    difficulty: "beginner",
  },
  {
    key: "erc721Minter" as const,
    slug: "erc721-minter",
    icon: Image,
    difficulty: "beginner",
  },
  {
    key: "erc1155MultiToken" as const,
    slug: "erc1155-multi-token",
    icon: Layers,
    difficulty: "beginner",
  },
  {
    key: "tokenVesting" as const,
    slug: "token-vesting",
    icon: Clock,
    difficulty: "intermediate",
  },
  {
    key: "nftMetadata" as const,
    slug: "nft-metadata",
    icon: FileText,
    difficulty: "intermediate",
  },
  {
    key: "nftMarketplace" as const,
    slug: "nft-marketplace",
    icon: Store,
    difficulty: "intermediate",
  },
  {
    key: "dutchAuction" as const,
    slug: "dutch-auction",
    icon: TrendingDown,
    difficulty: "intermediate",
  },
  {
    key: "eip2981Royalties" as const,
    slug: "eip2981-royalties",
    icon: Crown,
    difficulty: "advanced",
  },
  {
    key: "tokenGovernance" as const,
    slug: "token-governance",
    icon: Scale,
    difficulty: "advanced",
  },
  {
    key: "soulboundTokens" as const,
    slug: "soulbound-tokens",
    icon: Link,
    difficulty: "advanced",
  },
] as const;

const difficultyColors = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
} as const;

const iconBgColors = {
  beginner: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
  intermediate: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
  advanced: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
} as const;

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
                className={difficultyColors[level]}
              >
                {t(level)}
              </Badge>
              <Separator className="flex-1" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups[level].map((demo) => (
                <a
                  key={demo.slug}
                  href={`tokens/demo/${demo.slug}`}
                  className="block"
                >
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBgColors[demo.difficulty]}`}>
                            <demo.icon className="h-5 w-5" />
                          </div>
                        </div>
                        <h4 className="text-lg font-semibold">{t(`demos.${demo.key}.title`)}</h4>
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
