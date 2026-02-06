"use client";

import { CodeHighlight } from "@mantine/code-highlight";

interface CodeBlockProps {
  code: string;
  language?: string;
  withCopyButton?: boolean;
}

export function CodeBlock({
  code,
  language = "typescript",
  withCopyButton = true,
}: CodeBlockProps) {
  return (
    <CodeHighlight
      code={code}
      language={language}
      withCopyButton={withCopyButton}
    />
  );
}
