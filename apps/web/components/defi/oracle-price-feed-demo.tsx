"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Stack,
  NumberInput,
  Text,
  Paper,
  Group,
  Badge,
  Table,
  Button,
  Alert,
} from "@mantine/core";
import { IconPlus, IconTrash, IconInfoCircle } from "@tabler/icons-react";
import {
  calculateTWAP,
  detectPriceDeviation,
  isHeartbeatStale,
  type PriceSnapshot,
} from "../../lib/defi/oracle";

export function OraclePriceFeedDemo() {
  const [snapshots, setSnapshots] = useState<readonly PriceSnapshot[]>([
    { price: 2000, timestamp: 0 },
    { price: 2010, timestamp: 60 },
    { price: 2005, timestamp: 120 },
    { price: 2020, timestamp: 180 },
    { price: 2015, timestamp: 240 },
  ]);
  const [newPrice, setNewPrice] = useState<number>(2025);
  const [deviationThreshold, setDeviationThreshold] = useState<number>(5);
  const [heartbeatInterval, setHeartbeatInterval] = useState<number>(300);

  const addSnapshot = useCallback(() => {
    const lastTimestamp =
      snapshots.length > 0 ? snapshots[snapshots.length - 1].timestamp : 0;
    setSnapshots([
      ...snapshots,
      { price: newPrice, timestamp: lastTimestamp + 60 },
    ]);
  }, [snapshots, newPrice]);

  const removeSnapshot = useCallback(
    (index: number) => {
      setSnapshots(snapshots.filter((_, i) => i !== index));
    },
    [snapshots],
  );

  const analysis = useMemo(() => {
    const twap = calculateTWAP(snapshots);
    const currentPrice =
      snapshots.length > 0 ? snapshots[snapshots.length - 1].price : 0;
    const lastUpdate =
      snapshots.length > 0 ? snapshots[snapshots.length - 1].timestamp : 0;
    const totalTime =
      snapshots.length > 1
        ? snapshots[snapshots.length - 1].timestamp - snapshots[0].timestamp
        : 0;

    const deviation = detectPriceDeviation(
      currentPrice,
      twap,
      deviationThreshold / 100,
    );
    const stale = isHeartbeatStale(
      lastUpdate,
      heartbeatInterval,
      totalTime + 120,
    );

    return { twap, currentPrice, deviation, stale, lastUpdate, totalTime };
  }, [snapshots, deviationThreshold, heartbeatInterval]);

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Price History
          </Text>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>#</Table.Th>
                <Table.Th>Price</Table.Th>
                <Table.Th>Time (s)</Table.Th>
                <Table.Th w={60} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {snapshots.map((s, i) => (
                <Table.Tr key={s.timestamp}>
                  <Table.Td>{i + 1}</Table.Td>
                  <Table.Td>${s.price.toFixed(2)}</Table.Td>
                  <Table.Td>{s.timestamp}s</Table.Td>
                  <Table.Td>
                    <Button
                      variant="subtle"
                      color="red"
                      size="xs"
                      onClick={() => removeSnapshot(i)}
                      p={4}
                    >
                      <IconTrash size={14} />
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          <Group>
            <NumberInput
              value={newPrice}
              onChange={(v) => setNewPrice(Number(v) || 0)}
              min={0}
              prefix="$"
              decimalScale={2}
              size="xs"
              style={{ flex: 1 }}
            />
            <Button
              leftSection={<IconPlus size={14} />}
              size="xs"
              onClick={addSnapshot}
            >
              Add
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Configuration
          </Text>
          <Group grow>
            <NumberInput
              label="Deviation Threshold (%)"
              value={deviationThreshold}
              onChange={(v) => setDeviationThreshold(Number(v) || 0)}
              min={0}
              max={100}
              suffix="%"
              decimalScale={1}
            />
            <NumberInput
              label="Heartbeat Interval (s)"
              value={heartbeatInterval}
              onChange={(v) => setHeartbeatInterval(Number(v) || 0)}
              min={0}
              suffix="s"
            />
          </Group>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Analysis
          </Text>
          <Group gap="sm">
            <Badge
              variant="light"
              color={analysis.deviation.deviated ? "red" : "green"}
            >
              {analysis.deviation.deviated ? "Price Deviated" : "Price Normal"}
            </Badge>
            <Badge variant="light" color={analysis.stale ? "red" : "green"}>
              {analysis.stale ? "Heartbeat Stale" : "Heartbeat Fresh"}
            </Badge>
          </Group>
          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Current Price</Table.Td>
                <Table.Td ta="right">
                  ${analysis.currentPrice.toFixed(2)}
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>TWAP</Table.Td>
                <Table.Td ta="right">
                  <Text fw={600}>${analysis.twap.toFixed(2)}</Text>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Deviation from TWAP</Table.Td>
                <Table.Td ta="right">
                  {(analysis.deviation.deviation * 100).toFixed(3)}%
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>TWAP Window</Table.Td>
                <Table.Td ta="right">{analysis.totalTime}s</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>

          {analysis.deviation.deviated && (
            <Alert
              icon={<IconInfoCircle size={16} />}
              color="red"
              title="Price Deviation Detected"
            >
              Current price deviates{" "}
              {(analysis.deviation.deviation * 100).toFixed(3)}% from TWAP,
              exceeding the {deviationThreshold}% threshold. This may indicate
              price manipulation or extreme volatility.
            </Alert>
          )}

          {analysis.stale && (
            <Alert
              icon={<IconInfoCircle size={16} />}
              color="orange"
              title="Stale Heartbeat"
            >
              The oracle has not updated within the {heartbeatInterval}s
              heartbeat interval. Price data may be unreliable.
            </Alert>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
