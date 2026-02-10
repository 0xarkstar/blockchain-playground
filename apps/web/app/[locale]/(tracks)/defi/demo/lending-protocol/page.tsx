"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { LendingProtocolDemo } from "../../../../../../components/defi/lending-protocol-demo";

export default function LendingProtocolPage() {
  return (
    <DemoPageWrapper trackKey="defi" demoSlug="lending-protocol">
      <LendingProtocolDemo />
    </DemoPageWrapper>
  );
}
