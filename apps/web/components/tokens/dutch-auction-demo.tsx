"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  Paper,
  TextInput,
  NumberInput,
  Button,
  Table,
  Code,
  Badge,
  Group,
  Text,
  Alert,
  Progress,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  createDutchAuction,
  getAuctionPriceInfo,
  settleDutchAuction,
  generatePriceCurve,
  type DutchAuctionState,
} from "../../lib/tokens/auction";

export function DutchAuctionDemo() {
  const [seller, setSeller] = useState("alice");
  const [tokenId, setTokenId] = useState(1);
  const [startPrice, setStartPrice] = useState(100);
  const [endPrice, setEndPrice] = useState(10);
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(100);
  const [currentTime, setCurrentTime] = useState(50);
  const [buyer, setBuyer] = useState("bob");
  const [lastMessage, setLastMessage] = useState("");

  const [state, setState] = useState<DutchAuctionState>(() =>
    createDutchAuction({
      seller: "alice",
      tokenId: 1,
      startPrice: 100,
      endPrice: 10,
      startTime: 0,
      duration: 100,
    }),
  );

  const priceInfo = useMemo(
    () => getAuctionPriceInfo(state.config, currentTime),
    [state.config, currentTime],
  );

  const curve = useMemo(
    () => generatePriceCurve(state.config, 10),
    [state.config],
  );

  const handleCreate = () => {
    setState(
      createDutchAuction({
        seller,
        tokenId,
        startPrice,
        endPrice,
        startTime,
        duration,
      }),
    );
    setLastMessage("Auction created");
  };

  const handleSettle = () => {
    const result = settleDutchAuction(state, buyer, currentTime);
    setState(result.newState);
    setLastMessage(result.message);
  };

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Auction Configuration
          </Text>
          <Group grow>
            <TextInput
              label="Seller"
              value={seller}
              onChange={(e) => setSeller(e.currentTarget.value)}
            />
            <NumberInput
              label="Token ID"
              value={tokenId}
              onChange={(v) => setTokenId(Number(v) || 0)}
              min={1}
            />
          </Group>
          <Group grow>
            <NumberInput
              label="Start Price"
              value={startPrice}
              onChange={(v) => setStartPrice(Number(v) || 0)}
              min={1}
              decimalScale={4}
            />
            <NumberInput
              label="End Price"
              value={endPrice}
              onChange={(v) => setEndPrice(Number(v) || 0)}
              min={0}
              decimalScale={4}
            />
          </Group>
          <Group grow>
            <NumberInput
              label="Start Time"
              value={startTime}
              onChange={(v) => setStartTime(Number(v) || 0)}
            />
            <NumberInput
              label="Duration"
              value={duration}
              onChange={(v) => setDuration(Number(v) || 0)}
              min={1}
            />
          </Group>
          <Button onClick={handleCreate} variant="light">
            Create Auction
          </Button>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Bid
          </Text>
          <Group grow>
            <NumberInput
              label="Current Time"
              value={currentTime}
              onChange={(v) => setCurrentTime(Number(v) || 0)}
            />
            <TextInput
              label="Buyer"
              value={buyer}
              onChange={(e) => setBuyer(e.currentTarget.value)}
            />
          </Group>
          <Button
            onClick={handleSettle}
            variant="light"
            color="green"
            disabled={state.settled}
          >
            {state.settled ? "Auction Settled" : "Buy Now"}
          </Button>
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
            <Text size="sm" fw={600}>
              Current Status
            </Text>
            <Badge
              variant="light"
              color={
                state.settled ? "green" : priceInfo.isActive ? "blue" : "red"
              }
            >
              {state.settled
                ? "Settled"
                : priceInfo.isActive
                  ? "Active"
                  : priceInfo.hasEnded
                    ? "Ended"
                    : "Not Started"}
            </Badge>
          </Group>
          <Progress value={priceInfo.percentDecayed} color="orange" size="lg" />
          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Current Price</Table.Td>
                <Table.Td ta="right">
                  <Code>{priceInfo.currentPrice.toFixed(4)} ETH</Code>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Price Decay</Table.Td>
                <Table.Td ta="right">
                  <Code>{priceInfo.percentDecayed.toFixed(1)}%</Code>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Time Elapsed</Table.Td>
                <Table.Td ta="right">
                  <Code>{priceInfo.timeElapsed}</Code>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Time Remaining</Table.Td>
                <Table.Td ta="right">
                  <Code>{priceInfo.timeRemaining}</Code>
                </Table.Td>
              </Table.Tr>
              {state.settled && (
                <>
                  <Table.Tr>
                    <Table.Td>Winner</Table.Td>
                    <Table.Td ta="right">
                      <Code>{state.winner}</Code>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>Settled Price</Table.Td>
                    <Table.Td ta="right">
                      <Code>{state.settledPrice?.toFixed(4)} ETH</Code>
                    </Table.Td>
                  </Table.Tr>
                </>
              )}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Price Curve
          </Text>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Time</Table.Th>
                <Table.Th ta="right">Price (ETH)</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {curve.map((point, i) => (
                <Table.Tr key={i}>
                  <Table.Td>{point.time.toFixed(0)}</Table.Td>
                  <Table.Td ta="right">
                    <Code>{point.price.toFixed(4)}</Code>
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
