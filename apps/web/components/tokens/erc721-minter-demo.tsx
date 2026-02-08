"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  Paper,
  TextInput,
  Button,
  Table,
  Code,
  Badge,
  Group,
  Text,
  Alert,
  SimpleGrid,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  createERC721,
  mintNFT,
  transferNFT,
  balanceOfNFT,
  tokensOfOwner,
  totalSupplyNFT,
  type ERC721State,
  type NFTMetadata,
} from "../../lib/tokens/erc721";

export function ERC721MinterDemo() {
  const [state, setState] = useState<ERC721State>(() =>
    createERC721("CryptoArt", "CART"),
  );
  const [mintTo, setMintTo] = useState("alice");
  const [nftName, setNftName] = useState("Art #1");
  const [nftDesc, setNftDesc] = useState("A digital artwork");
  const [nftImage, setNftImage] = useState("ipfs://QmExample");
  const [transferFromAddr, setTransferFromAddr] = useState("alice");
  const [transferToAddr, setTransferToAddr] = useState("bob");
  const [transferTokenId, setTransferTokenId] = useState("1");
  const [lastMessage, setLastMessage] = useState("");

  const owners = useMemo(() => {
    const addrs = new Set<string>();
    for (const owner of Object.values(state.owners)) {
      addrs.add(owner);
    }
    return Array.from(addrs);
  }, [state.owners]);

  const handleMint = () => {
    const meta: NFTMetadata = {
      name: nftName,
      description: nftDesc,
      image: nftImage,
      attributes: [],
    };
    const result = mintNFT(state, mintTo, meta);
    if (result.success) {
      setState(result.newState);
      setLastMessage(`Minted token #${result.tokenId} to ${mintTo}`);
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
    const result = transferNFT(
      state,
      transferFromAddr,
      transferToAddr,
      tokenId,
    );
    setState(result.newState);
    setLastMessage(result.message);
  };

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Mint NFT
          </Text>
          <Group grow>
            <TextInput
              label="To"
              value={mintTo}
              onChange={(e) => setMintTo(e.currentTarget.value)}
            />
            <TextInput
              label="Name"
              value={nftName}
              onChange={(e) => setNftName(e.currentTarget.value)}
            />
          </Group>
          <Group grow>
            <TextInput
              label="Description"
              value={nftDesc}
              onChange={(e) => setNftDesc(e.currentTarget.value)}
            />
            <TextInput
              label="Image URI"
              value={nftImage}
              onChange={(e) => setNftImage(e.currentTarget.value)}
            />
          </Group>
          <Button onClick={handleMint} variant="light" color="green">
            Mint
          </Button>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Transfer NFT
          </Text>
          <Group grow>
            <TextInput
              label="From"
              value={transferFromAddr}
              onChange={(e) => setTransferFromAddr(e.currentTarget.value)}
            />
            <TextInput
              label="To"
              value={transferToAddr}
              onChange={(e) => setTransferToAddr(e.currentTarget.value)}
            />
            <TextInput
              label="Token ID"
              value={transferTokenId}
              onChange={(e) => setTransferTokenId(e.currentTarget.value)}
            />
          </Group>
          <Button onClick={handleTransfer} variant="light" color="blue">
            Transfer
          </Button>
        </Stack>
      </Paper>

      {lastMessage && (
        <Alert icon={<IconInfoCircle size={16} />} variant="light">
          {lastMessage}
        </Alert>
      )}

      {Object.keys(state.owners).length > 0 && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text size="sm" fw={600}>
              NFT Gallery
            </Text>
            <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
              {Object.entries(state.owners).map(([id, owner]) => {
                const meta = state.metadata[Number(id)];
                const hue = (Number(id) * 67) % 360;
                return (
                  <Paper
                    key={id}
                    p="sm"
                    withBorder
                    style={{
                      background: `linear-gradient(135deg, hsl(${hue}, 60%, 85%), hsl(${(hue + 40) % 360}, 50%, 75%))`,
                    }}
                  >
                    <Stack gap={4} align="center">
                      <Badge variant="filled" size="lg">
                        #{id}
                      </Badge>
                      <Text size="xs" fw={600} ta="center">
                        {meta?.name ?? `Token #${id}`}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {owner}
                      </Text>
                    </Stack>
                  </Paper>
                );
              })}
            </SimpleGrid>
          </Stack>
        </Paper>
      )}

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" fw={600}>
              Collection: {state.name} ({state.symbol})
            </Text>
            <Badge variant="light">Total: {totalSupplyNFT(state)}</Badge>
          </Group>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Token ID</Table.Th>
                <Table.Th>Owner</Table.Th>
                <Table.Th>Name</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {Object.entries(state.owners).map(([id, owner]) => (
                <Table.Tr key={id}>
                  <Table.Td>
                    <Badge variant="light">#{id}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Code>{owner}</Code>
                  </Table.Td>
                  <Table.Td>{state.metadata[Number(id)]?.name ?? "—"}</Table.Td>
                </Table.Tr>
              ))}
              {Object.keys(state.owners).length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={3} ta="center">
                    <Text size="sm" c="dimmed">
                      No tokens minted
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Balances by Owner
          </Text>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Owner</Table.Th>
                <Table.Th ta="right">Count</Table.Th>
                <Table.Th>Token IDs</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {owners.map((addr) => (
                <Table.Tr key={addr}>
                  <Table.Td>
                    <Code>{addr}</Code>
                  </Table.Td>
                  <Table.Td ta="right">{balanceOfNFT(state, addr)}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {tokensOfOwner(state, addr).map((id) => (
                        <Badge key={id} size="xs" variant="outline">
                          #{id}
                        </Badge>
                      ))}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>
    </Stack>
  );
}
