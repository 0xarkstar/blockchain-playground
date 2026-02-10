"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { HashCommitmentDemo } from "../../../../../../components/zk/hash-commitment-demo";

export default function HashCommitmentPage() {
  return (
    <DemoPageWrapper trackKey="zk" demoSlug="hash-commitment">
      <HashCommitmentDemo />
    </DemoPageWrapper>
  );
}
