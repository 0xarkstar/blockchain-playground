"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { AssemblyPlaygroundDemo } from "../../../../../../components/solidity/assembly-playground-demo";

export default function AssemblyPlaygroundPage() {
  return (
    <DemoPageWrapper trackKey="solidity" demoSlug="assembly-playground">
      <AssemblyPlaygroundDemo />
    </DemoPageWrapper>
  );
}
