"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { ContractInteractionsDemo } from "../../../../../../components/solidity/contract-interactions-demo";

export default function ContractInteractionsPage() {
  return (
    <DemoPageWrapper trackKey="solidity" demoSlug="contract-interactions">
      <ContractInteractionsDemo />
    </DemoPageWrapper>
  );
}
