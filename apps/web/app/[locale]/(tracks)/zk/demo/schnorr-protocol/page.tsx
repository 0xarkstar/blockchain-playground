"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { SchnorrProtocolDemo } from "../../../../../../components/zk/schnorr-protocol-demo";

export default function SchnorrProtocolPage() {
  return (
    <DemoPageWrapper trackKey="zk" demoSlug="schnorr-protocol">
      <SchnorrProtocolDemo />
    </DemoPageWrapper>
  );
}
