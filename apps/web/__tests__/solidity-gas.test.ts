import { describe, it, expect } from "vitest";
import {
  compareStorageVsMemory,
  comparePackedVsUnpacked,
  compareCallTypes,
  compareMappingVsArray,
  getGasConstantsTable,
} from "../lib/solidity/gas";

describe("compareStorageVsMemory", () => {
  it("memory is cheaper than storage", () => {
    const result = compareStorageVsMemory(5);
    expect(result.optimized.totalGas).toBeLessThan(result.unoptimized.totalGas);
    expect(result.savings).toBeGreaterThan(0);
    expect(result.savingsPercent).toBeGreaterThan(0);
  });

  it("handles single operation", () => {
    const result = compareStorageVsMemory(1);
    expect(result.optimized.breakdown.length).toBeGreaterThan(0);
    expect(result.unoptimized.breakdown.length).toBeGreaterThan(0);
  });

  it("savings increase with more operations", () => {
    const small = compareStorageVsMemory(2);
    const large = compareStorageVsMemory(10);
    expect(large.savings).toBeGreaterThan(small.savings);
  });

  it("has explanation", () => {
    const result = compareStorageVsMemory(5);
    expect(result.explanation.length).toBeGreaterThan(0);
  });
});

describe("comparePackedVsUnpacked", () => {
  it("packed uses fewer slots", () => {
    const result = comparePackedVsUnpacked(4);
    expect(result.optimized.totalGas).toBeLessThan(result.unoptimized.totalGas);
  });

  it("single field has no savings", () => {
    const result = comparePackedVsUnpacked(1);
    expect(result.savings).toBe(0);
  });

  it("32 uint8 fields pack into 1 slot", () => {
    const result = comparePackedVsUnpacked(32);
    expect(result.optimized.label).toContain("1 slot");
    expect(result.unoptimized.label).toContain("32 slots");
  });
});

describe("compareCallTypes", () => {
  it("STATICCALL is cheaper than CALL with value", () => {
    const result = compareCallTypes(100);
    expect(result.optimized.totalGas).toBeLessThan(result.unoptimized.totalGas);
    expect(result.savings).toBeGreaterThan(0);
  });

  it("provides breakdown items", () => {
    const result = compareCallTypes(32);
    expect(result.optimized.breakdown.length).toBeGreaterThan(0);
    expect(result.unoptimized.breakdown.length).toBeGreaterThan(0);
  });
});

describe("compareMappingVsArray", () => {
  it("mapping is cheaper for lookups", () => {
    const result = compareMappingVsArray(100);
    expect(result.optimized.totalGas).toBeLessThan(result.unoptimized.totalGas);
  });

  it("savings grow with array size", () => {
    const small = compareMappingVsArray(10);
    const large = compareMappingVsArray(100);
    expect(large.savings).toBeGreaterThan(small.savings);
  });

  it("mapping is O(1)", () => {
    const result10 = compareMappingVsArray(10);
    const result100 = compareMappingVsArray(100);
    expect(result10.optimized.totalGas).toBe(result100.optimized.totalGas);
  });
});

describe("getGasConstantsTable", () => {
  it("returns non-empty table", () => {
    const table = getGasConstantsTable();
    expect(table.length).toBeGreaterThan(5);
  });

  it("includes SSTORE, SLOAD, MSTORE", () => {
    const table = getGasConstantsTable();
    const names = table.map((r) => r.name);
    expect(names).toContain("SSTORE (new)");
    expect(names).toContain("SLOAD");
    expect(names).toContain("MSTORE");
  });

  it("each entry has name, gas, and description", () => {
    const table = getGasConstantsTable();
    for (const entry of table) {
      expect(entry.name.length).toBeGreaterThan(0);
      expect(entry.gas).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(0);
    }
  });
});
