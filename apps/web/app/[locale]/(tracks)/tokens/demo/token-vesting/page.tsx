"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { TokenVestingDemo } from "../../../../../../components/tokens/token-vesting-demo";

export default function TokenVestingPage() {
  return (
    <DemoPageWrapper trackKey="tokens" demoSlug="token-vesting">
      <TokenVestingDemo />
    </DemoPageWrapper>
  );
}
