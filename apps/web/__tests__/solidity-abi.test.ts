import { describe, it, expect } from "vitest";
import {
  buildFunctionSignature,
  computeFunctionSelector,
  encodeParameter,
  encodeCalldata,
  computeEventTopic,
  encodeLogEntry,
} from "../lib/solidity/abi";

describe("buildFunctionSignature", () => {
  it("builds correct signature for transfer", () => {
    expect(buildFunctionSignature("transfer", ["address", "uint256"])).toBe(
      "transfer(address,uint256)",
    );
  });

  it("builds correct signature with no params", () => {
    expect(buildFunctionSignature("totalSupply", [])).toBe("totalSupply()");
  });
});

describe("computeFunctionSelector", () => {
  it("returns 4-byte (10 hex chars) selector", () => {
    const selector = computeFunctionSelector("transfer(address,uint256)");
    expect(selector).toMatch(/^0x[0-9a-f]{8}$/);
  });

  it("computes correct selector for transfer(address,uint256)", () => {
    // Well-known: 0xa9059cbb
    const selector = computeFunctionSelector("transfer(address,uint256)");
    expect(selector).toBe("0xa9059cbb");
  });

  it("computes correct selector for balanceOf(address)", () => {
    // Well-known: 0x70a08231
    const selector = computeFunctionSelector("balanceOf(address)");
    expect(selector).toBe("0x70a08231");
  });
});

describe("encodeParameter", () => {
  it("encodes uint256 as 32-byte hex", () => {
    const encoded = encodeParameter("1", "uint256");
    expect(encoded).toHaveLength(64);
    expect(encoded).toBe(
      "0000000000000000000000000000000000000000000000000000000000000001",
    );
  });

  it("encodes address as 32-byte hex (left-padded)", () => {
    const encoded = encodeParameter(
      "0xdead000000000000000000000000000000000000",
      "address",
    );
    expect(encoded).toHaveLength(64);
    expect(encoded).toContain("dead");
  });

  it("encodes bool true as 1", () => {
    expect(encodeParameter("true", "bool")).toBe(
      "0000000000000000000000000000000000000000000000000000000000000001",
    );
  });

  it("encodes bool false as 0", () => {
    expect(encodeParameter("false", "bool")).toBe(
      "0000000000000000000000000000000000000000000000000000000000000000",
    );
  });

  it("encodes bytes32 right-padded", () => {
    const encoded = encodeParameter("0xabcd", "bytes32");
    expect(encoded.startsWith("abcd")).toBe(true);
    expect(encoded).toHaveLength(64);
  });
});

describe("encodeCalldata", () => {
  it("produces correct full calldata for transfer", () => {
    const result = encodeCalldata("transfer", [
      {
        name: "to",
        type: "address",
        value: "0x0000000000000000000000000000000000000001",
      },
      { name: "amount", type: "uint256", value: "100" },
    ]);
    expect(result.selector).toBe("0xa9059cbb");
    expect(result.fullCalldata.startsWith("0xa9059cbb")).toBe(true);
    expect(result.encodedParams).toHaveLength(2);
    expect(result.functionSignature).toBe("transfer(address,uint256)");
  });

  it("handles function with no parameters", () => {
    const result = encodeCalldata("totalSupply", []);
    expect(result.encodedParams).toHaveLength(0);
    expect(result.fullCalldata).toBe(result.selector);
  });
});

describe("computeEventTopic", () => {
  it("returns 32-byte hash", () => {
    const topic = computeEventTopic("Transfer", [
      "address",
      "address",
      "uint256",
    ]);
    expect(topic).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("computes correct topic for Transfer(address,address,uint256)", () => {
    // Well-known ERC-20 Transfer event
    const topic = computeEventTopic("Transfer", [
      "address",
      "address",
      "uint256",
    ]);
    expect(topic).toBe(
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    );
  });
});

describe("encodeLogEntry", () => {
  it("places indexed params in topics", () => {
    const log = encodeLogEntry("Transfer", [
      {
        name: "from",
        type: "address",
        value: "0x0000000000000000000000000000000000000001",
        indexed: true,
      },
      {
        name: "to",
        type: "address",
        value: "0x0000000000000000000000000000000000000002",
        indexed: true,
      },
      { name: "value", type: "uint256", value: "100", indexed: false },
    ]);
    expect(log.topics).toHaveLength(3); // topic0 + 2 indexed
    expect(log.data).toContain("64"); // 100 = 0x64
  });

  it("topic[0] is the event signature hash", () => {
    const log = encodeLogEntry("Transfer", [
      {
        name: "from",
        type: "address",
        value: "0x0000000000000000000000000000000000000001",
        indexed: true,
      },
      {
        name: "to",
        type: "address",
        value: "0x0000000000000000000000000000000000000002",
        indexed: true,
      },
      { name: "value", type: "uint256", value: "100", indexed: false },
    ]);
    expect(log.topics[0]).toBe(
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    );
  });

  it("provides topic descriptions", () => {
    const log = encodeLogEntry("Approval", [
      {
        name: "owner",
        type: "address",
        value: "0x0000000000000000000000000000000000000001",
        indexed: true,
      },
      { name: "value", type: "uint256", value: "50", indexed: false },
    ]);
    expect(log.topicDescriptions).toHaveLength(2);
    expect(log.topicDescriptions[0]).toContain("signature hash");
    expect(log.topicDescriptions[1]).toContain("indexed");
  });
});
