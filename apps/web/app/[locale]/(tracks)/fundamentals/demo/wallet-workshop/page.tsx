"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { WalletWorkshopDemo } from "../../../../../../components/fundamentals/wallet-workshop-demo";

export default function WalletWorkshopPage() {
  return (
    <DemoPageWrapper trackKey="fundamentals" demoSlug="wallet-workshop">
      <WalletWorkshopDemo />
    </DemoPageWrapper>
  );
}
