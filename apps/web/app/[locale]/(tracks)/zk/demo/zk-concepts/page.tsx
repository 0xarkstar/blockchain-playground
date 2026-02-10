"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { ZKConceptsDemo } from "../../../../../../components/zk/zk-concepts-demo";

export default function ZKConceptsPage() {
  return (
    <DemoPageWrapper trackKey="zk" demoSlug="zk-concepts">
      <ZKConceptsDemo />
    </DemoPageWrapper>
  );
}
