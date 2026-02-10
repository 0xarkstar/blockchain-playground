"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { HashExplorerDemo } from "../../../../../../components/fundamentals/hash-explorer-demo";

export default function HashExplorerPage() {
  return (
    <DemoPageWrapper trackKey="fundamentals" demoSlug="hash-explorer">
      <HashExplorerDemo />
    </DemoPageWrapper>
  );
}
