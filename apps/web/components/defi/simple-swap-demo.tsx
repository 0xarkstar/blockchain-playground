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
import {
  SimpleLineChart,
  DemoLayout,
  EducationPanel,
} from "../../components/shared";

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

  const k = reserveA * reserveB;

  const curveData = useMemo(() => {
    if (k <= 0) return [];
    const points: Record<string, unknown>[] = [];
    const maxX = Math.max(reserveA * 3, 1000);
    const step = Math.max(maxX / 50, 1);
    for (let x = step; x <= maxX; x += step) {
      points.push({ x: Math.round(x), y: Math.round(k / x) });
    }
    return points;
  }, [k, reserveA]);

  const rIn = direction === "AtoB" ? reserveA : reserveB;
  const newRIn = rIn + amountIn;
  const newROut = k > 0 ? k / newRIn : 0;

  const swapPoints = useMemo(() => {
    const pts: Record<string, unknown>[] = [];
    if (direction === "AtoB") {
      pts.push({
        x: Math.round(reserveA),
        y: Math.round(reserveB),
        label: "Before",
      });
      pts.push({
        x: Math.round(newRIn),
        y: Math.round(newROut),
        label: "After",
      });
    } else {
      pts.push({
        x: Math.round(reserveA),
        y: Math.round(reserveB),
        label: "Before",
      });
      pts.push({
        x: Math.round(newROut),
        y: Math.round(newRIn),
        label: "After",
      });
    }
    return pts;
  }, [reserveA, reserveB, newRIn, newROut, direction]);

  const inputPanel = (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Pool Reserves
          </Text>
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
            Constant Product (k): {k.toLocaleString()}
          </Text>
        </Stack>
      </Paper>
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Swap
          </Text>
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
    </Stack>
  );

  const resultPanel = (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Constant Product Curve (x * y = k)
          </Text>
          <SimpleLineChart
            data={[...curveData, ...swapPoints]}
            xKey="x"
            yKeys={["y"]}
            height={250}
          />
          <Text size="xs" c="dimmed" ta="center">
            Token A (x-axis) vs Token B (y-axis). Swap moves along the curve.
          </Text>
        </Stack>
      </Paper>
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Result
          </Text>
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
                <Table.Td ta="right">
                  {result.effectivePrice.toFixed(6)}
                </Table.Td>
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
            <Alert
              icon={<IconInfoCircle size={16} />}
              color="red"
              title="High Price Impact"
            >
              This trade has a price impact of {result.priceImpact.toFixed(2)}%.
              Consider reducing your trade size or using a pool with deeper
              liquidity.
            </Alert>
          )}
        </Stack>
      </Paper>
    </Stack>
  );

  return (
    <Stack gap="lg">
      <DemoLayout
        inputPanel={inputPanel}
        resultPanel={resultPanel}
        learnContent={
          <EducationPanel
            howItWorks={[
              {
                title: "Constant Product Formula",
                description:
                  "AMMs use x * y = k, where x and y are token reserves and k is a constant. Every swap must maintain this invariant.",
              },
              {
                title: "Price Determination",
                description:
                  "The spot price is the ratio of reserves (y/x). Larger trades move further along the curve, causing more price impact.",
              },
              {
                title: "Fees",
                description:
                  "A small fee is deducted from each swap. This fee rewards liquidity providers and slightly increases k over time.",
              },
            ]}
            whyItMatters="AMMs like Uniswap replaced traditional order books, enabling permissionless, 24/7 token trading without intermediaries. Understanding the constant product formula is fundamental to DeFi."
            tips={[
              "Larger trades relative to pool size cause higher price impact",
              "Deep liquidity pools offer better prices for large trades",
              "Fees typically range from 0.01% to 1% depending on the pool",
            ]}
          />
        }
      />
    </Stack>
  );
}
