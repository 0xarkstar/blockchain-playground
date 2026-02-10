"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { ZKRollupDemo } from "../../../../../../components/zk/zk-rollup-demo";

export default function ZKRollupPage() {
  return (
    <DemoPageWrapper trackKey="zk" demoSlug="zk-rollup">
      <ZKRollupDemo />
    </DemoPageWrapper>
  );
}
