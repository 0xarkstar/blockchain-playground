"use client";

import dynamic from "next/dynamic";
import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";

const MixerDemo = dynamic(
  () =>
    import("../../../../../../components/applied-zk/mixer-demo").then(
      (m) => m.MixerDemo,
    ),
  { ssr: false },
);

export default function MixerPage() {
  return (
    <DemoPageWrapper trackKey="appliedZk" demoSlug="mixer">
      <MixerDemo />
    </DemoPageWrapper>
  );
}
