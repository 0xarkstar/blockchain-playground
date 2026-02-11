import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const filePath = join(process.cwd(), "components/shared/track-page-layout.tsx");
const content = readFileSync(filePath, "utf-8");

describe("TrackPageLayout", () => {
  it("exports TrackPageLayout component", () => {
    expect(content).toContain("export function TrackPageLayout");
  });

  it("imports from motion/react not framer-motion", () => {
    expect(content).toContain('from "motion/react"');
    expect(content).not.toContain('from "framer-motion"');
  });

  it("uses onChainBadgeColor from registry", () => {
    expect(content).toContain("onChainBadgeColor");
    expect(content).toContain("from \"../../lib/tracks/registry\"");
  });

  it("accepts trackKey and extraSections props", () => {
    // Check for interface definition
    expect(content).toContain("interface TrackPageLayoutProps");
    expect(content).toContain("readonly trackKey: string");
    expect(content).toContain("readonly extraSections?: ReactNode");
  });
});
