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
import { SimpleProofDemo } from "../../../../../../components/applied-zk/education/interactive-demo";
import {
  Lock,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  Code,
  Calculator,
} from "lucide-react";

export default function SnarkEducationPage() {
  const t = useTranslations("appliedZk");

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <Badge variant="secondary" className="mb-4">
          {t("education.snark.content.badge")}
        </Badge>
        <TextAnimate
          as="h1"
          className="text-3xl font-bold mb-2"
          animation="blurInUp"
          by="word"
        >
          {t("education.snark.content.heading")}
        </TextAnimate>
        <p className="text-muted-foreground text-lg">
          {t("education.snark.content.subtitle")}
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t("education.snark.content.tabs.overview")}</TabsTrigger>
          <TabsTrigger value="how-it-works">{t("education.snark.content.tabs.howItWorks")}</TabsTrigger>
          <TabsTrigger value="trusted-setup">{t("education.snark.content.tabs.trustedSetup")}</TabsTrigger>
          <TabsTrigger value="try-it">{t("education.snark.content.tabs.tryIt")}</TabsTrigger>
        </TabsList>

        {/* -- Overview Tab -- */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("education.snark.content.overview.whatIsTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                {t("education.snark.content.overview.whatIsDescription")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Lock className="h-4 w-4" />
                    {t("education.snark.content.overview.zeroKnowledge.title")}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t("education.snark.content.overview.zeroKnowledge.description")}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4" />
                    {t("education.snark.content.overview.succinct.title")}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t("education.snark.content.overview.succinct.description")}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4" />
                    {t("education.snark.content.overview.nonInteractive.title")}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t("education.snark.content.overview.nonInteractive.description")}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    {t("education.snark.content.overview.argumentOfKnowledge.title")}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t("education.snark.content.overview.argumentOfKnowledge.description")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ConceptCard
              title={t("education.snark.content.overview.advantages.title")}
              description={t("education.snark.content.overview.advantages.description")}
              icon={CheckCircle}
              highlight
              neonColors={{ firstColor: "#22c55e", secondColor: "#3b82f6" }}
            >
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">+</span>
                  <span>{t("education.snark.content.overview.advantages.item1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">+</span>
                  <span>{t("education.snark.content.overview.advantages.item2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">+</span>
                  <span>{t("education.snark.content.overview.advantages.item3")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">+</span>
                  <span>{t("education.snark.content.overview.advantages.item4")}</span>
                </li>
              </ul>
            </ConceptCard>

            <ConceptCard
              title={t("education.snark.content.overview.limitations.title")}
              description={t("education.snark.content.overview.limitations.description")}
              icon={AlertTriangle}
            >
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">!</span>
                  <span>{t("education.snark.content.overview.limitations.item1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">!</span>
                  <span>{t("education.snark.content.overview.limitations.item2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">!</span>
                  <span>{t("education.snark.content.overview.limitations.item3")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">!</span>
                  <span>{t("education.snark.content.overview.limitations.item4")}</span>
                </li>
              </ul>
            </ConceptCard>
          </div>
        </TabsContent>

        {/* -- How It Works Tab -- */}
        <TabsContent value="how-it-works" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                {t("education.snark.content.howItWorks.pipelineTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-muted-foreground">
                {t("education.snark.content.howItWorks.pipelineDescription")}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <StepCard
              stepNumber={1}
              title={t("education.snark.content.howItWorks.step1.title")}
              description={t("education.snark.content.howItWorks.step1.description")}
              details={[
                t("education.snark.content.howItWorks.step1.detail1"),
                t("education.snark.content.howItWorks.step1.detail2"),
                t("education.snark.content.howItWorks.step1.detail3"),
              ]}
            />
            <StepCard
              stepNumber={2}
              title={t("education.snark.content.howItWorks.step2.title")}
              description={t("education.snark.content.howItWorks.step2.description")}
              details={[
                t("education.snark.content.howItWorks.step2.detail1"),
                t("education.snark.content.howItWorks.step2.detail2"),
                t("education.snark.content.howItWorks.step2.detail3"),
              ]}
            />
            <StepCard
              stepNumber={3}
              title={t("education.snark.content.howItWorks.step3.title")}
              description={t("education.snark.content.howItWorks.step3.description")}
              details={[
                t("education.snark.content.howItWorks.step3.detail1"),
                t("education.snark.content.howItWorks.step3.detail2"),
                t("education.snark.content.howItWorks.step3.detail3"),
              ]}
            />
            <StepCard
              stepNumber={4}
              title={t("education.snark.content.howItWorks.step4.title")}
              description={t("education.snark.content.howItWorks.step4.description")}
              details={[
                t("education.snark.content.howItWorks.step4.detail1"),
                t("education.snark.content.howItWorks.step4.detail2"),
                t("education.snark.content.howItWorks.step4.detail3"),
              ]}
              isLast
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                {t("education.snark.content.howItWorks.exampleTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 font-mono text-sm">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-muted-foreground mb-2">
                    {t("education.snark.content.howItWorks.example.label1")}
                  </div>
                  <pre className="overflow-x-auto">{`signal private input x;
signal output y;
y <== x * x;`}</pre>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-muted-foreground mb-2">
                    {t("education.snark.content.howItWorks.example.label2")}
                  </div>
                  <pre className="overflow-x-auto">{`x * x = y
// With x=3, y=9: 3 * 3 = 9 ✓`}</pre>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-muted-foreground mb-2">
                    {t("education.snark.content.howItWorks.example.label3")}
                  </div>
                  <pre className="overflow-x-auto">{`"I know a secret x such that x*x = 9"
// Verifier only sees: y=9, proof π
// Verifier does NOT see: x=3`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* -- Trusted Setup Tab -- */}
        <TabsContent value="trusted-setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                {t("education.snark.content.trustedSetup.ceremonyTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                {t("education.snark.content.trustedSetup.ceremonyDescription")}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">{t("education.snark.content.trustedSetup.whatHappens.title")}</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>- {t("education.snark.content.trustedSetup.whatHappens.item1")}</li>
                    <li>- {t("education.snark.content.trustedSetup.whatHappens.item2")}</li>
                    <li>- {t("education.snark.content.trustedSetup.whatHappens.item3")}</li>
                    <li>- {t("education.snark.content.trustedSetup.whatHappens.item4")}</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg border-yellow-500/50 bg-yellow-500/5">
                  <h4 className="font-semibold mb-2 text-yellow-600 dark:text-yellow-400">
                    {t("education.snark.content.trustedSetup.toxicWaste.title")}
                  </h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>- {t("education.snark.content.trustedSetup.toxicWaste.item1")}</li>
                    <li>- {t("education.snark.content.trustedSetup.toxicWaste.item2")}</li>
                    <li>- {t("education.snark.content.trustedSetup.toxicWaste.item3")}</li>
                    <li>- {t("education.snark.content.trustedSetup.toxicWaste.item4")}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("education.snark.content.trustedSetup.powersOfTau.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {t("education.snark.content.trustedSetup.powersOfTau.description")}
              </p>
              <div className="space-y-4">
                <StepCard
                  stepNumber={1}
                  title={t("education.snark.content.trustedSetup.powersOfTau.step1.title")}
                  description={t("education.snark.content.trustedSetup.powersOfTau.step1.description")}
                />
                <StepCard
                  stepNumber={2}
                  title={t("education.snark.content.trustedSetup.powersOfTau.step2.title")}
                  description={t("education.snark.content.trustedSetup.powersOfTau.step2.description")}
                />
                <StepCard
                  stepNumber={3}
                  title={t("education.snark.content.trustedSetup.powersOfTau.step3.title")}
                  description={t("education.snark.content.trustedSetup.powersOfTau.step3.description")}
                  isLast
                />
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg mt-4">
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-1">
                  {t("education.snark.content.trustedSetup.securityGuarantee.title")}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t("education.snark.content.trustedSetup.securityGuarantee.description")}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* -- Try It Tab -- */}
        <TabsContent value="try-it" className="space-y-6">
          <SimpleProofDemo title={t("education.snark.content.tryIt.demoTitle")} />

          <Card>
            <CardHeader>
              <CardTitle>{t("education.snark.content.tryIt.whatHappenedTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {t("education.snark.content.tryIt.whatHappenedDescription")}
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>
                    {t("education.snark.content.tryIt.item1")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>
                    {t("education.snark.content.tryIt.item2")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>
                    {t("education.snark.content.tryIt.item3")}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>
                    {t("education.snark.content.tryIt.item4")}
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
