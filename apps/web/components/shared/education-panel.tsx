"use client";

import { Info, Lightbulb, ListChecks } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Alert, AlertDescription } from "../ui/alert";
import { StepCard } from "./step-card";

interface EducationStep {
  title: string;
  description: string;
  details?: string[];
}

interface EducationPanelProps {
  howItWorks?: EducationStep[];
  whyItMatters?: string;
  tips?: string[];
  defaultExpanded?: boolean;
}

export function EducationPanel({
  howItWorks,
  whyItMatters,
  tips,
  defaultExpanded = false,
}: EducationPanelProps) {
  const defaultValue = defaultExpanded
    ? ["how-it-works", "why-it-matters", "tips"].filter((key) => {
        if (key === "how-it-works") return howItWorks && howItWorks.length > 0;
        if (key === "why-it-matters") return !!whyItMatters;
        if (key === "tips") return tips && tips.length > 0;
        return false;
      })
    : [];

  const hasContent =
    (howItWorks && howItWorks.length > 0) ||
    whyItMatters ||
    (tips && tips.length > 0);

  if (!hasContent) return null;

  return (
    <Accordion type="multiple" defaultValue={defaultValue} className="space-y-2">
      {howItWorks && howItWorks.length > 0 && (
        <AccordionItem value="how-it-works" className="rounded-lg border border-border px-4">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                <ListChecks className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm font-semibold">How It Works</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2">
              {howItWorks.map((step, index) => (
                <StepCard
                  key={step.title}
                  stepNumber={index + 1}
                  title={step.title}
                  description={step.description}
                  details={step.details}
                  isLast={index === howItWorks.length - 1}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {whyItMatters && (
        <AccordionItem value="why-it-matters" className="rounded-lg border border-border px-4">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                <Info className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm font-semibold">Why It Matters</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Alert className="border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950">
              <Info className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <AlertDescription className="text-teal-800 dark:text-teal-200">
                {whyItMatters}
              </AlertDescription>
            </Alert>
          </AccordionContent>
        </AccordionItem>
      )}

      {tips && tips.length > 0 && (
        <AccordionItem value="tips" className="rounded-lg border border-border px-4">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                <Lightbulb className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm font-semibold">Tips</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2">
              {tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                    <Lightbulb className="h-3 w-3" />
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}
