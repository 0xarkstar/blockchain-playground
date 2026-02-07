"use client";

import { useState, useMemo } from "react";
import {
  Stack, Paper, TextInput, Button, Table, Code, Badge, Group, Text, Alert,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  createERC721, mintNFT, transferNFT, ownerOf, balanceOfNFT, tokensOfOwner, totalSupplyNFT,
  type ERC721State, type NFTMetadata,
} from "../../lib/tokens/erc721";

export function SoulboundTokensDemo() {
  const [state, setState] = useState<ERC721State>(() => createERC721("SoulboundID", "SBT", true));
  const [mintTo, setMintTo] = useState("alice");
  const [credentialType, setCredentialType] = useState("Degree");
  const [issuer, setIssuer] = useState("University of Blockchain");
  const [transferFrom, setTransferFrom] = useState("alice");
  const [transferTo, setTransferTo] = useState("bob");
  const [transferTokenId, setTransferTokenId] = useState("1");
  const [lastMessage, setLastMessage] = useState("Soulbound collection created — tokens cannot be transferred");

  const owners = useMemo(() => {
    return Array.from(new Set(Object.values(state.owners)));
  }, [state.owners]);

  const handleMint = () => {
    const meta: NFTMetadata = {
      name: `${credentialType} - ${mintTo}`,
      description: `Issued by ${issuer}`,
      image: "ipfs://soulbound",
      attributes: [
        { trait_type: "Type", value: credentialType },
        { trait_type: "Issuer", value: issuer },
        { trait_type: "Issued To", value: mintTo },
      ],
    };
    const result = mintNFT(state, mintTo, meta);
    if (result.success) {
      setState(result.newState);
      setLastMessage(`Minted SBT #${result.tokenId} to ${mintTo}: ${credentialType}`);
    } else {
      setLastMessage(result.message ?? "Mint failed");
    }
  };

  const handleTransfer = () => {
    const tokenId = parseInt(transferTokenId, 10);
    if (isNaN(tokenId)) {
      setLastMessage("Invalid token ID");
      return;
    }
    const result = transferNFT(state, transferFrom, transferTo, tokenId);
    setState(result.newState);
    setLastMessage(result.message);
  };

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>Issue SBT Credential</Text>
          <Group grow>
            <TextInput label="Recipient" value={mintTo} onChange={(e) => setMintTo(e.currentTarget.value)} />
            <TextInput label="Credential Type" value={credentialType} onChange={(e) => setCredentialType(e.currentTarget.value)} />
            <TextInput label="Issuer" value={issuer} onChange={(e) => setIssuer(e.currentTarget.value)} />
          </Group>
          <Button onClick={handleMint} variant="light" color="violet">Issue SBT</Button>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>Try Transfer (should fail)</Text>
          <Group grow>
            <TextInput label="From" value={transferFrom} onChange={(e) => setTransferFrom(e.currentTarget.value)} />
            <TextInput label="To" value={transferTo} onChange={(e) => setTransferTo(e.currentTarget.value)} />
            <TextInput label="Token ID" value={transferTokenId} onChange={(e) => setTransferTokenId(e.currentTarget.value)} />
          </Group>
          <Button onClick={handleTransfer} variant="light" color="red">Attempt Transfer</Button>
        </Stack>
      </Paper>

      {lastMessage && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          variant="light"
          color={lastMessage.includes("Soulbound") ? "red" : undefined}
        >
          {lastMessage}
        </Alert>
      )}

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" fw={600}>{state.name} ({state.symbol})</Text>
            <Group gap="xs">
              <Badge variant="light" color="violet">Soulbound</Badge>
              <Badge variant="light">Total: {totalSupplyNFT(state)}</Badge>
            </Group>
          </Group>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Token ID</Table.Th>
                <Table.Th>Owner</Table.Th>
                <Table.Th>Credential</Table.Th>
                <Table.Th>Issuer</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {Object.entries(state.owners).map(([id, owner]) => {
                const meta = state.metadata[Number(id)];
                const issuerAttr = meta?.attributes?.find((a) => a.trait_type === "Issuer");
                const typeAttr = meta?.attributes?.find((a) => a.trait_type === "Type");
                return (
                  <Table.Tr key={id}>
                    <Table.Td><Badge variant="light" color="violet">#{id}</Badge></Table.Td>
                    <Table.Td><Code>{owner}</Code></Table.Td>
                    <Table.Td>{typeAttr?.value ?? "—"}</Table.Td>
                    <Table.Td>{issuerAttr?.value ?? "—"}</Table.Td>
                  </Table.Tr>
                );
              })}
              {Object.keys(state.owners).length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={4} ta="center">
                    <Text size="sm" c="dimmed">No SBTs issued</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>SBT Holders</Text>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Address</Table.Th>
                <Table.Th ta="right">SBT Count</Table.Th>
                <Table.Th>Token IDs</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {owners.map((addr) => (
                <Table.Tr key={addr}>
                  <Table.Td><Code>{addr}</Code></Table.Td>
                  <Table.Td ta="right">{balanceOfNFT(state, addr)}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {tokensOfOwner(state, addr).map((id) => (
                        <Badge key={id} size="xs" variant="outline" color="violet">#{id}</Badge>
                      ))}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="sm">
          <Text size="sm" fw={600}>About Soulbound Tokens</Text>
          <Text size="sm" c="dimmed">
            Soulbound tokens (SBTs) are non-transferable NFTs proposed by Vitalik Buterin.
            They represent commitments, credentials, and affiliations — things that make up
            a person&apos;s identity in Web3. Unlike regular NFTs, SBTs cannot be sold or
            transferred, making them ideal for degrees, certifications, proof of attendance,
            and reputation scores.
          </Text>
        </Stack>
      </Paper>
    </Stack>
  );
}
