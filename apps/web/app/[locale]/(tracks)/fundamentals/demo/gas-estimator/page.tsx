"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { GasEstimatorDemo } from "../../../../../../components/fundamentals/gas-estimator-demo";

export default function GasEstimatorPage() {
  return (
    <DemoPageWrapper trackKey="fundamentals" demoSlug="gas-estimator">
      <GasEstimatorDemo />
    </DemoPageWrapper>
  );
}
