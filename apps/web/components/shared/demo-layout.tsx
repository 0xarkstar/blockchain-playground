"use client";

import { type ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface DemoLayoutProps {
  title?: string;
  description?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  techStack?: string[];
  inputPanel: ReactNode;
  resultPanel: ReactNode;
  learnContent?: ReactNode;
  detailsContent?: ReactNode;
  onChainContent?: ReactNode;
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export function DemoLayout({
  title,
  description,
  difficulty,
  techStack,
  inputPanel,
  resultPanel,
  learnContent,
  detailsContent,
  onChainContent,
}: DemoLayoutProps) {
  const hasHeader = title || difficulty || (techStack && techStack.length > 0);
  const hasTabs = learnContent || detailsContent || onChainContent;

  const interactiveContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {inputPanel}
      {resultPanel}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {hasHeader && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-2">
            {title && (
              <p className="text-lg font-bold">{title}</p>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            <div className="flex items-center gap-2">
              {difficulty && (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyColors[difficulty]}`}>
                  {difficulty}
                </span>
              )}
              {techStack?.map((tech) => (
                <span key={tech} className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {hasTabs ? (
        <Tabs defaultValue="interactive">
          <TabsList>
            <TabsTrigger value="interactive">Interactive</TabsTrigger>
            {learnContent && <TabsTrigger value="learn">Learn</TabsTrigger>}
            {detailsContent && <TabsTrigger value="details">Details</TabsTrigger>}
            {onChainContent && <TabsTrigger value="on-chain">On-Chain</TabsTrigger>}
          </TabsList>

          <TabsContent value="interactive" className="mt-4">
            {interactiveContent}
          </TabsContent>
          {learnContent && (
            <TabsContent value="learn" className="mt-4">
              {learnContent}
            </TabsContent>
          )}
          {detailsContent && (
            <TabsContent value="details" className="mt-4">
              {detailsContent}
            </TabsContent>
          )}
          {onChainContent && (
            <TabsContent value="on-chain" className="mt-4">
              {onChainContent}
            </TabsContent>
          )}
        </Tabs>
      ) : (
        interactiveContent
      )}
    </div>
  );
}
