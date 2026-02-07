export {
  getTypeSize,
  calculateStorageLayout,
  optimizeStorageLayout,
  type SolidityStorageType,
  type StorageVariable,
  type SlotAssignment,
  type StorageLayout,
} from "./storage";

export {
  buildFunctionSignature,
  computeFunctionSelector,
  encodeParameter,
  encodeCalldata,
  computeEventTopic,
  encodeLogEntry,
  type AbiParam,
  type EncodedCalldata,
  type EventParam,
  type EncodedLog,
} from "./abi";

export {
  getSolidityTypeInfo,
  encodeValue,
  getAllSolidityTypes,
  type TypeInfo,
  type EncodedValue,
} from "./types";

export {
  createInitialState,
  hasRole,
  grantRole,
  revokeRole,
  renounceRole,
  transferOwnership,
  checkFunctionAccess,
  DEFAULT_ADMIN_ROLE,
  MINTER_ROLE,
  PAUSER_ROLE,
  ADMIN_ROLE,
  type AccessControlState,
  type TransactionResult,
  type AccessCheckResult,
} from "./access-control";

export {
  simulateReentrancyAttack,
  simulateWithReentrancyGuard,
  simulateChecksEffectsInteractions,
  type CallFrame,
  type AttackSimulation,
} from "./security";

export {
  compareStorageVsMemory,
  comparePackedVsUnpacked,
  compareCallTypes,
  compareMappingVsArray,
  getGasConstantsTable,
  type GasBreakdownItem,
  type GasEstimate,
  type GasComparison,
} from "./gas";

export {
  getProxyInfo,
  createProxyState,
  simulateUpgrade,
  visualizeDelegatecall,
  getEIP1967Slots,
  type ProxyType,
  type ProxyInfo,
  type ProxyState,
  type UpgradeResult,
  type DelegatecallVisualization,
} from "./proxy";

export {
  createInitialEvmState,
  executeInstruction,
  executeProgram,
  getOpcodeInfo,
  getAllOpcodes,
  simulateCall,
  type EvmState,
  type Instruction,
  type ExecutionStep,
  type ProgramResult,
  type OpcodeInfo,
  type CallContext,
  type CallResult,
} from "./evm";
