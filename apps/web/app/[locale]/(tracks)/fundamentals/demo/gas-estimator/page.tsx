import { useTranslations } from "next-intl";
import { Badge } from "../../../../../../components/ui/badge";
import { GasEstimatorDemo } from "../../../../../../components/fundamentals/gas-estimator-demo";

export default function GasEstimatorPage() {
  const t = useTranslations("fundamentals.demos.gasEstimator");
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <a href="../.." className="hover:text-foreground transition-colors">Fundamentals</a>
          <span>/</span>
          <span>{t("title")}</span>
        </nav>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
              Advanced
            </Badge>
            <Badge variant="secondary" className="bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300">
              On-Chain
            </Badge>
          </div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-lg text-muted-foreground mt-1">
            {t("description")}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <GasEstimatorDemo />
        </div>
      </div>
    </div>
  );
}
