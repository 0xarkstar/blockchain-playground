"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Badge } from "../../../../../../components/ui/badge";

const CircuitGraph = dynamic(
  () =>
    import("../../../../../../components/applied-zk/visualization/circuit-graph").then(
      (m) => m.CircuitGraph,
    ),
  { ssr: false },
);

export default function CircuitVisualizationPage() {
  const t = useTranslations("appliedZk.demos.circuitVisualization");
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <a href="../.." className="hover:text-foreground transition-colors">Applied ZK</a>
          <span>/</span>
          <span>{t("title")}</span>
        </nav>

        <div>
          <div className="flex items-center gap-1 mb-1">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              Visualization
            </Badge>
          </div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-lg text-muted-foreground mt-1">
            {t("description")}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <CircuitGraph />
        </div>
      </div>
    </div>
  );
}
