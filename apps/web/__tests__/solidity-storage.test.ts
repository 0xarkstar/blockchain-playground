import { describe, it, expect } from "vitest";
import {
  getTypeSize,
  calculateStorageLayout,
  optimizeStorageLayout,
} from "../lib/solidity/storage";

describe("getTypeSize", () => {
  it("returns correct sizes for integer types", () => {
    expect(getTypeSize("uint8")).toBe(1);
    expect(getTypeSize("uint16")).toBe(2);
    expect(getTypeSize("uint32")).toBe(4);
    expect(getTypeSize("uint64")).toBe(8);
    expect(getTypeSize("uint128")).toBe(16);
    expect(getTypeSize("uint256")).toBe(32);
  });

  it("returns correct sizes for signed integer types", () => {
    expect(getTypeSize("int8")).toBe(1);
    expect(getTypeSize("int256")).toBe(32);
  });

  it("returns 1 for bool", () => {
    expect(getTypeSize("bool")).toBe(1);
  });

  it("returns 20 for address", () => {
    expect(getTypeSize("address")).toBe(20);
  });

  it("returns correct sizes for bytes types", () => {
    expect(getTypeSize("bytes1")).toBe(1);
    expect(getTypeSize("bytes32")).toBe(32);
  });
});

describe("calculateStorageLayout", () => {
  it("returns empty layout for no variables", () => {
    const layout = calculateStorageLayout([]);
    expect(layout.totalSlots).toBe(0);
    expect(layout.assignments).toHaveLength(0);
    expect(layout.efficiency).toBe(0);
  });

  it("assigns a single uint256 to slot 0", () => {
    const layout = calculateStorageLayout([{ name: "x", type: "uint256" }]);
    expect(layout.totalSlots).toBe(1);
    expect(layout.assignments[0]!.slotIndex).toBe(0);
    expect(layout.assignments[0]!.offset).toBe(0);
    expect(layout.efficiency).toBe(100);
  });

  it("packs small variables into one slot", () => {
    const layout = calculateStorageLayout([
      { name: "a", type: "uint8" },
      { name: "b", type: "uint8" },
      { name: "c", type: "bool" },
    ]);
    expect(layout.totalSlots).toBe(1);
    expect(layout.assignments[1]!.packed).toBe(true);
    expect(layout.assignments[2]!.packed).toBe(true);
  });

  it("spills to next slot when current slot is full", () => {
    const layout = calculateStorageLayout([
      { name: "a", type: "address" }, // 20 bytes
      { name: "b", type: "address" }, // 20 bytes - won't fit in remaining 12
    ]);
    expect(layout.totalSlots).toBe(2);
    expect(layout.assignments[1]!.slotIndex).toBe(1);
  });

  it("computes correct efficiency", () => {
    const layout = calculateStorageLayout([
      { name: "x", type: "uint256" },
      { name: "y", type: "uint8" },
    ]);
    // 2 slots (64 bytes), 33 used bytes
    expect(layout.totalSlots).toBe(2);
    expect(layout.usedBytes).toBe(33);
    expect(layout.wastedBytes).toBe(31);
    expect(layout.efficiency).toBeCloseTo(51.5625, 2);
  });

  it("packs bool and address into same slot", () => {
    const layout = calculateStorageLayout([
      { name: "active", type: "bool" }, // 1 byte
      { name: "owner", type: "address" }, // 20 bytes → fits (21 < 32)
    ]);
    expect(layout.totalSlots).toBe(1);
    expect(layout.assignments[1]!.offset).toBe(1);
  });
});

describe("optimizeStorageLayout", () => {
  it("returns empty layout for no variables", () => {
    const layout = optimizeStorageLayout([]);
    expect(layout.totalSlots).toBe(0);
  });

  it("reorders variables by size descending", () => {
    const original = calculateStorageLayout([
      { name: "a", type: "uint8" },
      { name: "b", type: "uint256" },
      { name: "c", type: "uint8" },
    ]);
    const optimized = optimizeStorageLayout([
      { name: "a", type: "uint8" },
      { name: "b", type: "uint256" },
      { name: "c", type: "uint8" },
    ]);
    expect(optimized.totalSlots).toBeLessThanOrEqual(original.totalSlots);
    expect(optimized.efficiency).toBeGreaterThanOrEqual(original.efficiency);
  });

  it("packs effectively: uint256 + two uint8s use fewer slots", () => {
    const unoptimized = calculateStorageLayout([
      { name: "a", type: "uint8" },
      { name: "b", type: "uint256" },
      { name: "c", type: "uint8" },
    ]);
    const optimized = optimizeStorageLayout([
      { name: "a", type: "uint8" },
      { name: "b", type: "uint256" },
      { name: "c", type: "uint8" },
    ]);
    // Unoptimized: uint8(1) + uint256(won't fit → slot1) + uint8(slot2) = 3 slots
    // Optimized: uint256(slot0) + uint8 + uint8(slot1 packed) = 2 slots
    expect(unoptimized.totalSlots).toBe(3);
    expect(optimized.totalSlots).toBe(2);
  });
});
