"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { DataLocationsDemo } from "../../../../../../components/solidity/data-locations-demo";

export default function DataLocationsPage() {
  return (
    <DemoPageWrapper trackKey="solidity" demoSlug="data-locations">
      <DataLocationsDemo />
    </DemoPageWrapper>
  );
}
