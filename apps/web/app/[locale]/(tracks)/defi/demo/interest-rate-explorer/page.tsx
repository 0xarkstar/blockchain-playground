"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { InterestRateExplorerDemo } from "../../../../../../components/defi/interest-rate-explorer-demo";

export default function InterestRateExplorerPage() {
  return (
    <DemoPageWrapper trackKey="defi" demoSlug="interest-rate-explorer">
      <InterestRateExplorerDemo />
    </DemoPageWrapper>
  );
}
