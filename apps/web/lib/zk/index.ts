export {
  modAdd,
  modSub,
  modMul,
  modPow,
  modInverse,
  getSmallPrimeField,
  getSchnorrField,
  randomFieldElement,
  listGroupElements,
  elementOrder,
  type FieldParams,
} from "./field";

export {
  createCommitment,
  verifyCommitment,
  generateNonce,
  hashToHex,
  type HashScheme,
  type Commitment,
  type CommitmentVerification,
} from "./commitment";

export {
  simulateAliBabaCave,
  calculateSoundness,
  getZKProperties,
  type CaveRound,
  type CaveSimulation,
  type ZKProperty,
} from "./proof-concepts";

export {
  generateSchnorrKeys,
  proverCommit,
  proverRespond,
  verifySchnorr,
  runProtocol,
  type SchnorrKeys,
  type SchnorrCommitment,
  type SchnorrRound,
  type SchnorrProtocolResult,
} from "./schnorr";

export {
  createPedersenParams,
  pedersenCommit,
  verifyPedersen,
  demonstrateHomomorphic,
  type PedersenParams,
  type PedersenCommitmentResult,
  type HomomorphicDemo,
} from "./pedersen";

export {
  decomposeToBits,
  constructRangeProof,
  verifyRangeProof,
  type BitCommitment,
  type RangeProof,
} from "./range-proof";

export {
  createMemberGroup,
  proveZKMembership,
  verifyZKMembership,
  compareProofs,
  type MemberGroup,
  type ZKMembershipProof,
  type ProofComparison,
} from "./set-membership";

export {
  parseExpression,
  gatesToR1CS,
  computeWitness,
  verifySatisfaction,
  getPresetExpressions,
  type Gate,
  type R1CS,
  type WitnessResult,
  type ConstraintCheck,
  type PresetExpression,
} from "./circuit";

export {
  evaluatePolynomial,
  addPolynomials,
  multiplyPolynomials,
  subtractPolynomials,
  dividePolynomials,
  lagrangeInterpolation,
  r1csToQAP,
  verifyQAP,
  formatPolynomial,
  type Polynomial,
  type QAP,
  type QAPVerification,
} from "./polynomial";

export {
  performTrustedSetup,
  generateSNARKProof,
  verifySNARKProof,
  getFullPipeline,
  type TrustedSetup,
  type SNARKProof,
  type SNARKResult,
  type PipelineStep,
  type FullPipelineResult,
} from "./snark";

export {
  createRollupState,
  processBatch,
  calculateCompression,
  type RollupAccount,
  type RollupState,
  type RollupTransaction,
  type BatchResult,
  type CompressionAnalysis,
} from "./rollup";

export {
  createPrivateState,
  mintShieldedCoin,
  privateTransfer,
  detectDoubleSpend,
  getPrivacyAnalysis,
  type ShieldedNote,
  type PrivateState,
  type MintResult,
  type TransferResult as PrivateTransferResult,
  type PrivacyAnalysis,
} from "./private-transfer";
