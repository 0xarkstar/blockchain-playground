"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { OraclePriceFeedDemo } from "../../../../../../components/defi/oracle-price-feed-demo";

export default function OraclePriceFeedPage() {
  return (
    <DemoPageWrapper trackKey="defi" demoSlug="oracle-price-feed">
      <OraclePriceFeedDemo />
    </DemoPageWrapper>
  );
}
