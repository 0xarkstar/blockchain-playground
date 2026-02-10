"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { MerkleProofDemo } from "../../../../../../components/fundamentals/merkle-proof-demo";

export default function MerkleProofPage() {
  return (
    <DemoPageWrapper trackKey="fundamentals" demoSlug="merkle-proof">
      <MerkleProofDemo />
    </DemoPageWrapper>
  );
}
