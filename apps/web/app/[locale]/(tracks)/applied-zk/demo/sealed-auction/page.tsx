"use client";

import dynamic from "next/dynamic";
import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";

const SealedAuctionDemo = dynamic(
  () =>
    import("../../../../../../components/applied-zk/sealed-auction-demo").then(
      (m) => m.SealedAuctionDemo,
    ),
  { ssr: false },
);

export default function SealedAuctionPage() {
  return (
    <DemoPageWrapper trackKey="appliedZk" demoSlug="sealed-auction">
      <SealedAuctionDemo />
    </DemoPageWrapper>
  );
}
