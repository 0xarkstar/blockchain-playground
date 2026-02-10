"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { DataTypesDemo } from "../../../../../../components/solidity/data-types-demo";

export default function DataTypesPage() {
  return (
    <DemoPageWrapper trackKey="solidity" demoSlug="data-types">
      <DataTypesDemo />
    </DemoPageWrapper>
  );
}
