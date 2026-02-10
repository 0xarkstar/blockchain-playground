"use client";

import dynamic from "next/dynamic";
import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";

const PrivateAirdropDemo = dynamic(
  () =>
    import("../../../../../../components/applied-zk/private-airdrop-demo").then(
      (m) => m.PrivateAirdropDemo,
    ),
  { ssr: false },
);

export default function PrivateAirdropPage() {
  return (
    <DemoPageWrapper trackKey="appliedZk" demoSlug="private-airdrop">
      <PrivateAirdropDemo />
    </DemoPageWrapper>
  );
}
