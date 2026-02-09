"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

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
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
        }}
        showLineNumbers={code.split("\n").length > 3}
      >
        {code}
      </SyntaxHighlighter>
      {withCopyButton && (
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      )}
    </div>
  );
}
