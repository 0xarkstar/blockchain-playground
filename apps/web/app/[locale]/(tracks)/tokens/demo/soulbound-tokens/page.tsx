"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { SoulboundTokensDemo } from "../../../../../../components/tokens/soulbound-tokens-demo";

export default function SoulboundTokensPage() {
  return (
    <DemoPageWrapper trackKey="tokens" demoSlug="soulbound-tokens">
      <SoulboundTokensDemo />
    </DemoPageWrapper>
  );
}
