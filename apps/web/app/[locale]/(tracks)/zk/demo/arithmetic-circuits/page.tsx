"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { ArithmeticCircuitsDemo } from "../../../../../../components/zk/arithmetic-circuits-demo";

export default function ArithmeticCircuitsPage() {
  return (
    <DemoPageWrapper trackKey="zk" demoSlug="arithmetic-circuits">
      <ArithmeticCircuitsDemo />
    </DemoPageWrapper>
  );
}
