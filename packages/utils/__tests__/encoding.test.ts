import { describe, it, expect } from "vitest";
import { hexToBytes, bytesToHex } from "../src/encoding";

describe("hexToBytes", () => {
  it("converts hex string to bytes", () => {
    expect(hexToBytes("deadbeef")).toEqual(
      new Uint8Array([0xde, 0xad, 0xbe, 0xef]),
    );
  });

  it("handles 0x prefix", () => {
    expect(hexToBytes("0xdeadbeef")).toEqual(
      new Uint8Array([0xde, 0xad, 0xbe, 0xef]),
    );
  });

  it("converts single byte", () => {
    expect(hexToBytes("ff")).toEqual(new Uint8Array([255]));
  });

  it("converts zero bytes", () => {
    expect(hexToBytes("0000")).toEqual(new Uint8Array([0, 0]));
  });

  it("returns empty array for empty string", () => {
    expect(hexToBytes("")).toEqual(new Uint8Array([]));
  });
});

describe("bytesToHex", () => {
  it("converts bytes to hex with 0x prefix by default", () => {
    expect(bytesToHex(new Uint8Array([0xde, 0xad, 0xbe, 0xef]))).toBe(
      "0xdeadbeef",
    );
  });

  it("converts bytes without prefix when specified", () => {
    expect(bytesToHex(new Uint8Array([0xde, 0xad]), false)).toBe("dead");
  });

  it("pads single-digit bytes", () => {
    expect(bytesToHex(new Uint8Array([0x0a, 0x01]))).toBe("0x0a01");
  });

  it("returns 0x for empty array", () => {
    expect(bytesToHex(new Uint8Array([]))).toBe("0x");
  });
});

describe("roundtrip", () => {
  it("hexToBytes -> bytesToHex roundtrip preserves data", () => {
    const original = "0xdeadbeef01020304";
    const bytes = hexToBytes(original);
    expect(bytesToHex(bytes)).toBe(original);
  });

  it("bytesToHex -> hexToBytes roundtrip preserves data", () => {
    const original = new Uint8Array([1, 2, 127, 255, 0]);
    const hex = bytesToHex(original);
    expect(hexToBytes(hex)).toEqual(original);
  });
});
