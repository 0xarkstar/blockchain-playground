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

  return (
    <Stack gap="lg">
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
