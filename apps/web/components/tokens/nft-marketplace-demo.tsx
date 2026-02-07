"use client";

import { useState, useMemo } from "react";
import {
  Stack, Paper, TextInput, NumberInput, Button, Table, Code, Badge, Group, Text, Alert,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  createMarketplace, listNFT, cancelListing, buyNFT, calculatePriceBreakdown, getActiveListings,
  type MarketplaceState,
} from "../../lib/tokens/marketplace";

export function NFTMarketplaceDemo() {
  const [state, setState] = useState<MarketplaceState>(() => createMarketplace(2.5));
  const [listSeller, setListSeller] = useState("alice");
  const [listTokenId, setListTokenId] = useState(1);
  const [listPrice, setListPrice] = useState(10);
  const [listRoyalty, setListRoyalty] = useState(5);
  const [buyBuyer, setBuyBuyer] = useState("bob");
  const [buyListingId, setBuyListingId] = useState(1);
  const [cancelId, setCancelId] = useState(1);
  const [cancelCaller, setCancelCaller] = useState("alice");
  const [lastMessage, setLastMessage] = useState("");

  const activeListings = useMemo(() => getActiveListings(state), [state]);

  const handleList = () => {
    const result = listNFT(state, listSeller, listTokenId, listPrice, listRoyalty);
    setState(result.newState);
    setLastMessage(result.message);
  };

  const handleBuy = () => {
    const result = buyNFT(state, buyListingId, buyBuyer);
    setState(result.newState);
    setLastMessage(result.message);
  };

  const handleCancel = () => {
    const result = cancelListing(state, cancelId, cancelCaller);
    setState(result.newState);
    setLastMessage(result.message);
  };

  const previewBreakdown = useMemo(
    () => calculatePriceBreakdown(listPrice, listRoyalty, state.platformFeePercent),
    [listPrice, listRoyalty, state.platformFeePercent]
  );

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>List NFT</Text>
          <Group grow>
            <TextInput label="Seller" value={listSeller} onChange={(e) => setListSeller(e.currentTarget.value)} />
            <NumberInput label="Token ID" value={listTokenId} onChange={(v) => setListTokenId(Number(v) || 0)} min={1} />
            <NumberInput label="Price (ETH)" value={listPrice} onChange={(v) => setListPrice(Number(v) || 0)} min={0.01} decimalScale={4} />
            <NumberInput label="Royalty %" value={listRoyalty} onChange={(v) => setListRoyalty(Number(v) || 0)} min={0} max={50} />
          </Group>
          <Button onClick={handleList} variant="light" color="green">List</Button>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>Price Breakdown Preview</Text>
          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Sale Price</Table.Td>
                <Table.Td ta="right"><Code>{previewBreakdown.price.toFixed(4)} ETH</Code></Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Royalty ({previewBreakdown.royaltyPercent}%)</Table.Td>
                <Table.Td ta="right"><Code>{previewBreakdown.royaltyAmount.toFixed(4)} ETH</Code></Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Platform Fee ({previewBreakdown.platformFeePercent}%)</Table.Td>
                <Table.Td ta="right"><Code>{previewBreakdown.platformFee.toFixed(4)} ETH</Code></Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td fw={600}>Seller Receives</Table.Td>
                <Table.Td ta="right"><Code fw={600}>{previewBreakdown.sellerProceeds.toFixed(4)} ETH</Code></Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>Buy / Cancel</Text>
          <Group grow>
            <TextInput label="Buyer" value={buyBuyer} onChange={(e) => setBuyBuyer(e.currentTarget.value)} />
            <NumberInput label="Listing ID" value={buyListingId} onChange={(v) => setBuyListingId(Number(v) || 0)} min={1} />
          </Group>
          <Group>
            <Button onClick={handleBuy} variant="light" color="blue">Buy</Button>
          </Group>
          <Group grow>
            <TextInput label="Caller" value={cancelCaller} onChange={(e) => setCancelCaller(e.currentTarget.value)} />
            <NumberInput label="Listing ID" value={cancelId} onChange={(v) => setCancelId(Number(v) || 0)} min={1} />
          </Group>
          <Button onClick={handleCancel} variant="light" color="red">Cancel</Button>
        </Stack>
      </Paper>

      {lastMessage && (
        <Alert icon={<IconInfoCircle size={16} />} variant="light">
          {lastMessage}
        </Alert>
      )}

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" fw={600}>Active Listings</Text>
            <Badge variant="light">{activeListings.length} active</Badge>
          </Group>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Seller</Table.Th>
                <Table.Th>Token</Table.Th>
                <Table.Th ta="right">Price</Table.Th>
                <Table.Th ta="right">Royalty</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {activeListings.map((l) => (
                <Table.Tr key={l.id}>
                  <Table.Td><Badge variant="light">#{l.id}</Badge></Table.Td>
                  <Table.Td><Code>{l.seller}</Code></Table.Td>
                  <Table.Td>#{l.tokenId}</Table.Td>
                  <Table.Td ta="right"><Code>{l.price} ETH</Code></Table.Td>
                  <Table.Td ta="right">{l.royaltyPercent}%</Table.Td>
                </Table.Tr>
              ))}
              {activeListings.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={5} ta="center">
                    <Text size="sm" c="dimmed">No active listings</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      {state.sales.length > 0 && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text size="sm" fw={600}>Sales History</Text>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Listing</Table.Th>
                  <Table.Th>Buyer</Table.Th>
                  <Table.Th ta="right">Price</Table.Th>
                  <Table.Th ta="right">Seller Got</Table.Th>
                  <Table.Th ta="right">Royalty</Table.Th>
                  <Table.Th ta="right">Fee</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {state.sales.map((s) => (
                  <Table.Tr key={s.listingId}>
                    <Table.Td>#{s.listingId}</Table.Td>
                    <Table.Td><Code>{s.buyer}</Code></Table.Td>
                    <Table.Td ta="right"><Code>{s.price.toFixed(4)}</Code></Table.Td>
                    <Table.Td ta="right"><Code>{s.sellerProceeds.toFixed(4)}</Code></Table.Td>
                    <Table.Td ta="right"><Code>{s.royaltyAmount.toFixed(4)}</Code></Table.Td>
                    <Table.Td ta="right"><Code>{s.platformFee.toFixed(4)}</Code></Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
