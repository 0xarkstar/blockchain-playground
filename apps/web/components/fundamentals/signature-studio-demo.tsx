"use client";

import { useState, useCallback } from "react";
import {
  Stack,
  TextInput,
  Textarea,
  Button,
  Code,
  Text,
  Paper,
  Group,
  Badge,
  CopyButton,
  ActionIcon,
  Alert,
  SimpleGrid,
} from "@mantine/core";
import {
  IconKey,
  IconCheck,
  IconCopy,
  IconInfoCircle,
} from "@tabler/icons-react";
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
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Step 1: Generate Key Pair
          </Text>
          <Button
            leftSection={<IconKey size={16} />}
            onClick={handleGenerateKeys}
          >
            Generate secp256k1 Key Pair
          </Button>

          {keyPair && (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
              <div>
                <Text size="xs" c="dimmed">
                  Private Key
                </Text>
                <CopyableCode value={keyPair.privateKey} />
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  Public Key (compressed)
                </Text>
                <CopyableCode value={keyPair.publicKeyCompressed} />
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  Ethereum Address
                </Text>
                <CopyableCode value={keyPair.address} />
              </div>
            </SimpleGrid>
          )}
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Step 2: Sign a Message
          </Text>
          <Textarea
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
            minRows={2}
          />
          <Button onClick={handleSign} disabled={!keyPair} loading={signing}>
            Sign Message
          </Button>

          {signature && (
            <div>
              <Text size="xs" c="dimmed">
                Signature
              </Text>
              <CopyableCode value={signature} />
            </div>
          )}
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Step 3: Verify Signature
          </Text>
          <TextInput
            label="Message"
            value={verifyMsg}
            onChange={(e) => setVerifyMsg(e.currentTarget.value)}
            size="sm"
          />
          <TextInput
            label="Signature (hex)"
            value={verifySig}
            onChange={(e) => setVerifySig(e.currentTarget.value)}
            size="sm"
          />
          <TextInput
            label="Public Key (hex)"
            value={verifyPubKey}
            onChange={(e) => setVerifyPubKey(e.currentTarget.value)}
            size="sm"
          />
          <Button onClick={handleVerify} variant="outline">
            Verify Signature
          </Button>

          {verifyResult !== null && (
            <Alert
              icon={<IconInfoCircle size={16} />}
              color={verifyResult ? "green" : "red"}
              title={verifyResult ? "Valid Signature" : "Invalid Signature"}
            >
              {verifyResult
                ? "The signature is valid — the message was signed by the owner of this public key."
                : "The signature is invalid — the message, signature, or public key does not match."}
            </Alert>
          )}
        </Stack>
      </Paper>
    </Stack>
  );

  const resultPanel = (
    <Stack gap="md" data-testid="signature-process-visual">
      <Paper p="md" withBorder>
        <Text size="sm" fw={600} mb="md">
          Signature Process
        </Text>
        <Stack gap="xs">
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
        </Stack>
      </Paper>
    </Stack>
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

function CopyableCode({ value }: { value: string }) {
  return (
    <Group gap="xs" align="center">
      <Code
        block
        style={{ flex: 1, wordBreak: "break-all", fontSize: "0.7rem" }}
      >
        {value}
      </Code>
      <CopyButton value={value}>
        {({ copied, copy }) => (
          <ActionIcon
            variant="subtle"
            color={copied ? "teal" : "gray"}
            onClick={copy}
            size="sm"
          >
            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
          </ActionIcon>
        )}
      </CopyButton>
    </Group>
  );
}
