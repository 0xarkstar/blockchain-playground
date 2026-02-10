"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { AccessControlDemo } from "../../../../../../components/solidity/access-control-demo";

export default function AccessControlPage() {
  return (
    <DemoPageWrapper trackKey="solidity" demoSlug="access-control">
      <AccessControlDemo />
    </DemoPageWrapper>
  );
}
