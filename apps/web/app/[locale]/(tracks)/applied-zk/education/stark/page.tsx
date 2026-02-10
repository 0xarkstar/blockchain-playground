"use client";

import { useTranslations } from "next-intl";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../../components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../../components/ui/card";
import { Badge } from "../../../../../../components/ui/badge";
import { TextAnimate } from "../../../../../../components/ui/text-animate";
import { StepCard } from "../../../../../../components/shared/step-card";
import { ConceptCard } from "../../../../../../components/applied-zk/education/concept-card";
import {
  Shield,
  Zap,
  Eye,
  CheckCircle,
  AlertTriangle,
  Code,
  Layers,
} from "lucide-react";

export default function StarkEducationPage() {
  const t = useTranslations("appliedZk");

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <Badge variant="secondary" className="mb-4">
          {t("education.stark.content.badge")}
        </Badge>
        <TextAnimate
          as="h1"
          className="text-3xl font-bold mb-2"
          animation="blurInUp"
          by="word"
        >
          {t("education.stark.content.heading")}
        </TextAnimate>
        <p className="text-muted-foreground text-lg">
          {t("education.stark.content.subheading")}
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t("education.stark.content.tabs.overview")}</TabsTrigger>
          <TabsTrigger value="how-it-works">{t("education.stark.content.tabs.howItWorks")}</TabsTrigger>
          <TabsTrigger value="fri">{t("education.stark.content.tabs.fri")}</TabsTrigger>
          <TabsTrigger value="applications">{t("education.stark.content.tabs.applications")}</TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ── */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("education.stark.content.overview.whatIsTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                {t.rich("education.stark.content.overview.whatIsDescription", {
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4" />
                    {t("education.stark.content.overview.scalableTitle")}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t("education.stark.content.overview.scalableDesc")}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4" />
                    {t("education.stark.content.overview.transparentTitle")}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t("education.stark.content.overview.transparentDesc")}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4" />
                    {t("education.stark.content.overview.quantumResistantTitle")}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t("education.stark.content.overview.quantumResistantDesc")}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    {t("education.stark.content.overview.minimalAssumptionsTitle")}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t("education.stark.content.overview.minimalAssumptionsDesc")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ConceptCard
              title={t("education.stark.content.overview.advantagesTitle")}
              description={t("education.stark.content.overview.advantagesDesc")}
              icon={CheckCircle}
              highlight
              neonColors={{ firstColor: "#8b5cf6", secondColor: "#d946ef" }}
            >
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">+</span>
                  <span>{t("education.stark.content.overview.adv1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">+</span>
                  <span>{t("education.stark.content.overview.adv2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">+</span>
                  <span>{t("education.stark.content.overview.adv3")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">+</span>
                  <span>{t("education.stark.content.overview.adv4")}</span>
                </li>
              </ul>
            </ConceptCard>

            <ConceptCard
              title={t("education.stark.content.overview.tradeoffsTitle")}
              description={t("education.stark.content.overview.tradeoffsDesc")}
              icon={AlertTriangle}
            >
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">!</span>
                  <span>{t("education.stark.content.overview.trade1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">!</span>
                  <span>{t("education.stark.content.overview.trade2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">!</span>
                  <span>{t("education.stark.content.overview.trade3")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">!</span>
                  <span>{t("education.stark.content.overview.trade4")}</span>
                </li>
              </ul>
            </ConceptCard>
          </div>
        </TabsContent>

        {/* ── How It Works Tab ── */}
        <TabsContent value="how-it-works" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                {t("education.stark.content.howItWorks.pipelineTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-muted-foreground">
                {t("education.stark.content.howItWorks.pipelineDesc")}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <StepCard
              stepNumber={1}
              title={t("education.stark.content.howItWorks.step1Title")}
              description={t("education.stark.content.howItWorks.step1Desc")}
              details={[
                t("education.stark.content.howItWorks.step1Detail1"),
                t("education.stark.content.howItWorks.step1Detail2"),
                t("education.stark.content.howItWorks.step1Detail3"),
              ]}
            />
            <StepCard
              stepNumber={2}
              title={t("education.stark.content.howItWorks.step2Title")}
              description={t("education.stark.content.howItWorks.step2Desc")}
              details={[
                t("education.stark.content.howItWorks.step2Detail1"),
                t("education.stark.content.howItWorks.step2Detail2"),
                t("education.stark.content.howItWorks.step2Detail3"),
              ]}
            />
            <StepCard
              stepNumber={3}
              title={t("education.stark.content.howItWorks.step3Title")}
              description={t("education.stark.content.howItWorks.step3Desc")}
              details={[
                t("education.stark.content.howItWorks.step3Detail1"),
                t("education.stark.content.howItWorks.step3Detail2"),
                t("education.stark.content.howItWorks.step3Detail3"),
              ]}
            />
            <StepCard
              stepNumber={4}
              title={t("education.stark.content.howItWorks.step4Title")}
              description={t("education.stark.content.howItWorks.step4Desc")}
              details={[
                t("education.stark.content.howItWorks.step4Detail1"),
                t("education.stark.content.howItWorks.step4Detail2"),
                t("education.stark.content.howItWorks.step4Detail3"),
              ]}
              isLast
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                {t("education.stark.content.howItWorks.exampleTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  {t("education.stark.content.howItWorks.exampleDesc")}
                </p>
                <div className="p-4 bg-muted rounded-lg font-mono text-sm">
                  <div className="text-muted-foreground mb-2">
                    {t("education.stark.content.howItWorks.executionTraceLabel")}
                  </div>
                  <pre className="overflow-x-auto">{`Step | a    | b
-----|------|------
  0  |  1   |  1
  1  |  1   |  2
  2  |  2   |  3
  3  |  3   |  5
 ... | ...  | ...
 99  | F_99 | F_100`}</pre>
                </div>
                <div className="p-4 bg-muted rounded-lg font-mono text-sm">
                  <div className="text-muted-foreground mb-2">
                    {t("education.stark.content.howItWorks.transitionConstraintsLabel")}
                  </div>
                  <pre className="overflow-x-auto">{`// For each row i (except last):
a[i+1] = b[i]
b[i+1] = a[i] + b[i]

// Boundary constraints:
a[0] = 1
b[0] = 1`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── FRI Protocol Tab ── */}
        <TabsContent value="fri" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-500" />
                {t("education.stark.content.fri.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                {t("education.stark.content.fri.description")}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 border rounded-lg border-purple-500/50 bg-purple-500/5">
                  <h4 className="font-semibold mb-2 text-purple-600 dark:text-purple-400">
                    {t("education.stark.content.fri.howFriWorksTitle")}
                  </h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>- {t("education.stark.content.fri.howFri1")}</li>
                    <li>- {t("education.stark.content.fri.howFri2")}</li>
                    <li>- {t("education.stark.content.fri.howFri3")}</li>
                    <li>- {t("education.stark.content.fri.howFri4")}</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">
                    {t("education.stark.content.fri.whyTransparentTitle")}
                  </h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>- {t("education.stark.content.fri.whyTransparent1")}</li>
                    <li>- {t("education.stark.content.fri.whyTransparent2")}</li>
                    <li>- {t("education.stark.content.fri.whyTransparent3")}</li>
                    <li>- {t("education.stark.content.fri.whyTransparent4")}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t("education.stark.content.fri.postQuantumTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {t("education.stark.content.fri.postQuantumDesc")}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">{t("education.stark.content.fri.starkSecurityTitle")}</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>- {t("education.stark.content.fri.starkSecurity1")}</li>
                    <li>- {t("education.stark.content.fri.starkSecurity2")}</li>
                    <li>- {t("education.stark.content.fri.starkSecurity3")}</li>
                  </ul>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">{t("education.stark.content.fri.snarkVulnerabilityTitle")}</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>- {t("education.stark.content.fri.snarkVuln1")}</li>
                    <li>- {t("education.stark.content.fri.snarkVuln2")}</li>
                    <li>- {t("education.stark.content.fri.snarkVuln3")}</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 rounded-lg mt-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-1">
                  {t("education.stark.content.fri.futureProofingTitle")}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t("education.stark.content.fri.futureProofingDesc")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("education.stark.content.fri.reductionTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <StepCard
                  stepNumber={1}
                  title={t("education.stark.content.fri.reduceStep1Title")}
                  description={t("education.stark.content.fri.reduceStep1Desc")}
                />
                <StepCard
                  stepNumber={2}
                  title={t("education.stark.content.fri.reduceStep2Title")}
                  description={t("education.stark.content.fri.reduceStep2Desc")}
                />
                <StepCard
                  stepNumber={3}
                  title={t("education.stark.content.fri.reduceStep3Title")}
                  description={t("education.stark.content.fri.reduceStep3Desc")}
                />
                <StepCard
                  stepNumber={4}
                  title={t("education.stark.content.fri.reduceStep4Title")}
                  description={t("education.stark.content.fri.reduceStep4Desc")}
                  isLast
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Applications Tab ── */}
        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("education.stark.content.applications.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {t("education.stark.content.applications.description")}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ConceptCard
              title={t("education.stark.content.applications.starknetTitle")}
              description={t("education.stark.content.applications.starknetDesc")}
              badges={[
                t("education.stark.content.applications.starknetBadge1"),
                t("education.stark.content.applications.starknetBadge2"),
                t("education.stark.content.applications.starknetBadge3"),
              ]}
            >
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>- {t("education.stark.content.applications.starknet1")}</li>
                <li>- {t("education.stark.content.applications.starknet2")}</li>
                <li>- {t("education.stark.content.applications.starknet3")}</li>
              </ul>
            </ConceptCard>

            <ConceptCard
              title={t("education.stark.content.applications.starkexTitle")}
              description={t("education.stark.content.applications.starkexDesc")}
              badges={[
                t("education.stark.content.applications.starkexBadge1"),
                t("education.stark.content.applications.starkexBadge2"),
                t("education.stark.content.applications.starkexBadge3"),
              ]}
            >
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>- {t("education.stark.content.applications.starkex1")}</li>
                <li>- {t("education.stark.content.applications.starkex2")}</li>
                <li>- {t("education.stark.content.applications.starkex3")}</li>
              </ul>
            </ConceptCard>

            <ConceptCard
              title={t("education.stark.content.applications.midenTitle")}
              description={t("education.stark.content.applications.midenDesc")}
              badges={[
                t("education.stark.content.applications.midenBadge1"),
                t("education.stark.content.applications.midenBadge2"),
                t("education.stark.content.applications.midenBadge3"),
              ]}
            >
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>- {t("education.stark.content.applications.miden1")}</li>
                <li>- {t("education.stark.content.applications.miden2")}</li>
                <li>- {t("education.stark.content.applications.miden3")}</li>
              </ul>
            </ConceptCard>

            <ConceptCard
              title={t("education.stark.content.applications.riscZeroTitle")}
              description={t("education.stark.content.applications.riscZeroDesc")}
              badges={[
                t("education.stark.content.applications.riscZeroBadge1"),
                t("education.stark.content.applications.riscZeroBadge2"),
                t("education.stark.content.applications.riscZeroBadge3"),
              ]}
            >
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>- {t("education.stark.content.applications.riscZero1")}</li>
                <li>- {t("education.stark.content.applications.riscZero2")}</li>
                <li>- {t("education.stark.content.applications.riscZero3")}</li>
              </ul>
            </ConceptCard>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("education.stark.content.applications.whenToUseTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">{t("education.stark.content.applications.chooseStarksTitle")}</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>- {t("education.stark.content.applications.chooseStarks1")}</li>
                    <li>- {t("education.stark.content.applications.chooseStarks2")}</li>
                    <li>- {t("education.stark.content.applications.chooseStarks3")}</li>
                    <li>- {t("education.stark.content.applications.chooseStarks4")}</li>
                  </ul>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">{t("education.stark.content.applications.chooseSnarksTitle")}</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>- {t("education.stark.content.applications.chooseSnarks1")}</li>
                    <li>- {t("education.stark.content.applications.chooseSnarks2")}</li>
                    <li>- {t("education.stark.content.applications.chooseSnarks3")}</li>
                    <li>- {t("education.stark.content.applications.chooseSnarks4")}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
