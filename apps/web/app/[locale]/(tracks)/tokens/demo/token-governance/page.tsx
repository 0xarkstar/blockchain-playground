"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { TokenGovernanceDemo } from "../../../../../../components/tokens/token-governance-demo";

export default function TokenGovernancePage() {
  return (
    <DemoPageWrapper trackKey="tokens" demoSlug="token-governance">
      <TokenGovernanceDemo />
    </DemoPageWrapper>
  );
}
