import { describe, it, expect } from "vitest";
import { formatAddress } from "../src/format";

describe("formatAddress", () => {
  const fullAddress = "0x1234567890abcdef1234567890abcdef12345678";

  it("truncates a normal address with default chars", () => {
    expect(formatAddress(fullAddress)).toBe("0x1234...5678");
  });

  it("returns short addresses unchanged", () => {
    expect(formatAddress("0x1234")).toBe("0x1234");
  });

  it("supports custom char count", () => {
    expect(formatAddress(fullAddress, 6)).toBe("0x123456...345678");
  });

  it("handles minimum length boundary", () => {
    // chars=4 → boundary = 4*2+2 = 10, length < 10 returns as-is
    expect(formatAddress("0x1234567")).toBe("0x1234567");
  });

  it("truncates string just over the boundary", () => {
    // 11 chars, boundary is 10, so it gets truncated
    expect(formatAddress("0x123456789")).toBe("0x1234...6789");
  });

  it("handles chars=1", () => {
    expect(formatAddress("0xabcdef", 1)).toBe("0xa...f");
  });
});
