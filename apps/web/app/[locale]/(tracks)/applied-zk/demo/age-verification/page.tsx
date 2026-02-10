"use client";

import dynamic from "next/dynamic";
import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";

const AgeVerificationDemo = dynamic(
  () =>
    import("../../../../../../components/applied-zk/age-verification-demo").then(
      (m) => m.AgeVerificationDemo,
    ),
  { ssr: false },
);

export default function AgeVerificationPage() {
  return (
    <DemoPageWrapper trackKey="appliedZk" demoSlug="age-verification">
      <AgeVerificationDemo />
    </DemoPageWrapper>
  );
}
