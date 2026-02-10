"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { ZKSetMembershipDemo } from "../../../../../../components/zk/zk-set-membership-demo";

export default function ZKSetMembershipPage() {
  return (
    <DemoPageWrapper trackKey="zk" demoSlug="zk-set-membership">
      <ZKSetMembershipDemo />
    </DemoPageWrapper>
  );
}
