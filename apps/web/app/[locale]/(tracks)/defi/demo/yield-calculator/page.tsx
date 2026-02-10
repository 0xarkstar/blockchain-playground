"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { YieldCalculatorDemo } from "../../../../../../components/defi/yield-calculator-demo";

export default function YieldCalculatorPage() {
  return (
    <DemoPageWrapper trackKey="defi" demoSlug="yield-calculator">
      <YieldCalculatorDemo />
    </DemoPageWrapper>
  );
}
