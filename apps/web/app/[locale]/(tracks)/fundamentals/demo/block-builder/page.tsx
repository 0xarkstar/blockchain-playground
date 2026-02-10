"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { BlockBuilderDemo } from "../../../../../../components/fundamentals/block-builder-demo";

export default function BlockBuilderPage() {
  return (
    <DemoPageWrapper trackKey="fundamentals" demoSlug="block-builder">
      <BlockBuilderDemo />
    </DemoPageWrapper>
  );
}
