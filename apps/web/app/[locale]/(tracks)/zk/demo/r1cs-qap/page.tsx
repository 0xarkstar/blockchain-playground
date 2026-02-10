"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { R1CSQAPDemo } from "../../../../../../components/zk/r1cs-qap-demo";

export default function R1CSQAPPage() {
  return (
    <DemoPageWrapper trackKey="zk" demoSlug="r1cs-qap">
      <R1CSQAPDemo />
    </DemoPageWrapper>
  );
}
