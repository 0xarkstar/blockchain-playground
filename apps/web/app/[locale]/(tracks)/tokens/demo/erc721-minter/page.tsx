"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { ERC721MinterDemo } from "../../../../../../components/tokens/erc721-minter-demo";

export default function ERC721MinterPage() {
  return (
    <DemoPageWrapper trackKey="tokens" demoSlug="erc721-minter">
      <ERC721MinterDemo />
    </DemoPageWrapper>
  );
}
