"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { ChainIntegrityDemo } from "../../../../../../components/fundamentals/chain-integrity-demo";

export default function ChainIntegrityPage() {
  return (
    <DemoPageWrapper trackKey="fundamentals" demoSlug="chain-integrity">
      <ChainIntegrityDemo />
    </DemoPageWrapper>
  );
}
