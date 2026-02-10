"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { GasOptimizerDemo } from "../../../../../../components/solidity/gas-optimizer-demo";

export default function GasOptimizerPage() {
  return (
    <DemoPageWrapper trackKey="solidity" demoSlug="gas-optimizer">
      <GasOptimizerDemo />
    </DemoPageWrapper>
  );
}
