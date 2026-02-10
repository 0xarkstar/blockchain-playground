"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { ArbitrageSimulatorDemo } from "../../../../../../components/defi/arbitrage-simulator-demo";

export default function ArbitrageSimulatorPage() {
  return (
    <DemoPageWrapper trackKey="defi" demoSlug="arbitrage-simulator">
      <ArbitrageSimulatorDemo />
    </DemoPageWrapper>
  );
}
