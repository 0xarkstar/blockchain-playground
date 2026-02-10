"use client";

import { DemoPageWrapper } from "../../../../../../components/shared/demo-page-wrapper";
import { SignatureStudioDemo } from "../../../../../../components/fundamentals/signature-studio-demo";

export default function SignatureStudioPage() {
  return (
    <DemoPageWrapper trackKey="fundamentals" demoSlug="signature-studio">
      <SignatureStudioDemo />
    </DemoPageWrapper>
  );
}
