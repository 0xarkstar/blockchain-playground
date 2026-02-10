"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { PedersenCommitmentDemo } from "../../../../../../components/zk/pedersen-commitment-demo";

export default function PedersenCommitmentPage() {
  return (
    <DemoPageWrapper trackKey="zk" demoSlug="pedersen-commitment">
      <PedersenCommitmentDemo />
    </DemoPageWrapper>
  );
}
