"use client";

import dynamic from "next/dynamic";
import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";

const HashPreimageDemo = dynamic(
  () =>
    import("../../../../../../components/applied-zk/hash-preimage-demo").then(
      (m) => m.HashPreimageDemo,
    ),
  { ssr: false },
);

export default function HashPreimagePage() {
  return (
    <DemoPageWrapper trackKey="appliedZk" demoSlug="hash-preimage">
      <HashPreimageDemo />
    </DemoPageWrapper>
  );
}
