"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { EIP2981RoyaltiesDemo } from "../../../../../../components/tokens/eip2981-royalties-demo";

export default function EIP2981RoyaltiesPage() {
  return (
    <DemoPageWrapper trackKey="tokens" demoSlug="eip2981-royalties">
      <EIP2981RoyaltiesDemo />
    </DemoPageWrapper>
  );
}
