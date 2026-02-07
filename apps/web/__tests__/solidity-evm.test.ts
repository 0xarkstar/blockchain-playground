import { describe, it, expect } from "vitest";
import {
  createInitialEvmState,
  executeInstruction,
  executeProgram,
  getOpcodeInfo,
  getAllOpcodes,
  simulateCall,
} from "../lib/solidity/evm";

describe("createInitialEvmState", () => {
  it("creates empty state", () => {
    const state = createInitialEvmState();
    expect(state.stack).toHaveLength(0);
    expect(Object.keys(state.memory)).toHaveLength(0);
    expect(Object.keys(state.storage)).toHaveLength(0);
    expect(state.pc).toBe(0);
    expect(state.gasUsed).toBe(0);
    expect(state.halted).toBe(false);
  });
});

describe("executeInstruction", () => {
  it("PUSH1 pushes value onto stack", () => {
    const state = createInitialEvmState();
    const result = executeInstruction(state, { opcode: "PUSH1", operand: "42" });
    expect(result.stack).toHaveLength(1);
    expect(result.stack[0]).toBe(BigInt(42));
  });

  it("ADD adds top two stack items", () => {
    let state = createInitialEvmState();
    state = executeInstruction(state, { opcode: "PUSH1", operand: "10" });
    state = executeInstruction(state, { opcode: "PUSH1", operand: "20" });
    state = executeInstruction(state, { opcode: "ADD" });
    expect(state.stack).toHaveLength(1);
    expect(state.stack[0]).toBe(BigInt(30));
  });

  it("SUB subtracts correctly", () => {
    let state = createInitialEvmState();
    state = executeInstruction(state, { opcode: "PUSH1", operand: "5" });
    state = executeInstruction(state, { opcode: "PUSH1", operand: "20" });
    state = executeInstruction(state, { opcode: "SUB" });
    expect(state.stack[0]).toBe(BigInt(15));
  });

  it("MUL multiplies correctly", () => {
    let state = createInitialEvmState();
    state = executeInstruction(state, { opcode: "PUSH1", operand: "3" });
    state = executeInstruction(state, { opcode: "PUSH1", operand: "7" });
    state = executeInstruction(state, { opcode: "MUL" });
    expect(state.stack[0]).toBe(BigInt(21));
  });

  it("DIV divides correctly", () => {
    let state = createInitialEvmState();
    state = executeInstruction(state, { opcode: "PUSH1", operand: "5" });
    state = executeInstruction(state, { opcode: "PUSH1", operand: "20" });
    state = executeInstruction(state, { opcode: "DIV" });
    expect(state.stack[0]).toBe(BigInt(4));
  });

  it("DIV by zero returns 0", () => {
    let state = createInitialEvmState();
    state = executeInstruction(state, { opcode: "PUSH1", operand: "0" });
    state = executeInstruction(state, { opcode: "PUSH1", operand: "10" });
    state = executeInstruction(state, { opcode: "DIV" });
    expect(state.stack[0]).toBe(BigInt(0));
  });

  it("MOD computes remainder", () => {
    let state = createInitialEvmState();
    state = executeInstruction(state, { opcode: "PUSH1", operand: "3" });
    state = executeInstruction(state, { opcode: "PUSH1", operand: "10" });
    state = executeInstruction(state, { opcode: "MOD" });
    expect(state.stack[0]).toBe(BigInt(1));
  });

  it("MSTORE and MLOAD roundtrip", () => {
    let state = createInitialEvmState();
    state = executeInstruction(state, { opcode: "PUSH1", operand: "42" });
    state = executeInstruction(state, { opcode: "PUSH1", operand: "0" });
    state = executeInstruction(state, { opcode: "MSTORE" });
    expect(state.stack).toHaveLength(0);
    state = executeInstruction(state, { opcode: "PUSH1", operand: "0" });
    state = executeInstruction(state, { opcode: "MLOAD" });
    expect(state.stack[0]).toBe(BigInt(42));
  });

  it("SSTORE and SLOAD roundtrip", () => {
    let state = createInitialEvmState();
    state = executeInstruction(state, { opcode: "PUSH1", operand: "99" });
    state = executeInstruction(state, { opcode: "PUSH1", operand: "1" });
    state = executeInstruction(state, { opcode: "SSTORE" });
    state = executeInstruction(state, { opcode: "PUSH1", operand: "1" });
    state = executeInstruction(state, { opcode: "SLOAD" });
    expect(state.stack[0]).toBe(BigInt(99));
  });

  it("DUP1 duplicates top item", () => {
    let state = createInitialEvmState();
    state = executeInstruction(state, { opcode: "PUSH1", operand: "5" });
    state = executeInstruction(state, { opcode: "DUP1" });
    expect(state.stack).toHaveLength(2);
    expect(state.stack[0]).toBe(state.stack[1]);
  });

  it("SWAP1 swaps top two items", () => {
    let state = createInitialEvmState();
    state = executeInstruction(state, { opcode: "PUSH1", operand: "1" });
    state = executeInstruction(state, { opcode: "PUSH1", operand: "2" });
    state = executeInstruction(state, { opcode: "SWAP1" });
    expect(state.stack[state.stack.length - 1]).toBe(BigInt(1));
    expect(state.stack[state.stack.length - 2]).toBe(BigInt(2));
  });

  it("POP removes top item", () => {
    let state = createInitialEvmState();
    state = executeInstruction(state, { opcode: "PUSH1", operand: "5" });
    state = executeInstruction(state, { opcode: "POP" });
    expect(state.stack).toHaveLength(0);
  });

  it("ISZERO returns 1 for zero, 0 for non-zero", () => {
    let state = createInitialEvmState();
    state = executeInstruction(state, { opcode: "PUSH1", operand: "0" });
    state = executeInstruction(state, { opcode: "ISZERO" });
    expect(state.stack[0]).toBe(BigInt(1));

    state = createInitialEvmState();
    state = executeInstruction(state, { opcode: "PUSH1", operand: "42" });
    state = executeInstruction(state, { opcode: "ISZERO" });
    expect(state.stack[0]).toBe(BigInt(0));
  });

  it("EQ returns 1 for equal values", () => {
    let state = createInitialEvmState();
    state = executeInstruction(state, { opcode: "PUSH1", operand: "5" });
    state = executeInstruction(state, { opcode: "PUSH1", operand: "5" });
    state = executeInstruction(state, { opcode: "EQ" });
    expect(state.stack[0]).toBe(BigInt(1));
  });

  it("LT and GT work correctly", () => {
    let state = createInitialEvmState();
    state = executeInstruction(state, { opcode: "PUSH1", operand: "5" });
    state = executeInstruction(state, { opcode: "PUSH1", operand: "3" });
    state = executeInstruction(state, { opcode: "LT" });
    expect(state.stack[0]).toBe(BigInt(1)); // 3 < 5

    state = createInitialEvmState();
    state = executeInstruction(state, { opcode: "PUSH1", operand: "3" });
    state = executeInstruction(state, { opcode: "PUSH1", operand: "5" });
    state = executeInstruction(state, { opcode: "GT" });
    expect(state.stack[0]).toBe(BigInt(1)); // 5 > 3
  });

  it("errors on stack underflow", () => {
    const state = createInitialEvmState();
    const result = executeInstruction(state, { opcode: "ADD" });
    expect(result.halted).toBe(true);
    expect(result.error).toContain("underflow");
  });

  it("errors on unknown opcode", () => {
    const state = createInitialEvmState();
    const result = executeInstruction(state, { opcode: "INVALID" });
    expect(result.halted).toBe(true);
    expect(result.error).toContain("Unknown");
  });

  it("does nothing on halted state", () => {
    const halted = { ...createInitialEvmState(), halted: true };
    const result = executeInstruction(halted, { opcode: "PUSH1", operand: "1" });
    expect(result.stack).toHaveLength(0);
  });
});

describe("executeProgram", () => {
  it("executes simple addition program", () => {
    const result = executeProgram([
      { opcode: "PUSH1", operand: "10" },
      { opcode: "PUSH1", operand: "20" },
      { opcode: "ADD" },
    ]);
    expect(result.success).toBe(true);
    expect(result.finalState.stack[0]).toBe(BigInt(30));
    expect(result.steps).toHaveLength(3);
  });

  it("tracks total gas", () => {
    const result = executeProgram([
      { opcode: "PUSH1", operand: "1" },
      { opcode: "PUSH1", operand: "2" },
      { opcode: "ADD" },
    ]);
    expect(result.totalGas).toBe(9); // 3 + 3 + 3
  });

  it("stops on error", () => {
    const result = executeProgram([
      { opcode: "PUSH1", operand: "1" },
      { opcode: "ADD" }, // underflow
      { opcode: "PUSH1", operand: "3" }, // should not execute
    ]);
    expect(result.success).toBe(false);
    expect(result.steps).toHaveLength(2); // only 2 steps executed
  });

  it("handles empty program", () => {
    const result = executeProgram([]);
    expect(result.success).toBe(true);
    expect(result.totalGas).toBe(0);
    expect(result.steps).toHaveLength(0);
  });
});

describe("getOpcodeInfo", () => {
  it("returns info for known opcodes", () => {
    const info = getOpcodeInfo("ADD");
    expect(info).not.toBeNull();
    expect(info!.gas).toBe(3);
    expect(info!.stackIn).toBe(2);
    expect(info!.stackOut).toBe(1);
  });

  it("returns null for unknown opcode", () => {
    expect(getOpcodeInfo("INVALID")).toBeNull();
  });
});

describe("getAllOpcodes", () => {
  it("returns at least 20 opcodes", () => {
    const opcodes = getAllOpcodes();
    expect(opcodes.length).toBeGreaterThanOrEqual(20);
  });

  it("includes basic opcodes", () => {
    const opcodes = getAllOpcodes();
    const names = opcodes.map((o) => o.opcode);
    expect(names).toContain("ADD");
    expect(names).toContain("PUSH1");
    expect(names).toContain("SSTORE");
    expect(names).toContain("MLOAD");
  });
});

describe("simulateCall", () => {
  it("CALL: msg.sender is from, storage is to", () => {
    const result = simulateCall({ callType: "call", from: "A", to: "B", value: 100 });
    expect(result.msgSender).toBe("A");
    expect(result.storageContext).toBe("B");
    expect(result.codeSource).toBe("B");
    expect(result.valueTransferred).toBe(100);
    expect(result.canModifyState).toBe(true);
  });

  it("DELEGATECALL: storage is caller's, no value", () => {
    const result = simulateCall({ callType: "delegatecall", from: "A", to: "B", value: 0 });
    expect(result.msgSender).toBe("A");
    expect(result.storageContext).toBe("A");
    expect(result.codeSource).toBe("B");
    expect(result.valueTransferred).toBe(0);
  });

  it("STATICCALL: read-only, no value", () => {
    const result = simulateCall({ callType: "staticcall", from: "A", to: "B", value: 0 });
    expect(result.canModifyState).toBe(false);
    expect(result.valueTransferred).toBe(0);
  });
});
