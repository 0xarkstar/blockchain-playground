"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { LiquidityPoolDemo } from "../../../../../../components/defi/liquidity-pool-demo";

export default function LiquidityPoolPage() {
  return (
    <DemoPageWrapper trackKey="defi" demoSlug="liquidity-pool">
      <LiquidityPoolDemo />
    </DemoPageWrapper>
  );
}
