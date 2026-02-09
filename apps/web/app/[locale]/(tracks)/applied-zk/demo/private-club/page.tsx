"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Badge } from "../../../../../../components/ui/badge";

const PrivateClubDemo = dynamic(
  () =>
    import("../../../../../../components/applied-zk/private-club-demo").then(
      (m) => m.PrivateClubDemo,
    ),
  { ssr: false },
);

export default function PrivateClubPage() {
  const t = useTranslations("appliedZk.demos.privateClub");
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <a href="../.." className="hover:text-foreground transition-colors">Applied ZK</a>
          <span>/</span>
          <span>{t("title")}</span>
        </nav>

        <div>
          <div className="flex items-center gap-1 mb-1">
            <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
              Advanced
            </Badge>
          </div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-lg text-muted-foreground mt-1">
            {t("description")}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <PrivateClubDemo />
        </div>
      </div>
    </div>
  );
}
