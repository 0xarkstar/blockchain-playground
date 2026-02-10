"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { NFTMetadataDemo } from "../../../../../../components/tokens/nft-metadata-demo";

export default function NFTMetadataPage() {
  return (
    <DemoPageWrapper trackKey="tokens" demoSlug="nft-metadata">
      <NFTMetadataDemo />
    </DemoPageWrapper>
  );
}
