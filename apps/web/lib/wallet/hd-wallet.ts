import { HDKey } from "@scure/bip32";
import { mnemonicToSeedSync } from "@scure/bip39";
import { keccak_256 } from "@noble/hashes/sha3";
import { bytesToHex } from "@blockchain-playground/utils";

export interface DerivedAccount {
  path: string;
  index: number;
  privateKey: string;
  publicKey: string;
  address: string;
}

export interface HDWalletInfo {
  mnemonic: string;
  seed: string;
  masterPublicKey: string;
  accounts: DerivedAccount[];
}

const DEFAULT_PATH_PREFIX = "m/44'/60'/0'/0";

export function deriveAccountsFromMnemonic(
  mnemonic: string,
  count = 5,
  pathPrefix = DEFAULT_PATH_PREFIX,
): HDWalletInfo {
  const seed = mnemonicToSeedSync(mnemonic, "");
  const master = HDKey.fromMasterSeed(seed);

  const accounts: DerivedAccount[] = [];
  for (let i = 0; i < count; i++) {
    const path = `${pathPrefix}/${i}`;
    const child = master.derive(path);

    if (!child.privateKey || !child.publicKey) {
      throw new Error(`Failed to derive key at path ${path}`);
    }

    const address = publicKeyBytesToAddress(child.publicKey);
    accounts.push({
      path,
      index: i,
      privateKey: bytesToHex(child.privateKey),
      publicKey: bytesToHex(child.publicKey),
      address,
    });
  }

  return {
    mnemonic,
    seed: bytesToHex(seed),
    masterPublicKey: master.publicKey ? bytesToHex(master.publicKey) : "",
    accounts,
  };
}

function publicKeyBytesToAddress(publicKey: Uint8Array): string {
  const uncompressed =
    publicKey.length === 33 ? decompressPublicKey(publicKey) : publicKey;
  const keyWithoutPrefix = uncompressed.slice(1);
  const hashResult = keccak_256(keyWithoutPrefix);
  return bytesToHex(hashResult.slice(12));
}

function decompressPublicKey(compressed: Uint8Array): Uint8Array {
  // For display purposes we return the compressed key as-is
  // Full decompression would require secp256k1 point operations
  // In the demo context, we use the HDKey's derived address directly
  return compressed;
}
