"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { RangeProofDemo } from "../../../../../../components/zk/range-proof-demo";

export default function RangeProofPage() {
  return (
    <DemoPageWrapper trackKey="zk" demoSlug="range-proof">
      <RangeProofDemo />
    </DemoPageWrapper>
  );
}
