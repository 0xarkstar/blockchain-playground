"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { PrivateTransferDemo } from "../../../../../../components/zk/private-transfer-demo";

export default function PrivateTransferPage() {
  return (
    <DemoPageWrapper trackKey="zk" demoSlug="private-transfer">
      <PrivateTransferDemo />
    </DemoPageWrapper>
  );
}
