"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { AbiEncoderDemo } from "../../../../../../components/solidity/abi-encoder-demo";

export default function AbiEncoderPage() {
  return (
    <DemoPageWrapper trackKey="solidity" demoSlug="abi-encoder">
      <AbiEncoderDemo />
    </DemoPageWrapper>
  );
}
