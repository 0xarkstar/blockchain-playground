"use client";

import dynamic from "next/dynamic";
import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";

const PasswordProofDemo = dynamic(
  () =>
    import("../../../../../../components/applied-zk/password-proof-demo").then(
      (m) => m.PasswordProofDemo,
    ),
  { ssr: false },
);

export default function PasswordProofPage() {
  return (
    <DemoPageWrapper trackKey="appliedZk" demoSlug="password-proof">
      <PasswordProofDemo />
    </DemoPageWrapper>
  );
}
