"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { LiquidationSimulatorDemo } from "../../../../../../components/defi/liquidation-simulator-demo";

export default function LiquidationSimulatorPage() {
  return (
    <DemoPageWrapper trackKey="defi" demoSlug="liquidation-simulator">
      <LiquidationSimulatorDemo />
    </DemoPageWrapper>
  );
}
