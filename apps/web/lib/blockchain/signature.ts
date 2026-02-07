import { getPublicKey, sign, verify, utils } from "@noble/secp256k1";
import { keccak_256 } from "@noble/hashes/sha3";
import { bytesToHex, hexToBytes } from "@blockchain-playground/utils";

export interface KeyPair {
  privateKey: string;
  publicKey: string;
  publicKeyCompressed: string;
  address: string;
}

export function generateKeyPair(): KeyPair {
  const privateKeyBytes = utils.randomPrivateKey();
  const privateKey = bytesToHex(privateKeyBytes);
  const publicKeyBytes = getPublicKey(privateKeyBytes, false);
  const publicKeyCompressed = bytesToHex(getPublicKey(privateKeyBytes, true));
  const publicKey = bytesToHex(publicKeyBytes);
  const address = publicKeyToAddress(publicKeyBytes);

  return { privateKey, publicKey, publicKeyCompressed, address };
}

export function publicKeyToAddress(publicKey: Uint8Array): string {
  const keyWithoutPrefix = publicKey.slice(1);
  const hashBytes = keccak_256(keyWithoutPrefix);
  const addressBytes = hashBytes.slice(12);
  return bytesToHex(addressBytes);
}

export function signMessage(
  message: string,
  privateKey: string,
): { signature: string; recovery: number } {
  const msgHash = keccak_256(new TextEncoder().encode(message));
  const privKeyBytes = hexToBytes(privateKey);
  const key =
    privKeyBytes.length > 32 ? privKeyBytes.slice(0, 32) : privKeyBytes;
  const sig = sign(msgHash, key);
  return {
    signature: bytesToHex(sig.toCompactRawBytes()),
    recovery: sig.recovery,
  };
}

export function verifySignature(
  message: string,
  signature: string,
  publicKey: string,
): boolean {
  const msgHash = keccak_256(new TextEncoder().encode(message));
  return verify(hexToBytes(signature), msgHash, hexToBytes(publicKey));
}
