"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { EventLogInspectorDemo } from "../../../../../../components/solidity/event-log-inspector-demo";

export default function EventLogInspectorPage() {
  return (
    <DemoPageWrapper trackKey="solidity" demoSlug="event-log-inspector">
      <EventLogInspectorDemo />
    </DemoPageWrapper>
  );
}
