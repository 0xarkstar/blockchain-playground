"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { TransactionBuilderDemo } from "../../../../../../components/fundamentals/transaction-builder-demo";

export default function TransactionBuilderPage() {
  return (
    <DemoPageWrapper trackKey="fundamentals" demoSlug="transaction-builder">
      <TransactionBuilderDemo />
    </DemoPageWrapper>
  );
}
