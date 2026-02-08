"use client";

import {
  Stack,
  Text,
  Group,
  Paper,
  Code,
  CopyButton,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";

function truncateHex(hex: string, chars: number = 10): string {
  if (hex.length <= chars * 2 + 2) return hex;
  return `${hex.slice(0, chars + 2)}...${hex.slice(-chars)}`;
}

interface MerkleTreeViewProps {
  readonly merkleRoot: string;
  readonly nullifierHash: string;
}

export function MerkleTreeView({
  merkleRoot,
  nullifierHash,
}: MerkleTreeViewProps) {
  return (
    <>
      {merkleRoot && (
        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Text fw={600} size="sm">
              Merkle Root (On-chain)
            </Text>
            <Group gap="xs">
              <Code block style={{ flex: 1 }}>
                {truncateHex(merkleRoot, 16)}
              </Code>
              <CopyButton value={merkleRoot}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? "Copied" : "Copy"}>
                    <ActionIcon variant="subtle" onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
          </Stack>
        </Paper>
      )}

      {nullifierHash && (
        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Text fw={600} size="sm">
              Nullifier (Anti-Double-Claim)
            </Text>
            <Text size="xs" c="dimmed">
              Derived from the address and airdrop ID. Prevents the same address
              from claiming twice without revealing which address claimed.
            </Text>
            <Code block>{truncateHex(nullifierHash, 16)}</Code>
          </Stack>
        </Paper>
      )}
    </>
  );
}
