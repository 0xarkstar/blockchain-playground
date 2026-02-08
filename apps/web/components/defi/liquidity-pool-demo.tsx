"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  NumberInput,
  Text,
  Paper,
  Group,
  Table,
  Progress,
  SegmentedControl,
} from "@mantine/core";
import {
  calculateLPTokens,
  calculateRemoveLiquidity,
  calculateSpotPrice,
} from "../../lib/defi/amm";
import { SimplePieChart, EducationPanel } from "../../components/shared";

export function LiquidityPoolDemo() {
  const [reserveA, setReserveA] = useState<number>(10000);
  const [reserveB, setReserveB] = useState<number>(10000);
  const [totalSupply, setTotalSupply] = useState<number>(10000);
  const [mode, setMode] = useState("add");
  const [amountA, setAmountA] = useState<number>(1000);
  const [amountB, setAmountB] = useState<number>(1000);
  const [lpAmount, setLpAmount] = useState<number>(500);

  const addResult = useMemo(() => {
    const lpTokens = calculateLPTokens(
      reserveA,
      reserveB,
      amountA,
      amountB,
      totalSupply,
    );
    const newTotalSupply = totalSupply + lpTokens;
    const poolShare =
      newTotalSupply > 0 ? (lpTokens / newTotalSupply) * 100 : 0;
    return {
      lpTokens,
      poolShare,
      newReserveA: reserveA + amountA,
      newReserveB: reserveB + amountB,
      newTotalSupply,
    };
  }, [reserveA, reserveB, amountA, amountB, totalSupply]);

  const removeResult = useMemo(() => {
    const result = calculateRemoveLiquidity(
      reserveA,
      reserveB,
      lpAmount,
      totalSupply,
    );
    return {
      ...result,
      shareRemoved: totalSupply > 0 ? (lpAmount / totalSupply) * 100 : 0,
      newReserveA: reserveA - result.amountA,
      newReserveB: reserveB - result.amountB,
      newTotalSupply: totalSupply - lpAmount,
    };
  }, [reserveA, reserveB, lpAmount, totalSupply]);

  const spotPrice = useMemo(
    () => calculateSpotPrice(reserveA, reserveB),
    [reserveA, reserveB],
  );

  const reservePieData = useMemo(() => {
    const total = reserveA + reserveB;
    if (total <= 0) return [];
    return [
      { name: "Token A", value: Math.round((reserveA / total) * 100) },
      { name: "Token B", value: Math.round((reserveB / total) * 100) },
    ];
  }, [reserveA, reserveB]);

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Pool Reserve Ratio
          </Text>
          <SimplePieChart
            data={reservePieData}
            nameKey="name"
            valueKey="value"
            height={220}
          />
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Current Pool State
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
          <NumberInput
            label="Total LP Supply"
            value={totalSupply}
            onChange={(v) => setTotalSupply(Number(v) || 0)}
            min={0}
            thousandSeparator=","
          />
          <Text size="xs" c="dimmed">
            Spot Price (A/B): {spotPrice.toFixed(6)}
          </Text>
        </Stack>
      </Paper>

      <SegmentedControl
        value={mode}
        onChange={setMode}
        data={[
          { label: "Add Liquidity", value: "add" },
          { label: "Remove Liquidity", value: "remove" },
        ]}
      />

      {mode === "add" ? (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text size="sm" fw={600}>
              Add Liquidity
            </Text>
            <Group grow>
              <NumberInput
                label="Token A Amount"
                value={amountA}
                onChange={(v) => setAmountA(Number(v) || 0)}
                min={0}
              />
              <NumberInput
                label="Token B Amount"
                value={amountB}
                onChange={(v) => setAmountB(Number(v) || 0)}
                min={0}
              />
            </Group>
            <Table>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>LP Tokens Minted</Table.Td>
                  <Table.Td ta="right">
                    <Text fw={600}>{addResult.lpTokens.toFixed(4)}</Text>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>Your Pool Share</Table.Td>
                  <Table.Td ta="right">
                    {addResult.poolShare.toFixed(2)}%
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>New Reserve A</Table.Td>
                  <Table.Td ta="right">
                    {addResult.newReserveA.toLocaleString()}
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>New Reserve B</Table.Td>
                  <Table.Td ta="right">
                    {addResult.newReserveB.toLocaleString()}
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
            <div>
              <Text size="xs" c="dimmed" mb={4}>
                Pool Share
              </Text>
              <Progress value={addResult.poolShare} color="blue" size="lg" />
            </div>
          </Stack>
        </Paper>
      ) : (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Text size="sm" fw={600}>
              Remove Liquidity
            </Text>
            <NumberInput
              label="LP Tokens to Burn"
              value={lpAmount}
              onChange={(v) => setLpAmount(Number(v) || 0)}
              min={0}
              max={totalSupply}
            />
            <Table>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>Token A Received</Table.Td>
                  <Table.Td ta="right">
                    <Text fw={600}>{removeResult.amountA.toFixed(4)}</Text>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>Token B Received</Table.Td>
                  <Table.Td ta="right">
                    <Text fw={600}>{removeResult.amountB.toFixed(4)}</Text>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>Share Removed</Table.Td>
                  <Table.Td ta="right">
                    {removeResult.shareRemoved.toFixed(2)}%
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
            <div>
              <Text size="xs" c="dimmed" mb={4}>
                Share Being Removed
              </Text>
              <Progress
                value={removeResult.shareRemoved}
                color="orange"
                size="lg"
              />
            </div>
          </Stack>
        </Paper>
      )}

      <EducationPanel
        howItWorks={[
          {
            title: "Adding Liquidity",
            description:
              "Deposit equal-value amounts of both tokens. You receive LP tokens representing your pool share.",
          },
          {
            title: "LP Token Math",
            description:
              "LP tokens minted = min(amountA/reserveA, amountB/reserveB) * totalSupply. This ensures proportional deposits.",
          },
          {
            title: "Removing Liquidity",
            description:
              "Burn LP tokens to withdraw proportional amounts of both tokens from the pool.",
          },
        ]}
        whyItMatters="Liquidity providers earn trading fees proportional to their pool share. Understanding LP mechanics helps you evaluate risk vs reward before providing liquidity."
        tips={[
          "Always deposit tokens at the current pool ratio to avoid arbitrage losses",
          "LP tokens are transferable ERC-20 tokens themselves",
          "Impermanent loss can offset fee earnings — check the IL calculator",
        ]}
      />
    </Stack>
  );
}
