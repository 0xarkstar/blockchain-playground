"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { ImpermanentLossDemo } from "../../../../../../components/defi/impermanent-loss-demo";

export default function ImpermanentLossPage() {
  return (
    <DemoPageWrapper trackKey="defi" demoSlug="impermanent-loss">
      <ImpermanentLossDemo />
    </DemoPageWrapper>
  );
}
