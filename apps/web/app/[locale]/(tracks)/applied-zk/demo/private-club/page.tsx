"use client";

import dynamic from "next/dynamic";
import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";

const PrivateClubDemo = dynamic(
  () =>
    import("../../../../../../components/applied-zk/private-club-demo").then(
      (m) => m.PrivateClubDemo,
    ),
  { ssr: false },
);

export default function PrivateClubPage() {
  return (
    <DemoPageWrapper trackKey="appliedZk" demoSlug="private-club">
      <PrivateClubDemo />
    </DemoPageWrapper>
  );
}
