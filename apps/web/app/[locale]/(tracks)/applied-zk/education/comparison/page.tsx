"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../../components/ui/card";
import { Badge } from "../../../../../../components/ui/badge";
import { TextAnimate } from "../../../../../../components/ui/text-animate";
import { NumberTicker } from "../../../../../../components/ui/number-ticker";
import { CheckCircle, XCircle } from "lucide-react";

const ComparisonChart = dynamic(
  () =>
    import("../../../../../../components/applied-zk/visualization/comparison-chart").then(
      (m) => m.ComparisonChart,
    ),
  { ssr: false },
);

const DetailedComparison = dynamic(
  () =>
    import("../../../../../../components/applied-zk/visualization/comparison-chart").then(
      (m) => m.DetailedComparison,
    ),
  { ssr: false },
);

interface ComparisonRowProps {
  label: string;
  snark: string;
  stark: string;
  winner?: "snark" | "stark" | "none";
}

function ComparisonRow({
  label,
  snark,
  stark,
  winner = "none",
}: ComparisonRowProps) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b last:border-0">
      <div className="font-medium">{label}</div>
      <div
        className={`text-center ${
          winner === "snark"
            ? "text-green-600 dark:text-green-400 font-medium"
            : ""
        }`}
      >
        {snark}
      </div>
      <div
        className={`text-center ${
          winner === "stark"
            ? "text-green-600 dark:text-green-400 font-medium"
            : ""
        }`}
      >
        {stark}
      </div>
    </div>
  );
}

export default function ComparisonPage() {
  const t = useTranslations("appliedZk");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Badge variant="secondary" className="mb-4">
          {t("education.comparison.content.badge")}
        </Badge>
        <TextAnimate
          as="h1"
          className="text-3xl font-bold mb-2"
          animation="blurInUp"
          by="word"
        >
          {t("education.comparison.content.heading")}
        </TextAnimate>
        <p className="text-muted-foreground text-lg">
          {t("education.comparison.content.subheading")}
        </p>
      </div>

      <div className="space-y-8">
        {/* ── Key Statistics ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                ~<NumberTicker value={200} />
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {t("education.comparison.content.stats.snarkProofSize")}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                ~<NumberTicker value={45} />K
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {t("education.comparison.content.stats.starkProofSize")}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                ~<NumberTicker value={10} />ms
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {t("education.comparison.content.stats.snarkVerificationTime")}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                ~<NumberTicker value={100} />ms
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {t("education.comparison.content.stats.starkVerificationTime")}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Quick Overview ── */}
        <Card>
          <CardHeader>
            <CardTitle>{t("education.comparison.content.quickOverview.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border rounded-lg bg-blue-500/5 border-blue-500/20">
                <h3 className="font-bold text-xl text-blue-600 dark:text-blue-400 mb-2">
                  zk-SNARK
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("education.comparison.content.quickOverview.snark.description")}
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t("education.comparison.content.quickOverview.snark.pro1")}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t("education.comparison.content.quickOverview.snark.pro2")}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t("education.comparison.content.quickOverview.snark.pro3")}
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    {t("education.comparison.content.quickOverview.snark.con1")}
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    {t("education.comparison.content.quickOverview.snark.con2")}
                  </li>
                </ul>
              </div>

              <div className="p-6 border rounded-lg bg-purple-500/5 border-purple-500/20">
                <h3 className="font-bold text-xl text-purple-600 dark:text-purple-400 mb-2">
                  zk-STARK
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("education.comparison.content.quickOverview.stark.description")}
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t("education.comparison.content.quickOverview.stark.pro1")}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t("education.comparison.content.quickOverview.stark.pro2")}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t("education.comparison.content.quickOverview.stark.pro3")}
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    {t("education.comparison.content.quickOverview.stark.con1")}
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    {t("education.comparison.content.quickOverview.stark.con2")}
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Visual Comparison Chart ── */}
        <ComparisonChart />

        {/* ── Detailed Comparison Table ── */}
        <DetailedComparison />

        {/* ── Quick Reference Table ── */}
        <Card>
          <CardHeader>
            <CardTitle>{t("education.comparison.content.technicalComparison.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 py-2 border-b font-semibold">
              <div>{t("education.comparison.content.technicalComparison.aspect")}</div>
              <div className="text-center text-blue-600 dark:text-blue-400">
                zk-SNARK
              </div>
              <div className="text-center text-purple-600 dark:text-purple-400">
                zk-STARK
              </div>
            </div>
            <ComparisonRow
              label={t("education.comparison.content.technicalComparison.rows.cryptoBasis.label")}
              snark={t("education.comparison.content.technicalComparison.rows.cryptoBasis.snark")}
              stark={t("education.comparison.content.technicalComparison.rows.cryptoBasis.stark")}
              winner="stark"
            />
            <ComparisonRow
              label={t("education.comparison.content.technicalComparison.rows.trustedSetup.label")}
              snark={t("education.comparison.content.technicalComparison.rows.trustedSetup.snark")}
              stark={t("education.comparison.content.technicalComparison.rows.trustedSetup.stark")}
              winner="stark"
            />
            <ComparisonRow
              label={t("education.comparison.content.technicalComparison.rows.proofSize.label")}
              snark={t("education.comparison.content.technicalComparison.rows.proofSize.snark")}
              stark={t("education.comparison.content.technicalComparison.rows.proofSize.stark")}
              winner="snark"
            />
            <ComparisonRow
              label={t("education.comparison.content.technicalComparison.rows.verificationTime.label")}
              snark={t("education.comparison.content.technicalComparison.rows.verificationTime.snark")}
              stark={t("education.comparison.content.technicalComparison.rows.verificationTime.stark")}
              winner="snark"
            />
            <ComparisonRow
              label={t("education.comparison.content.technicalComparison.rows.proverComplexity.label")}
              snark={t("education.comparison.content.technicalComparison.rows.proverComplexity.snark")}
              stark={t("education.comparison.content.technicalComparison.rows.proverComplexity.stark")}
            />
            <ComparisonRow
              label={t("education.comparison.content.technicalComparison.rows.verifierComplexity.label")}
              snark={t("education.comparison.content.technicalComparison.rows.verifierComplexity.snark")}
              stark={t("education.comparison.content.technicalComparison.rows.verifierComplexity.stark")}
              winner="snark"
            />
            <ComparisonRow
              label={t("education.comparison.content.technicalComparison.rows.quantumResistance.label")}
              snark={t("education.comparison.content.technicalComparison.rows.quantumResistance.snark")}
              stark={t("education.comparison.content.technicalComparison.rows.quantumResistance.stark")}
              winner="stark"
            />
            <ComparisonRow
              label={t("education.comparison.content.technicalComparison.rows.gasCost.label")}
              snark={t("education.comparison.content.technicalComparison.rows.gasCost.snark")}
              stark={t("education.comparison.content.technicalComparison.rows.gasCost.stark")}
              winner="snark"
            />
          </CardContent>
        </Card>

        {/* ── Use Cases ── */}
        <Card>
          <CardHeader>
            <CardTitle>{t("education.comparison.content.useCases.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-blue-500" />
                  {t("education.comparison.content.useCases.snark.heading")}
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="p-3 bg-muted rounded-lg">
                    <strong className="text-foreground">
                      {t("education.comparison.content.useCases.snark.onChain.title")}
                    </strong>
                    <br />
                    {t("education.comparison.content.useCases.snark.onChain.description")}
                  </li>
                  <li className="p-3 bg-muted rounded-lg">
                    <strong className="text-foreground">
                      {t("education.comparison.content.useCases.snark.privacy.title")}
                    </strong>
                    <br />
                    {t("education.comparison.content.useCases.snark.privacy.description")}
                  </li>
                  <li className="p-3 bg-muted rounded-lg">
                    <strong className="text-foreground">
                      {t("education.comparison.content.useCases.snark.identity.title")}
                    </strong>
                    <br />
                    {t("education.comparison.content.useCases.snark.identity.description")}
                  </li>
                  <li className="p-3 bg-muted rounded-lg">
                    <strong className="text-foreground">
                      {t("education.comparison.content.useCases.snark.tooling.title")}
                    </strong>
                    <br />
                    {t("education.comparison.content.useCases.snark.tooling.description")}
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-purple-500" />
                  {t("education.comparison.content.useCases.stark.heading")}
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="p-3 bg-muted rounded-lg">
                    <strong className="text-foreground">
                      {t("education.comparison.content.useCases.stark.rollups.title")}
                    </strong>
                    <br />
                    {t("education.comparison.content.useCases.stark.rollups.description")}
                  </li>
                  <li className="p-3 bg-muted rounded-lg">
                    <strong className="text-foreground">
                      {t("education.comparison.content.useCases.stark.largeComputation.title")}
                    </strong>
                    <br />
                    {t("education.comparison.content.useCases.stark.largeComputation.description")}
                  </li>
                  <li className="p-3 bg-muted rounded-lg">
                    <strong className="text-foreground">
                      {t("education.comparison.content.useCases.stark.longTermSecurity.title")}
                    </strong>
                    <br />
                    {t("education.comparison.content.useCases.stark.longTermSecurity.description")}
                  </li>
                  <li className="p-3 bg-muted rounded-lg">
                    <strong className="text-foreground">
                      {t("education.comparison.content.useCases.stark.noTrust.title")}
                    </strong>
                    <br />
                    {t("education.comparison.content.useCases.stark.noTrust.description")}
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Future Convergence ── */}
        <Card>
          <CardHeader>
            <CardTitle>{t("education.comparison.content.future.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {t("education.comparison.content.future.intro")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">{t("education.comparison.content.future.wrapping.title")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("education.comparison.content.future.wrapping.description")}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">{t("education.comparison.content.future.universalSnarks.title")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("education.comparison.content.future.universalSnarks.description")}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">{t("education.comparison.content.future.recursiveProofs.title")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("education.comparison.content.future.recursiveProofs.description")}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg mt-4">
              <h4 className="font-semibold mb-1">{t("education.comparison.content.future.bottomLine.title")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("education.comparison.content.future.bottomLine.description")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
