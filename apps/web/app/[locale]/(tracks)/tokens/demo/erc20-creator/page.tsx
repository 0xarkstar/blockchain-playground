"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { ERC20CreatorDemo } from "../../../../../../components/tokens/erc20-creator-demo";

export default function ERC20CreatorPage() {
  return (
    <DemoPageWrapper trackKey="tokens" demoSlug="erc20-creator">
      <ERC20CreatorDemo />
    </DemoPageWrapper>
  );
}
