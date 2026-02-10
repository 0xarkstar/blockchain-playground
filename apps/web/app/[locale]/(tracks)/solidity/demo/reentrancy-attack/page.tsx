"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { ReentrancyAttackDemo } from "../../../../../../components/solidity/reentrancy-attack-demo";

export default function ReentrancyAttackPage() {
  return (
    <DemoPageWrapper trackKey="solidity" demoSlug="reentrancy-attack">
      <ReentrancyAttackDemo />
    </DemoPageWrapper>
  );
}
