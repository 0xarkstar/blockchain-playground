export type SolidityStorageType =
  | "uint8"
  | "uint16"
  | "uint32"
  | "uint64"
  | "uint128"
  | "uint256"
  | "int8"
  | "int16"
  | "int32"
  | "int64"
  | "int128"
  | "int256"
  | "bool"
  | "address"
  | "bytes1"
  | "bytes2"
  | "bytes4"
  | "bytes8"
  | "bytes16"
  | "bytes32";

export interface StorageVariable {
  readonly name: string;
  readonly type: SolidityStorageType;
}

export interface SlotAssignment {
  readonly slotIndex: number;
  readonly offset: number;
  readonly size: number;
  readonly variable: StorageVariable;
  readonly packed: boolean;
}

export interface StorageLayout {
  readonly assignments: readonly SlotAssignment[];
  readonly totalSlots: number;
  readonly usedBytes: number;
  readonly wastedBytes: number;
  readonly efficiency: number;
}

const TYPE_SIZES: Record<SolidityStorageType, number> = {
  uint8: 1,
  uint16: 2,
  uint32: 4,
  uint64: 8,
  uint128: 16,
  uint256: 32,
  int8: 1,
  int16: 2,
  int32: 4,
  int64: 8,
  int128: 16,
  int256: 32,
  bool: 1,
  address: 20,
  bytes1: 1,
  bytes2: 2,
  bytes4: 4,
  bytes8: 8,
  bytes16: 16,
  bytes32: 32,
};

const SLOT_SIZE = 32;

export function getTypeSize(type: SolidityStorageType): number {
  return TYPE_SIZES[type] ?? 32;
}

export function calculateStorageLayout(
  variables: readonly StorageVariable[]
): StorageLayout {
  if (variables.length === 0) {
    return { assignments: [], totalSlots: 0, usedBytes: 0, wastedBytes: 0, efficiency: 0 };
  }

  const assignments: SlotAssignment[] = [];
  let currentSlot = 0;
  let currentOffset = 0;

  for (const variable of variables) {
    const size = getTypeSize(variable.type);

    if (currentOffset + size > SLOT_SIZE) {
      currentSlot++;
      currentOffset = 0;
    }

    const packed = currentOffset > 0;
    assignments.push({
      slotIndex: currentSlot,
      offset: currentOffset,
      size,
      variable,
      packed,
    });
    currentOffset += size;
  }

  const totalSlots = currentSlot + 1;
  const usedBytes = variables.reduce((sum, v) => sum + getTypeSize(v.type), 0);
  const totalBytes = totalSlots * SLOT_SIZE;
  const wastedBytes = totalBytes - usedBytes;
  const efficiency = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;

  return { assignments, totalSlots, usedBytes, wastedBytes, efficiency };
}

export function optimizeStorageLayout(
  variables: readonly StorageVariable[]
): StorageLayout {
  if (variables.length === 0) {
    return { assignments: [], totalSlots: 0, usedBytes: 0, wastedBytes: 0, efficiency: 0 };
  }

  const sorted = [...variables].sort(
    (a, b) => getTypeSize(b.type) - getTypeSize(a.type)
  );

  return calculateStorageLayout(sorted);
}
