"use client";

import dynamic from "next/dynamic";
import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";

const CredentialDemo = dynamic(
  () =>
    import("../../../../../../components/applied-zk/credential-demo").then(
      (m) => m.CredentialDemo,
    ),
  { ssr: false },
);

export default function CredentialPage() {
  return (
    <DemoPageWrapper trackKey="appliedZk" demoSlug="credential">
      <CredentialDemo />
    </DemoPageWrapper>
  );
}
