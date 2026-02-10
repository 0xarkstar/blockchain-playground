"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { StakingRewardsDemo } from "../../../../../../components/defi/staking-rewards-demo";

export default function StakingRewardsPage() {
  return (
    <DemoPageWrapper trackKey="defi" demoSlug="staking-rewards">
      <StakingRewardsDemo />
    </DemoPageWrapper>
  );
}
