/**
 * Private Transfers — shielded UTXO model (Zcash/Tornado Cash style).
 *
 * Models:
 *   1. Mint: create a "shielded coin" — a commitment to (value, owner, nonce)
 *   2. Transfer: spend a commitment by revealing its nullifier, creating new ones
 *   3. Double-spend detection: nullifier set prevents replay
 *
 * Privacy: the verifier sees commitments and nullifiers but NOT values/owners.
 */

import { hashToHex, generateNonce, type HashScheme } from "./commitment";

// ── Types ──────────────────────────────────────────────────────────────

export interface ShieldedNote {
  readonly commitment: string; // hash(value || owner || nonce)
  readonly nullifier: string; // hash(commitment || ownerSecret)
  readonly value: bigint;
  readonly owner: string;
  readonly nonce: string;
}

export interface PrivateState {
  readonly commitments: readonly string[]; // commitment set (public)
  readonly nullifiers: readonly string[]; // spent nullifiers (public)
  readonly notes: readonly ShieldedNote[]; // private — only owner sees these
}

export interface MintResult {
  readonly success: boolean;
  readonly note: ShieldedNote | null;
  readonly newState: PrivateState;
  readonly message: string;
}

export interface TransferResult {
  readonly success: boolean;
  readonly spentNullifier: string | null;
  readonly newNotes: readonly ShieldedNote[];
  readonly newState: PrivateState;
  readonly message: string;
}

export interface PrivacyAnalysis {
  readonly publicInfo: readonly string[];
  readonly hiddenInfo: readonly string[];
  readonly verifierKnows: string;
  readonly verifierDoesNotKnow: string;
}

// ── Core ───────────────────────────────────────────────────────────────

const SCHEME: HashScheme = "sha256";

function createNote(
  value: bigint,
  owner: string,
  ownerSecret: string
): ShieldedNote {
  const nonce = generateNonce();
  const commitment = hashToHex(`${value}:${owner}:${nonce}`, SCHEME);
  const nullifier = hashToHex(`${commitment}:${ownerSecret}`, SCHEME);
  return { commitment, nullifier, value, owner, nonce };
}

// ── Public API ─────────────────────────────────────────────────────────

/** Create empty private state. */
export function createPrivateState(): PrivateState {
  return { commitments: [], nullifiers: [], notes: [] };
}

/** Mint a new shielded coin. */
export function mintShieldedCoin(
  state: PrivateState,
  value: bigint,
  owner: string,
  ownerSecret: string = "default_secret"
): MintResult {
  if (value <= 0n) {
    return { success: false, note: null, newState: state, message: "Value must be positive" };
  }
  const note = createNote(value, owner, ownerSecret);
  const newState: PrivateState = {
    commitments: [...state.commitments, note.commitment],
    nullifiers: [...state.nullifiers],
    notes: [...state.notes, note],
  };
  return {
    success: true,
    note,
    newState,
    message: `Minted shielded coin worth ${value} for ${owner}`,
  };
}

/** Transfer: spend a note, create new notes for recipient and change. */
export function privateTransfer(
  state: PrivateState,
  senderNote: ShieldedNote,
  recipient: string,
  amount: bigint,
  recipientSecret: string = "recipient_secret",
  senderSecret: string = "default_secret"
): TransferResult {
  // Verify note exists in commitment set
  if (!state.commitments.includes(senderNote.commitment)) {
    return {
      success: false,
      spentNullifier: null,
      newNotes: [],
      newState: state,
      message: "Note commitment not found in state",
    };
  }

  // Check for double-spend
  if (state.nullifiers.includes(senderNote.nullifier)) {
    return {
      success: false,
      spentNullifier: null,
      newNotes: [],
      newState: state,
      message: "Double spend detected — nullifier already used",
    };
  }

  // Check sufficient value
  if (amount > senderNote.value) {
    return {
      success: false,
      spentNullifier: null,
      newNotes: [],
      newState: state,
      message: `Insufficient value: ${senderNote.value} < ${amount}`,
    };
  }

  if (amount <= 0n) {
    return {
      success: false,
      spentNullifier: null,
      newNotes: [],
      newState: state,
      message: "Amount must be positive",
    };
  }

  // Create new notes
  const recipientNote = createNote(amount, recipient, recipientSecret);
  const change = senderNote.value - amount;
  const newNotes: ShieldedNote[] = [recipientNote];

  const newCommitments = [recipientNote.commitment];

  if (change > 0n) {
    const changeNote = createNote(change, senderNote.owner, senderSecret);
    newNotes.push(changeNote);
    newCommitments.push(changeNote.commitment);
  }

  const newState: PrivateState = {
    commitments: [...state.commitments, ...newCommitments],
    nullifiers: [...state.nullifiers, senderNote.nullifier],
    notes: [...state.notes, ...newNotes],
  };

  return {
    success: true,
    spentNullifier: senderNote.nullifier,
    newNotes,
    newState,
    message: `Transferred ${amount} to ${recipient}${change > 0n ? ` (change: ${change})` : ""}`,
  };
}

/** Check if a nullifier has already been spent. */
export function detectDoubleSpend(
  nullifier: string,
  state: PrivateState
): boolean {
  return state.nullifiers.includes(nullifier);
}

/** Explain what a verifier sees vs what's hidden. */
export function getPrivacyAnalysis(): PrivacyAnalysis {
  return {
    publicInfo: [
      "Commitment hashes (opaque values)",
      "Nullifier hashes (spent markers)",
      "Merkle root of commitment tree",
      "Validity proof (ZK-SNARK)",
    ],
    hiddenInfo: [
      "Transfer amounts",
      "Sender identity",
      "Recipient identity",
      "Account balances",
    ],
    verifierKnows:
      "A valid state transition occurred — some committed value was spent and new commitments created, without double-spending.",
    verifierDoesNotKnow:
      "Who sent to whom, how much was transferred, or what any individual balance is.",
  };
}
