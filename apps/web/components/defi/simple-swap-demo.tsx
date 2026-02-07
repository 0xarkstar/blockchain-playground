"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  NumberInput,
  Text,
  Paper,
  Group,
  Badge,
  Table,
  SegmentedControl,
  Alert,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { calculateSwapOutput, calculateSpotPrice } from "../../lib/defi/amm";

export function SimpleSwapDemo() {
  const [reserveA, setReserveA] = useState<number>(10000);
  const [reserveB, setReserveB] = useState<number>(10000);
  const [amountIn, setAmountIn] = useState<number>(100);
  const [feeRate, setFeeRate] = useState<number>(0.3);
  const [direction, setDirection] = useState("AtoB");

  const result = useMemo(() => {
    const rIn = direction === "AtoB" ? reserveA : reserveB;
    const rOut = direction === "AtoB" ? reserveB : reserveA;
    return calculateSwapOutput(rIn, rOut, amountIn, feeRate / 100);
  }, [reserveA, reserveB, amountIn, feeRate, direction]);

  const spotPrice = useMemo(() => {
    return direction === "AtoB"
      ? calculateSpotPrice(reserveA, reserveB)
      : calculateSpotPrice(reserveB, reserveA);
  }, [reserveA, reserveB, direction]);

  const highImpact = result.priceImpact > 5;

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>Pool Reserves</Text>
          <Group grow>
            <NumberInput
              label="Token A Reserve"
              value={reserveA}
              onChange={(v) => setReserveA(Number(v) || 0)}
              min={0}
              thousandSeparator=","
            />
            <NumberInput
              label="Token B Reserve"
              value={reserveB}
              onChange={(v) => setReserveB(Number(v) || 0)}
              min={0}
              thousandSeparator=","
            />
          </Group>
          <Text size="xs" c="dimmed">
            Constant Product (k): {(reserveA * reserveB).toLocaleString()}
          </Text>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>Swap</Text>
          <SegmentedControl
            value={direction}
            onChange={setDirection}
            data={[
              { label: "A → B", value: "AtoB" },
              { label: "B → A", value: "BtoA" },
            ]}
          />
          <Group grow>
            <NumberInput
              label="Amount In"
              value={amountIn}
              onChange={(v) => setAmountIn(Number(v) || 0)}
              min={0}
              thousandSeparator=","
            />
            <NumberInput
              label="Fee Rate (%)"
              value={feeRate}
              onChange={(v) => setFeeRate(Number(v) || 0)}
              min={0}
              max={99}
              decimalScale={2}
              step={0.1}
            />
          </Group>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>Result</Text>
          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Spot Price</Table.Td>
                <Table.Td ta="right">{spotPrice.toFixed(6)}</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Amount Out</Table.Td>
                <Table.Td ta="right">
                  <Text fw={600}>{result.amountOut.toFixed(6)}</Text>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Effective Price</Table.Td>
                <Table.Td ta="right">{result.effectivePrice.toFixed(6)}</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Price Impact</Table.Td>
                <Table.Td ta="right">
                  <Badge color={highImpact ? "red" : "green"} variant="light">
                    {result.priceImpact.toFixed(2)}%
                  </Badge>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Fee Paid</Table.Td>
                <Table.Td ta="right">{result.fee.toFixed(6)}</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>

          {highImpact && (
            <Alert icon={<IconInfoCircle size={16} />} color="red" title="High Price Impact">
              This trade has a price impact of {result.priceImpact.toFixed(2)}%.
              Consider reducing your trade size or using a pool with deeper liquidity.
            </Alert>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
