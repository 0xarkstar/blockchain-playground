import { describe, it, expect } from "vitest";
import {
  getSolidityTypeInfo,
  encodeValue,
  getAllSolidityTypes,
} from "../lib/solidity/types";

describe("getSolidityTypeInfo", () => {
  it("returns info for uint256", () => {
    const info = getSolidityTypeInfo("uint256");
    expect(info).not.toBeNull();
    expect(info!.size).toBe(32);
    expect(info!.bits).toBe(256);
    expect(info!.signed).toBe(false);
    expect(info!.min).toBe("0");
  });

  it("returns info for int8", () => {
    const info = getSolidityTypeInfo("int8");
    expect(info).not.toBeNull();
    expect(info!.size).toBe(1);
    expect(info!.signed).toBe(true);
    expect(info!.min).toBe("-128");
    expect(info!.max).toBe("127");
  });

  it("returns info for bool", () => {
    const info = getSolidityTypeInfo("bool");
    expect(info).not.toBeNull();
    expect(info!.category).toBe("bool");
    expect(info!.size).toBe(1);
  });

  it("returns info for address", () => {
    const info = getSolidityTypeInfo("address");
    expect(info).not.toBeNull();
    expect(info!.size).toBe(20);
    expect(info!.bits).toBe(160);
  });

  it("returns null for unknown type", () => {
    expect(getSolidityTypeInfo("string")).toBeNull();
    expect(getSolidityTypeInfo("mapping")).toBeNull();
  });

  it("returns info for bytes types", () => {
    const info = getSolidityTypeInfo("bytes32");
    expect(info).not.toBeNull();
    expect(info!.category).toBe("bytes");
    expect(info!.size).toBe(32);
  });
});

describe("encodeValue", () => {
  it("encodes uint256 value", () => {
    const result = encodeValue("42", "uint256");
    expect(result.valid).toBe(true);
    expect(result.hex).toBe("0x2a");
    expect(result.paddedHex).toBe("0x" + "2a".padStart(64, "0"));
    expect(result.decimal).toBe("42");
  });

  it("rejects uint8 out of range", () => {
    const result = encodeValue("256", "uint8");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("out of range");
  });

  it("encodes negative int8", () => {
    const result = encodeValue("-1", "int8");
    expect(result.valid).toBe(true);
    expect(result.decimal).toBe("-1");
    // Two's complement: -1 = 0xff
    expect(result.hex).toBe("0xff");
  });

  it("encodes bool true", () => {
    const result = encodeValue("true", "bool");
    expect(result.valid).toBe(true);
    expect(result.decimal).toBe("1");
  });

  it("encodes bool false", () => {
    const result = encodeValue("false", "bool");
    expect(result.valid).toBe(true);
    expect(result.decimal).toBe("0");
  });

  it("encodes valid address", () => {
    const result = encodeValue(
      "0xdead000000000000000000000000000000000000",
      "address",
    );
    expect(result.valid).toBe(true);
    expect(result.hex).toContain("dead");
  });

  it("rejects invalid address", () => {
    const result = encodeValue("0xinvalid", "address");
    expect(result.valid).toBe(false);
  });

  it("encodes bytes4", () => {
    const result = encodeValue("0xdeadbeef", "bytes4");
    expect(result.valid).toBe(true);
    expect(result.hex).toBe("0xdeadbeef");
  });

  it("returns error for unknown type", () => {
    const result = encodeValue("hello", "string");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Unknown type");
  });

  it("handles encoding errors gracefully", () => {
    const result = encodeValue("not-a-number", "uint256");
    expect(result.valid).toBe(false);
  });
});

describe("getAllSolidityTypes", () => {
  it("returns a non-empty array", () => {
    const types = getAllSolidityTypes();
    expect(types.length).toBeGreaterThan(10);
  });

  it("includes common types", () => {
    const types = getAllSolidityTypes();
    const names = types.map((t) => t.name);
    expect(names).toContain("uint256");
    expect(names).toContain("bool");
    expect(names).toContain("address");
    expect(names).toContain("bytes32");
  });
});
