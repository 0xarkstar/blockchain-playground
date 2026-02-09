"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Badge } from "../../../../../../components/ui/badge";

const AgeVerificationDemo = dynamic(
  () =>
    import("../../../../../../components/applied-zk/age-verification-demo").then(
      (m) => m.AgeVerificationDemo,
    ),
  { ssr: false },
);

export default function AgeVerificationPage() {
  const t = useTranslations("appliedZk.demos.ageVerification");
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
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
              Intermediate
            </Badge>
          </div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-lg text-muted-foreground mt-1">
            {t("description")}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <AgeVerificationDemo />
        </div>
      </div>
    </div>
  );
}
