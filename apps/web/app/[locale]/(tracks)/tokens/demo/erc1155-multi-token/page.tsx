"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { ERC1155MultiTokenDemo } from "../../../../../../components/tokens/erc1155-multi-token-demo";

export default function ERC1155MultiTokenPage() {
  return (
    <DemoPageWrapper trackKey="tokens" demoSlug="erc1155-multi-token">
      <ERC1155MultiTokenDemo />
    </DemoPageWrapper>
  );
}
