"use client";

import { useState, useCallback } from "react";
import { Key, Check, Copy, Info } from "lucide-react";
import {
  generateKeyPair,
  signMessage,
  verifySignature,
  type KeyPair,
} from "../../lib/blockchain/signature";
import { DemoLayout } from "../shared/demo-layout";
import { EducationPanel } from "../shared/education-panel";
import { StepCard } from "../shared/step-card";
import { OnChainSection } from "../shared/on-chain-section";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

function CopyableCode({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1">
      <pre className="rounded-lg bg-muted p-3 overflow-x-auto flex-1 break-all text-[0.7rem]">
        <code>{value}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        aria-label="Copy to clipboard"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-teal-500 dark:text-teal-400" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}

export function SignatureStudioDemo() {
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null);
  const [message, setMessage] = useState("Hello, Blockchain!");
  const [signature, setSignature] = useState<string | null>(null);
  const [verifyMsg, setVerifyMsg] = useState("");
  const [verifySig, setVerifySig] = useState("");
  const [verifyPubKey, setVerifyPubKey] = useState("");
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [signing, setSigning] = useState(false);

  const handleGenerateKeys = useCallback(() => {
    const kp = generateKeyPair();
    setKeyPair(kp);
    setSignature(null);
    setVerifyResult(null);
  }, []);

  const handleSign = useCallback(() => {
    if (!keyPair) return;
    setSigning(true);
    try {
      const result = signMessage(message, keyPair.privateKey);
      setSignature(result.signature);
      setVerifyMsg(message);
      setVerifySig(result.signature);
      setVerifyPubKey(keyPair.publicKey);
      setVerifyResult(null);
    } finally {
      setSigning(false);
    }
  }, [keyPair, message]);

  const handleVerify = useCallback(() => {
    try {
      const result = verifySignature(verifyMsg, verifySig, verifyPubKey);
      setVerifyResult(result);
    } catch {
      setVerifyResult(false);
    }
  }, [verifyMsg, verifySig, verifyPubKey]);

  const currentStep =
    verifyResult !== null ? 3 : signature ? 2 : keyPair ? 1 : 0;

  const inputPanel = (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Step 1: Generate Key Pair
          </p>
          <Button onClick={handleGenerateKeys}>
            <Key className="h-4 w-4 mr-2" />
            Generate secp256k1 Key Pair
          </Button>

          {keyPair && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground">
                  Private Key
                </p>
                <CopyableCode value={keyPair.privateKey} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Public Key (compressed)
                </p>
                <CopyableCode value={keyPair.publicKeyCompressed} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Ethereum Address
                </p>
                <CopyableCode value={keyPair.address} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Step 2: Sign a Message
          </p>
          <div>
            <Label htmlFor="signature-message">Message</Label>
            <Textarea
              id="signature-message"
              className="min-h-[60px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
            />
          </div>
          <Button onClick={handleSign} disabled={!keyPair || signing}>
            {signing ? "Signing..." : "Sign Message"}
          </Button>

          {signature && (
            <div>
              <p className="text-xs text-muted-foreground">
                Signature
              </p>
              <CopyableCode value={signature} />
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Step 3: Verify Signature
          </p>
          <div>
            <Label htmlFor="signature-verify-msg">Message</Label>
            <Input
              id="signature-verify-msg"
              value={verifyMsg}
              onChange={(e) => setVerifyMsg(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="signature-verify-sig">Signature (hex)</Label>
            <Input
              id="signature-verify-sig"
              value={verifySig}
              onChange={(e) => setVerifySig(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="signature-verify-pubkey">Public Key (hex)</Label>
            <Input
              id="signature-verify-pubkey"
              value={verifyPubKey}
              onChange={(e) => setVerifyPubKey(e.target.value)}
            />
          </div>
          <Button onClick={handleVerify} variant="outline">
            Verify Signature
          </Button>

          {verifyResult !== null && (
            <Alert className={verifyResult ? "border-green-500" : "border-red-500"}>
              <Info className="h-4 w-4" />
              <AlertTitle>{verifyResult ? "Valid Signature" : "Invalid Signature"}</AlertTitle>
              <AlertDescription>
                {verifyResult
                  ? "The signature is valid — the message was signed by the owner of this public key."
                  : "The signature is invalid — the message, signature, or public key does not match."}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );

  const resultPanel = (
    <div className="flex flex-col gap-4" data-testid="signature-process-visual">
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm font-semibold mb-4">
          Signature Process
        </p>
        <div className="flex flex-col gap-1">
          <StepCard
            stepNumber={1}
            title="Generate Key Pair"
            description="Create a random private key and derive the public key using secp256k1 elliptic curve."
            color={currentStep >= 1 ? "green" : "gray"}
            details={
              keyPair
                ? [`Address: ${keyPair.address.slice(0, 20)}...`]
                : undefined
            }
          />
          <StepCard
            stepNumber={2}
            title="Sign Message"
            description="Hash the message, then use the private key to produce a digital signature (r, s values)."
            color={currentStep >= 2 ? "green" : "gray"}
            details={
              signature
                ? [`Signature: ${signature.slice(0, 24)}...`]
                : undefined
            }
          />
          <StepCard
            stepNumber={3}
            title="Verify Signature"
            description="Using only the public key, message, and signature, anyone can verify the signer's identity."
            color={currentStep >= 3 ? (verifyResult ? "green" : "red") : "gray"}
            isLast
            details={
              verifyResult !== null
                ? [
                    verifyResult
                      ? "Verification: PASSED"
                      : "Verification: FAILED",
                  ]
                : undefined
            }
          />
        </div>
      </div>
    </div>
  );

  return (
    <DemoLayout
      inputPanel={inputPanel}
      resultPanel={resultPanel}
      learnContent={
        <EducationPanel
          howItWorks={[
            {
              title: "Key Generation",
              description:
                "A random 256-bit private key is generated. The public key is derived by multiplying the private key with the secp256k1 generator point.",
            },
            {
              title: "Message Hashing",
              description:
                "The message is hashed (keccak256) to produce a fixed-length digest that represents the original data.",
            },
            {
              title: "ECDSA Signing",
              description:
                "The private key signs the message hash using the Elliptic Curve Digital Signature Algorithm, producing (r, s) values.",
            },
            {
              title: "Verification",
              description:
                "Anyone with the public key can verify the signature. This proves the private key holder signed the message without revealing the key.",
            },
          ]}
          whyItMatters="Digital signatures are how blockchains prove ownership and authorize transactions. Your private key signs transactions, and the network verifies them using your public key — no trusted third party needed."
          tips={[
            "The private key must NEVER be shared — it's the only thing that can produce valid signatures",
            "Try modifying the message slightly after signing and verify again — it will fail",
            "Ethereum addresses are derived from the last 20 bytes of keccak256(publicKey)",
          ]}
        />
      }
      onChainContent={
        <OnChainSection
          contractName="SignatureVerifier"
          contractDescription="An on-chain ECDSA signature verifier that uses the EVM's built-in ecrecover precompile. It recovers the signer's address from a message hash and signature, then compares it to the expected signer. This is the same mechanism used by smart contracts to verify signed messages and meta-transactions."
          network="Base Sepolia"
          functions={[
            {
              name: "verify",
              signature:
                "function verify(bytes32 messageHash, bytes calldata signature, address expectedSigner) external returns (bool valid)",
              description:
                "Verify an ECDSA signature on-chain. Extracts r, s, v from the 65-byte signature, calls ecrecover, and compares the recovered address to the expected signer. Emits a SignatureVerified event.",
            },
            {
              name: "getEthSignedMessageHash",
              signature:
                "function getEthSignedMessageHash(bytes calldata message) external pure returns (bytes32)",
              description:
                "Compute the Ethereum signed message hash by prepending the standard '\\x19Ethereum Signed Message:\\n' prefix. Use this to match the hash format produced by wallet signing (e.g., personal_sign).",
            },
          ]}
        />
      }
    />
  );
}
