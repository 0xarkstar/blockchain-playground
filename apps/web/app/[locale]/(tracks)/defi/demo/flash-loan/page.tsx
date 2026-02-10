"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { FlashLoanDemo } from "../../../../../../components/defi/flash-loan-demo";

export default function FlashLoanPage() {
  return (
    <DemoPageWrapper trackKey="defi" demoSlug="flash-loan">
      <FlashLoanDemo />
    </DemoPageWrapper>
  );
}
