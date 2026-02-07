export interface GasBreakdownItem {
  readonly operation: string;
  readonly gasPerOp: number;
  readonly count: number;
  readonly totalGas: number;
}

export interface GasEstimate {
  readonly label: string;
  readonly totalGas: number;
  readonly breakdown: readonly GasBreakdownItem[];
}

export interface GasComparison {
  readonly optimized: GasEstimate;
  readonly unoptimized: GasEstimate;
  readonly savings: number;
  readonly savingsPercent: number;
  readonly explanation: string;
}

// EVM gas constants
const SSTORE_SET = 20000;
const SSTORE_RESET = 5000;
const SLOAD = 2100;
const MSTORE = 3;
const MLOAD = 3;
const CALL_BASE = 2600;
const CALL_VALUE_TRANSFER = 9000;
const STATICCALL_BASE = 2600;
const DELEGATECALL_BASE = 2600;
const CALLDATA_ZERO_BYTE = 4;
const CALLDATA_NONZERO_BYTE = 16;

export function compareStorageVsMemory(operationCount: number): GasComparison {
  const count = Math.max(1, Math.round(operationCount));

  const storageBreakdown: GasBreakdownItem[] = [
    { operation: "SSTORE (first write)", gasPerOp: SSTORE_SET, count: 1, totalGas: SSTORE_SET },
    { operation: "SSTORE (update)", gasPerOp: SSTORE_RESET, count: Math.max(0, count - 1), totalGas: SSTORE_RESET * Math.max(0, count - 1) },
    { operation: "SLOAD (read)", gasPerOp: SLOAD, count, totalGas: SLOAD * count },
  ];

  const memoryBreakdown: GasBreakdownItem[] = [
    { operation: "MSTORE (write)", gasPerOp: MSTORE, count, totalGas: MSTORE * count },
    { operation: "MLOAD (read)", gasPerOp: MLOAD, count, totalGas: MLOAD * count },
  ];

  const storageTotalGas = storageBreakdown.reduce((s, i) => s + i.totalGas, 0);
  const memoryTotalGas = memoryBreakdown.reduce((s, i) => s + i.totalGas, 0);
  const savings = storageTotalGas - memoryTotalGas;

  return {
    unoptimized: { label: "Storage (SSTORE/SLOAD)", totalGas: storageTotalGas, breakdown: storageBreakdown },
    optimized: { label: "Memory (MSTORE/MLOAD)", totalGas: memoryTotalGas, breakdown: memoryBreakdown },
    savings,
    savingsPercent: storageTotalGas > 0 ? (savings / storageTotalGas) * 100 : 0,
    explanation: "Memory operations are orders of magnitude cheaper than storage. Cache storage reads into memory variables when accessed multiple times.",
  };
}

export function comparePackedVsUnpacked(fieldCount: number): GasComparison {
  const count = Math.max(1, Math.round(fieldCount));

  // Unpacked: each uint8 takes a full slot
  const unpackedSlots = count;
  const unpackedBreakdown: GasBreakdownItem[] = [
    { operation: "SSTORE (one per slot)", gasPerOp: SSTORE_SET, count: unpackedSlots, totalGas: SSTORE_SET * unpackedSlots },
  ];

  // Packed: up to 32 uint8s fit in one slot
  const packedSlots = Math.ceil(count / 32);
  const packedBreakdown: GasBreakdownItem[] = [
    { operation: "SSTORE (packed slots)", gasPerOp: SSTORE_SET, count: packedSlots, totalGas: SSTORE_SET * packedSlots },
  ];

  const unpackedTotal = unpackedBreakdown.reduce((s, i) => s + i.totalGas, 0);
  const packedTotal = packedBreakdown.reduce((s, i) => s + i.totalGas, 0);
  const savings = unpackedTotal - packedTotal;

  return {
    unoptimized: { label: `Unpacked (${unpackedSlots} slots)`, totalGas: unpackedTotal, breakdown: unpackedBreakdown },
    optimized: { label: `Packed (${packedSlots} slot${packedSlots > 1 ? "s" : ""})`, totalGas: packedTotal, breakdown: packedBreakdown },
    savings,
    savingsPercent: unpackedTotal > 0 ? (savings / unpackedTotal) * 100 : 0,
    explanation: "Solidity packs variables smaller than 32 bytes into a single slot if they fit. Ordering variables by size (largest first) maximizes packing.",
  };
}

export function compareCallTypes(dataSize: number): GasComparison {
  const size = Math.max(1, Math.round(dataSize));
  const nonZeroBytes = Math.ceil(size * 0.7);
  const zeroBytes = size - nonZeroBytes;
  const calldataCost = nonZeroBytes * CALLDATA_NONZERO_BYTE + zeroBytes * CALLDATA_ZERO_BYTE;

  const callBreakdown: GasBreakdownItem[] = [
    { operation: "CALL base cost", gasPerOp: CALL_BASE, count: 1, totalGas: CALL_BASE },
    { operation: "Value transfer", gasPerOp: CALL_VALUE_TRANSFER, count: 1, totalGas: CALL_VALUE_TRANSFER },
    { operation: "Calldata", gasPerOp: calldataCost, count: 1, totalGas: calldataCost },
  ];

  const staticCallBreakdown: GasBreakdownItem[] = [
    { operation: "STATICCALL base cost", gasPerOp: STATICCALL_BASE, count: 1, totalGas: STATICCALL_BASE },
    { operation: "Calldata", gasPerOp: calldataCost, count: 1, totalGas: calldataCost },
  ];

  const callTotal = callBreakdown.reduce((s, i) => s + i.totalGas, 0);
  const staticTotal = staticCallBreakdown.reduce((s, i) => s + i.totalGas, 0);
  const savings = callTotal - staticTotal;

  return {
    unoptimized: { label: "CALL (with value)", totalGas: callTotal, breakdown: callBreakdown },
    optimized: { label: "STATICCALL (read-only)", totalGas: staticTotal, breakdown: staticCallBreakdown },
    savings,
    savingsPercent: callTotal > 0 ? (savings / callTotal) * 100 : 0,
    explanation: "STATICCALL is cheaper because it doesn't allow state modification or value transfer, saving the 9,000 gas value transfer stipend.",
  };
}

export function compareMappingVsArray(elementCount: number): GasComparison {
  const count = Math.max(1, Math.round(elementCount));

  // Mapping: O(1) lookup
  const mappingBreakdown: GasBreakdownItem[] = [
    { operation: "SLOAD (hash-based lookup)", gasPerOp: SLOAD, count: 1, totalGas: SLOAD },
  ];

  // Array: O(n) linear scan
  const arrayBreakdown: GasBreakdownItem[] = [
    { operation: "SLOAD (length check)", gasPerOp: SLOAD, count: 1, totalGas: SLOAD },
    { operation: "SLOAD (element reads)", gasPerOp: SLOAD, count, totalGas: SLOAD * count },
  ];

  const mappingTotal = mappingBreakdown.reduce((s, i) => s + i.totalGas, 0);
  const arrayTotal = arrayBreakdown.reduce((s, i) => s + i.totalGas, 0);
  const savings = arrayTotal - mappingTotal;

  return {
    unoptimized: { label: `Array scan (${count} elements)`, totalGas: arrayTotal, breakdown: arrayBreakdown },
    optimized: { label: "Mapping lookup (O(1))", totalGas: mappingTotal, breakdown: mappingBreakdown },
    savings,
    savingsPercent: arrayTotal > 0 ? (savings / arrayTotal) * 100 : 0,
    explanation: "Mappings provide O(1) lookups via keccak256 hashing of the key, while iterating an array costs O(n) SLOAD operations.",
  };
}

export function getGasConstantsTable(): readonly { name: string; gas: number; description: string }[] {
  return [
    { name: "SSTORE (new)", gas: SSTORE_SET, description: "Store a new value in storage" },
    { name: "SSTORE (update)", gas: SSTORE_RESET, description: "Update an existing storage value" },
    { name: "SLOAD", gas: SLOAD, description: "Load a value from storage" },
    { name: "MSTORE", gas: MSTORE, description: "Store a word in memory" },
    { name: "MLOAD", gas: MLOAD, description: "Load a word from memory" },
    { name: "CALL", gas: CALL_BASE, description: "External call base cost" },
    { name: "CALL + value", gas: CALL_BASE + CALL_VALUE_TRANSFER, description: "External call with ETH transfer" },
    { name: "STATICCALL", gas: STATICCALL_BASE, description: "Static call (read-only)" },
    { name: "DELEGATECALL", gas: DELEGATECALL_BASE, description: "Delegate call base cost" },
    { name: "Calldata (zero byte)", gas: CALLDATA_ZERO_BYTE, description: "Per zero byte in calldata" },
    { name: "Calldata (non-zero)", gas: CALLDATA_NONZERO_BYTE, description: "Per non-zero byte in calldata" },
  ];
}
