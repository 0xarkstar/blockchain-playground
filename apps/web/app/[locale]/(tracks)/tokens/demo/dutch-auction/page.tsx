"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { DutchAuctionDemo } from "../../../../../../components/tokens/dutch-auction-demo";

export default function DutchAuctionPage() {
  return (
    <DemoPageWrapper trackKey="tokens" demoSlug="dutch-auction">
      <DutchAuctionDemo />
    </DemoPageWrapper>
  );
}
