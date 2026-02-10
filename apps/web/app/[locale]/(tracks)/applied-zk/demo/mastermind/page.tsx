"use client";

import dynamic from "next/dynamic";
import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";

const MastermindDemo = dynamic(
  () =>
    import("../../../../../../components/applied-zk/mastermind-demo").then(
      (m) => m.MastermindDemo,
    ),
  { ssr: false },
);

export default function MastermindPage() {
  return (
    <DemoPageWrapper trackKey="appliedZk" demoSlug="mastermind">
      <MastermindDemo />
    </DemoPageWrapper>
  );
}
