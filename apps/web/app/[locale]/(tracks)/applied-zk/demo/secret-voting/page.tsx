"use client";

import dynamic from "next/dynamic";
import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";

const SecretVotingDemo = dynamic(
  () =>
    import("../../../../../../components/applied-zk/secret-voting-demo").then(
      (m) => m.SecretVotingDemo,
    ),
  { ssr: false },
);

export default function SecretVotingPage() {
  return (
    <DemoPageWrapper trackKey="appliedZk" demoSlug="secret-voting">
      <SecretVotingDemo />
    </DemoPageWrapper>
  );
}
