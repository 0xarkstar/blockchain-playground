"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { ConsensusPlaygroundDemo } from "../../../../../../components/fundamentals/consensus-playground-demo";

export default function ConsensusPlaygroundPage() {
  return (
    <DemoPageWrapper trackKey="fundamentals" demoSlug="consensus-playground">
      <ConsensusPlaygroundDemo />
    </DemoPageWrapper>
  );
}
