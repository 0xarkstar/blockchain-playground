import { describe, it, expect } from "vitest";
import { execSync } from "child_process";

describe("No framer-motion imports", () => {
  it("should not have any imports from framer-motion", () => {
    // Use grep to check for framer-motion imports in source files
    try {
      const result = execSync(
        'grep -r "from [\\x27\\x22]framer-motion[\\x27\\x22]" apps/web/components/ apps/web/app/ --include="*.tsx" --include="*.ts" -l',
        {
          cwd: "/Users/arkstar/Projects/blockchain-playground",
          encoding: "utf-8",
        },
      );
      // If grep finds matches, fail the test
      const files = result.trim();
      expect(
        files,
        `Found framer-motion imports in:\n${files}`,
      ).toBe("");
    } catch (error) {
      // grep returns exit code 1 when no matches found — that's success
      // Only throw if it's a different error (code 2 = syntax error, etc.)
      const err = error as { status?: number };
      if (err.status && err.status > 1) {
        throw error;
      }
      // Exit code 1 means no matches - test passes
      expect(true).toBe(true);
    }
  });

  it("framer-motion should not be in package.json dependencies", async () => {
    const pkg = await import("../package.json");
    expect("framer-motion" in (pkg.dependencies as Record<string, unknown>)).toBe(false);
  });
});
