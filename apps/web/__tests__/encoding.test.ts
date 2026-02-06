import { describe, it, expect } from "vitest";
import { hexToBytes, bytesToHex } from "@blockchain-playground/utils";

describe("encoding", () => {
  describe("hexToBytes", () => {
    it("converts hex string to bytes", () => {
      expect(hexToBytes("0x0102ff")).toEqual(new Uint8Array([1, 2, 255]));
    });

    it("handles hex without 0x prefix", () => {
      expect(hexToBytes("abcd")).toEqual(new Uint8Array([171, 205]));
    });
  });

  describe("bytesToHex", () => {
    it("converts bytes to hex with prefix", () => {
      expect(bytesToHex(new Uint8Array([1, 2, 255]))).toBe("0x0102ff");
    });

    it("converts bytes to hex without prefix", () => {
      expect(bytesToHex(new Uint8Array([171, 205]), false)).toBe("abcd");
    });
  });

  it("roundtrips correctly", () => {
    const original = "0xdeadbeef";
    expect(bytesToHex(hexToBytes(original))).toBe(original);
  });
});
