"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { TokenAllowanceDemo } from "../../../../../../components/tokens/token-allowance-demo";

export default function TokenAllowancePage() {
  return (
    <DemoPageWrapper trackKey="tokens" demoSlug="token-allowance">
      <TokenAllowanceDemo />
    </DemoPageWrapper>
  );
}
