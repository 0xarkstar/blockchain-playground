import {
  generateMnemonic,
  mnemonicToSeedSync,
  validateMnemonic,
} from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { bytesToHex } from "@blockchain-playground/utils";

export function generateNewMnemonic(
  strength: 128 | 160 | 192 | 224 | 256 = 128,
): string {
  return generateMnemonic(wordlist, strength);
}

export function isValidMnemonic(mnemonic: string): boolean {
  return validateMnemonic(mnemonic, wordlist);
}

export function mnemonicToSeed(mnemonic: string, passphrase = ""): string {
  const seed = mnemonicToSeedSync(mnemonic, passphrase);
  return bytesToHex(seed);
}

export function getWordCount(strength: number): number {
  return Math.floor(strength / 32) * 3;
}
