"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { SimpleSwapDemo } from "../../../../../../components/defi/simple-swap-demo";

export default function SimpleSwapPage() {
  return (
    <DemoPageWrapper trackKey="defi" demoSlug="simple-swap">
      <SimpleSwapDemo />
    </DemoPageWrapper>
  );
}
