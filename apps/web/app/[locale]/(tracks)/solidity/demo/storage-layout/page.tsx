"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { StorageLayoutDemo } from "../../../../../../components/solidity/storage-layout-demo";

export default function StorageLayoutPage() {
  return (
    <DemoPageWrapper trackKey="solidity" demoSlug="storage-layout">
      <StorageLayoutDemo />
    </DemoPageWrapper>
  );
}
