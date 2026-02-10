"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { SNARKPipelineDemo } from "../../../../../../components/zk/snark-pipeline-demo";

export default function SNARKPipelinePage() {
  return (
    <DemoPageWrapper trackKey="zk" demoSlug="snark-pipeline">
      <SNARKPipelineDemo />
    </DemoPageWrapper>
  );
}
