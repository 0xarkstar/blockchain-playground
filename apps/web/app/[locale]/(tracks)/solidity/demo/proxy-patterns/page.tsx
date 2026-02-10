"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { ProxyPatternsDemo } from "../../../../../../components/solidity/proxy-patterns-demo";

export default function ProxyPatternsPage() {
  return (
    <DemoPageWrapper trackKey="solidity" demoSlug="proxy-patterns">
      <ProxyPatternsDemo />
    </DemoPageWrapper>
  );
}
