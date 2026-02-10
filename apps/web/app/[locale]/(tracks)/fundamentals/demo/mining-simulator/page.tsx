"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { MiningSimulatorDemo } from "../../../../../../components/fundamentals/mining-simulator-demo";

export default function MiningSimulatorPage() {
  return (
    <DemoPageWrapper trackKey="fundamentals" demoSlug="mining-simulator">
      <MiningSimulatorDemo />
    </DemoPageWrapper>
  );
}
