export interface EvmState {
  readonly stack: readonly bigint[];
  readonly memory: Record<number, string>;
  readonly storage: Record<string, string>;
  readonly pc: number;
  readonly gasUsed: number;
  readonly halted: boolean;
  readonly error?: string;
}

export interface Instruction {
  readonly opcode: string;
  readonly operand?: string;
}

export interface ExecutionStep {
  readonly instruction: Instruction;
  readonly stateBefore: EvmState;
  readonly stateAfter: EvmState;
  readonly description: string;
  readonly gasUsed: number;
}

export interface ProgramResult {
  readonly steps: readonly ExecutionStep[];
  readonly finalState: EvmState;
  readonly totalGas: number;
  readonly success: boolean;
  readonly error?: string;
}

export interface OpcodeInfo {
  readonly opcode: string;
  readonly name: string;
  readonly description: string;
  readonly gas: number;
  readonly stackIn: number;
  readonly stackOut: number;
}

export interface CallContext {
  readonly callType: "call" | "delegatecall" | "staticcall";
  readonly from: string;
  readonly to: string;
  readonly value: number;
}

export interface CallResult {
  readonly callType: string;
  readonly msgSender: string;
  readonly storageContext: string;
  readonly codeSource: string;
  readonly valueTransferred: number;
  readonly canModifyState: boolean;
  readonly description: string;
}

const OPCODE_MAP: Record<string, OpcodeInfo> = {
  PUSH1: { opcode: "PUSH1", name: "PUSH1", description: "Push 1-byte value onto stack", gas: 3, stackIn: 0, stackOut: 1 },
  PUSH32: { opcode: "PUSH32", name: "PUSH32", description: "Push 32-byte value onto stack", gas: 3, stackIn: 0, stackOut: 1 },
  ADD: { opcode: "ADD", name: "ADD", description: "Addition (a + b)", gas: 3, stackIn: 2, stackOut: 1 },
  SUB: { opcode: "SUB", name: "SUB", description: "Subtraction (a - b)", gas: 3, stackIn: 2, stackOut: 1 },
  MUL: { opcode: "MUL", name: "MUL", description: "Multiplication (a * b)", gas: 5, stackIn: 2, stackOut: 1 },
  DIV: { opcode: "DIV", name: "DIV", description: "Integer division (a / b)", gas: 5, stackIn: 2, stackOut: 1 },
  MOD: { opcode: "MOD", name: "MOD", description: "Modulo (a % b)", gas: 5, stackIn: 2, stackOut: 1 },
  MSTORE: { opcode: "MSTORE", name: "MSTORE", description: "Store word to memory", gas: 3, stackIn: 2, stackOut: 0 },
  MLOAD: { opcode: "MLOAD", name: "MLOAD", description: "Load word from memory", gas: 3, stackIn: 1, stackOut: 1 },
  SSTORE: { opcode: "SSTORE", name: "SSTORE", description: "Store word to storage", gas: 20000, stackIn: 2, stackOut: 0 },
  SLOAD: { opcode: "SLOAD", name: "SLOAD", description: "Load word from storage", gas: 2100, stackIn: 1, stackOut: 1 },
  DUP1: { opcode: "DUP1", name: "DUP1", description: "Duplicate 1st stack item", gas: 3, stackIn: 1, stackOut: 2 },
  DUP2: { opcode: "DUP2", name: "DUP2", description: "Duplicate 2nd stack item", gas: 3, stackIn: 2, stackOut: 3 },
  SWAP1: { opcode: "SWAP1", name: "SWAP1", description: "Swap top two stack items", gas: 3, stackIn: 2, stackOut: 2 },
  POP: { opcode: "POP", name: "POP", description: "Remove top stack item", gas: 2, stackIn: 1, stackOut: 0 },
  ISZERO: { opcode: "ISZERO", name: "ISZERO", description: "Check if top is zero", gas: 3, stackIn: 1, stackOut: 1 },
  AND: { opcode: "AND", name: "AND", description: "Bitwise AND", gas: 3, stackIn: 2, stackOut: 1 },
  OR: { opcode: "OR", name: "OR", description: "Bitwise OR", gas: 3, stackIn: 2, stackOut: 1 },
  NOT: { opcode: "NOT", name: "NOT", description: "Bitwise NOT", gas: 3, stackIn: 1, stackOut: 1 },
  LT: { opcode: "LT", name: "LT", description: "Less than comparison", gas: 3, stackIn: 2, stackOut: 1 },
  GT: { opcode: "GT", name: "GT", description: "Greater than comparison", gas: 3, stackIn: 2, stackOut: 1 },
  EQ: { opcode: "EQ", name: "EQ", description: "Equality comparison", gas: 3, stackIn: 2, stackOut: 1 },
  CALLER: { opcode: "CALLER", name: "CALLER", description: "Push msg.sender", gas: 2, stackIn: 0, stackOut: 1 },
  CALLVALUE: { opcode: "CALLVALUE", name: "CALLVALUE", description: "Push msg.value", gas: 2, stackIn: 0, stackOut: 1 },
};

const MAX_UINT256 = (BigInt(1) << BigInt(256)) - BigInt(1);

export function createInitialEvmState(): EvmState {
  return {
    stack: [],
    memory: {},
    storage: {},
    pc: 0,
    gasUsed: 0,
    halted: false,
  };
}

export function executeInstruction(
  state: EvmState,
  instruction: Instruction
): EvmState {
  if (state.halted) return state;

  const info = OPCODE_MAP[instruction.opcode];
  if (!info) {
    return { ...state, halted: true, error: `Unknown opcode: ${instruction.opcode}` };
  }

  const { stack } = state;
  const gas = info.gas;

  switch (instruction.opcode) {
    case "PUSH1":
    case "PUSH32": {
      const val = BigInt(instruction.operand ?? "0");
      return {
        ...state,
        stack: [...stack, val],
        pc: state.pc + 1,
        gasUsed: state.gasUsed + gas,
      };
    }

    case "ADD": {
      if (stack.length < 2) return { ...state, halted: true, error: "Stack underflow" };
      const a = stack[stack.length - 1]!;
      const b = stack[stack.length - 2]!;
      const result = (a + b) & MAX_UINT256;
      return {
        ...state,
        stack: [...stack.slice(0, -2), result],
        pc: state.pc + 1,
        gasUsed: state.gasUsed + gas,
      };
    }

    case "SUB": {
      if (stack.length < 2) return { ...state, halted: true, error: "Stack underflow" };
      const a = stack[stack.length - 1]!;
      const b = stack[stack.length - 2]!;
      const result = a >= b ? a - b : MAX_UINT256 + BigInt(1) - (b - a);
      return {
        ...state,
        stack: [...stack.slice(0, -2), result & MAX_UINT256],
        pc: state.pc + 1,
        gasUsed: state.gasUsed + gas,
      };
    }

    case "MUL": {
      if (stack.length < 2) return { ...state, halted: true, error: "Stack underflow" };
      const a = stack[stack.length - 1]!;
      const b = stack[stack.length - 2]!;
      const result = (a * b) & MAX_UINT256;
      return {
        ...state,
        stack: [...stack.slice(0, -2), result],
        pc: state.pc + 1,
        gasUsed: state.gasUsed + gas,
      };
    }

    case "DIV": {
      if (stack.length < 2) return { ...state, halted: true, error: "Stack underflow" };
      const a = stack[stack.length - 1]!;
      const b = stack[stack.length - 2]!;
      const result = b === BigInt(0) ? BigInt(0) : a / b;
      return {
        ...state,
        stack: [...stack.slice(0, -2), result],
        pc: state.pc + 1,
        gasUsed: state.gasUsed + gas,
      };
    }

    case "MOD": {
      if (stack.length < 2) return { ...state, halted: true, error: "Stack underflow" };
      const a = stack[stack.length - 1]!;
      const b = stack[stack.length - 2]!;
      const result = b === BigInt(0) ? BigInt(0) : a % b;
      return {
        ...state,
        stack: [...stack.slice(0, -2), result],
        pc: state.pc + 1,
        gasUsed: state.gasUsed + gas,
      };
    }

    case "MSTORE": {
      if (stack.length < 2) return { ...state, halted: true, error: "Stack underflow" };
      const offset = Number(stack[stack.length - 1]!);
      const value = stack[stack.length - 2]!;
      return {
        ...state,
        stack: [...stack.slice(0, -2)],
        memory: { ...state.memory, [offset]: value.toString(16).padStart(64, "0") },
        pc: state.pc + 1,
        gasUsed: state.gasUsed + gas,
      };
    }

    case "MLOAD": {
      if (stack.length < 1) return { ...state, halted: true, error: "Stack underflow" };
      const offset = Number(stack[stack.length - 1]!);
      const value = state.memory[offset] ?? "0".repeat(64);
      return {
        ...state,
        stack: [...stack.slice(0, -1), BigInt("0x" + value)],
        pc: state.pc + 1,
        gasUsed: state.gasUsed + gas,
      };
    }

    case "SSTORE": {
      if (stack.length < 2) return { ...state, halted: true, error: "Stack underflow" };
      const key = stack[stack.length - 1]!.toString(16);
      const value = stack[stack.length - 2]!.toString(16).padStart(64, "0");
      return {
        ...state,
        stack: [...stack.slice(0, -2)],
        storage: { ...state.storage, [key]: value },
        pc: state.pc + 1,
        gasUsed: state.gasUsed + gas,
      };
    }

    case "SLOAD": {
      if (stack.length < 1) return { ...state, halted: true, error: "Stack underflow" };
      const key = stack[stack.length - 1]!.toString(16);
      const value = state.storage[key] ?? "0".repeat(64);
      return {
        ...state,
        stack: [...stack.slice(0, -1), BigInt("0x" + value)],
        pc: state.pc + 1,
        gasUsed: state.gasUsed + gas,
      };
    }

    case "DUP1": {
      if (stack.length < 1) return { ...state, halted: true, error: "Stack underflow" };
      return {
        ...state,
        stack: [...stack, stack[stack.length - 1]!],
        pc: state.pc + 1,
        gasUsed: state.gasUsed + gas,
      };
    }

    case "DUP2": {
      if (stack.length < 2) return { ...state, halted: true, error: "Stack underflow" };
      return {
        ...state,
        stack: [...stack, stack[stack.length - 2]!],
        pc: state.pc + 1,
        gasUsed: state.gasUsed + gas,
      };
    }

    case "SWAP1": {
      if (stack.length < 2) return { ...state, halted: true, error: "Stack underflow" };
      const newStack = [...stack];
      const top = newStack[newStack.length - 1]!;
      newStack[newStack.length - 1] = newStack[newStack.length - 2]!;
      newStack[newStack.length - 2] = top;
      return {
        ...state,
        stack: newStack,
        pc: state.pc + 1,
        gasUsed: state.gasUsed + gas,
      };
    }

    case "POP": {
      if (stack.length < 1) return { ...state, halted: true, error: "Stack underflow" };
      return {
        ...state,
        stack: [...stack.slice(0, -1)],
        pc: state.pc + 1,
        gasUsed: state.gasUsed + gas,
      };
    }

    case "ISZERO": {
      if (stack.length < 1) return { ...state, halted: true, error: "Stack underflow" };
      const val = stack[stack.length - 1]!;
      const result = val === BigInt(0) ? BigInt(1) : BigInt(0);
      return {
        ...state,
        stack: [...stack.slice(0, -1), result],
        pc: state.pc + 1,
        gasUsed: state.gasUsed + gas,
      };
    }

    case "AND": {
      if (stack.length < 2) return { ...state, halted: true, error: "Stack underflow" };
      const a = stack[stack.length - 1]!;
      const b = stack[stack.length - 2]!;
      return {
        ...state,
        stack: [...stack.slice(0, -2), a & b],
        pc: state.pc + 1,
        gasUsed: state.gasUsed + gas,
      };
    }

    case "OR": {
      if (stack.length < 2) return { ...state, halted: true, error: "Stack underflow" };
      const a = stack[stack.length - 1]!;
      const b = stack[stack.length - 2]!;
      return {
        ...state,
        stack: [...stack.slice(0, -2), a | b],
        pc: state.pc + 1,
        gasUsed: state.gasUsed + gas,
      };
    }

    case "NOT": {
      if (stack.length < 1) return { ...state, halted: true, error: "Stack underflow" };
      const val = stack[stack.length - 1]!;
      return {
        ...state,
        stack: [...stack.slice(0, -1), MAX_UINT256 ^ val],
        pc: state.pc + 1,
        gasUsed: state.gasUsed + gas,
      };
    }

    case "LT": {
      if (stack.length < 2) return { ...state, halted: true, error: "Stack underflow" };
      const a = stack[stack.length - 1]!;
      const b = stack[stack.length - 2]!;
      return {
        ...state,
        stack: [...stack.slice(0, -2), a < b ? BigInt(1) : BigInt(0)],
        pc: state.pc + 1,
        gasUsed: state.gasUsed + gas,
      };
    }

    case "GT": {
      if (stack.length < 2) return { ...state, halted: true, error: "Stack underflow" };
      const a = stack[stack.length - 1]!;
      const b = stack[stack.length - 2]!;
      return {
        ...state,
        stack: [...stack.slice(0, -2), a > b ? BigInt(1) : BigInt(0)],
        pc: state.pc + 1,
        gasUsed: state.gasUsed + gas,
      };
    }

    case "EQ": {
      if (stack.length < 2) return { ...state, halted: true, error: "Stack underflow" };
      const a = stack[stack.length - 1]!;
      const b = stack[stack.length - 2]!;
      return {
        ...state,
        stack: [...stack.slice(0, -2), a === b ? BigInt(1) : BigInt(0)],
        pc: state.pc + 1,
        gasUsed: state.gasUsed + gas,
      };
    }

    case "CALLER": {
      const callerAddr = BigInt("0xdead");
      return {
        ...state,
        stack: [...stack, callerAddr],
        pc: state.pc + 1,
        gasUsed: state.gasUsed + gas,
      };
    }

    case "CALLVALUE": {
      return {
        ...state,
        stack: [...stack, BigInt(0)],
        pc: state.pc + 1,
        gasUsed: state.gasUsed + gas,
      };
    }

    default:
      return { ...state, halted: true, error: `Unimplemented: ${instruction.opcode}` };
  }
}

export function executeProgram(instructions: readonly Instruction[]): ProgramResult {
  const steps: ExecutionStep[] = [];
  let state = createInitialEvmState();

  for (const instruction of instructions) {
    if (state.halted) break;

    const stateBefore = state;
    const info = OPCODE_MAP[instruction.opcode];
    state = executeInstruction(state, instruction);

    steps.push({
      instruction,
      stateBefore,
      stateAfter: state,
      description: info?.description ?? `Unknown: ${instruction.opcode}`,
      gasUsed: info?.gas ?? 0,
    });
  }

  return {
    steps,
    finalState: state,
    totalGas: state.gasUsed,
    success: !state.error,
    error: state.error,
  };
}

export function getOpcodeInfo(opcode: string): OpcodeInfo | null {
  return OPCODE_MAP[opcode] ?? null;
}

export function getAllOpcodes(): readonly OpcodeInfo[] {
  return Object.values(OPCODE_MAP);
}

export function simulateCall(context: CallContext): CallResult {
  switch (context.callType) {
    case "call":
      return {
        callType: "CALL",
        msgSender: context.from,
        storageContext: context.to,
        codeSource: context.to,
        valueTransferred: context.value,
        canModifyState: true,
        description: `Regular call from ${context.from} to ${context.to}. Target's code runs with target's storage. msg.sender = ${context.from}.`,
      };
    case "delegatecall":
      return {
        callType: "DELEGATECALL",
        msgSender: context.from,
        storageContext: context.from,
        codeSource: context.to,
        valueTransferred: 0,
        canModifyState: true,
        description: `Delegate call from ${context.from} to ${context.to}. Target's code runs with caller's storage. msg.sender preserved from original caller.`,
      };
    case "staticcall":
      return {
        callType: "STATICCALL",
        msgSender: context.from,
        storageContext: context.to,
        codeSource: context.to,
        valueTransferred: 0,
        canModifyState: false,
        description: `Static call from ${context.from} to ${context.to}. Read-only — no state modification allowed. Reverts if target tries SSTORE.`,
      };
  }
}
