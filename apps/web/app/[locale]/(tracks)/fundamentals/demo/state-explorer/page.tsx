"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { StateExplorerDemo } from "../../../../../../components/fundamentals/state-explorer-demo";

export default function StateExplorerPage() {
  return (
    <DemoPageWrapper trackKey="fundamentals" demoSlug="state-explorer">
      <StateExplorerDemo />
    </DemoPageWrapper>
  );
}
