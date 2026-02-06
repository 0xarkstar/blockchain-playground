import { describe, it, expect } from "vitest";
import { formatAddress } from "@blockchain-playground/utils";

describe("formatAddress", () => {
  it("truncates a long address with ellipsis", () => {
    const address = "0x1234567890abcdef1234567890abcdef12345678";
    expect(formatAddress(address)).toBe("0x1234...5678");
  });

  it("returns short strings unchanged", () => {
    expect(formatAddress("0x1234")).toBe("0x1234");
  });

  it("respects custom char count", () => {
    const address = "0x1234567890abcdef1234567890abcdef12345678";
    expect(formatAddress(address, 6)).toBe("0x123456...345678");
  });
});
