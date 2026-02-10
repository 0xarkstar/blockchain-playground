"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { NFTMarketplaceDemo } from "../../../../../../components/tokens/nft-marketplace-demo";

export default function NFTMarketplacePage() {
  return (
    <DemoPageWrapper trackKey="tokens" demoSlug="nft-marketplace">
      <NFTMarketplaceDemo />
    </DemoPageWrapper>
  );
}
