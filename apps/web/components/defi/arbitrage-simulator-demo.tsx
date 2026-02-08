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
  SimpleGrid,
} from "@mantine/core";
import { calculateArbitrageProfit } from "../../lib/defi/flash-loan";
import { SimpleBarChart, EducationPanel } from "../../components/shared";

export function ArbitrageSimulatorDemo() {
  const [priceA, setPriceA] = useState<number>(2000);
  const [priceB, setPriceB] = useState<number>(2050);
  const [tradeAmount, setTradeAmount] = useState<number>(10000);
  const [gasCost, setGasCost] = useState<number>(15);

  const result = useMemo(() => {
    const profitBeforeGas = calculateArbitrageProfit(
      priceA,
      priceB,
      tradeAmount,
      0,
    );
    const profitAfterGas = calculateArbitrageProfit(
      priceA,
      priceB,
      tradeAmount,
      gasCost,
    );
    const spreadPercent =
      priceA > 0 && priceB > 0
        ? (Math.abs(priceA - priceB) / Math.min(priceA, priceB)) * 100
        : 0;

    return {
      profitBeforeGas,
      profitAfterGas,
      profitable: profitAfterGas > 0,
      spreadPercent,
      buyPool: priceA <= priceB ? "A" : "B",
      sellPool: priceA <= priceB ? "B" : "A",
    };
  }, [priceA, priceB, tradeAmount, gasCost]);

  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Text size="sm" fw={600}>
                Pool A
              </Text>
              {result.buyPool === "A" && (
                <Badge color="green" variant="light" size="sm">
                  Buy Here
                </Badge>
              )}
              {result.sellPool === "A" && (
                <Badge color="blue" variant="light" size="sm">
                  Sell Here
                </Badge>
              )}
            </Group>
            <NumberInput
              label="Token Price (USD)"
              value={priceA}
              onChange={(v) => setPriceA(Number(v) || 0)}
              min={0}
              prefix="$"
              decimalScale={2}
              thousandSeparator=","
            />
          </Stack>
        </Paper>

        <Paper p="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Text size="sm" fw={600}>
                Pool B
              </Text>
              {result.buyPool === "B" && (
                <Badge color="green" variant="light" size="sm">
                  Buy Here
                </Badge>
              )}
              {result.sellPool === "B" && (
                <Badge color="blue" variant="light" size="sm">
                  Sell Here
                </Badge>
              )}
            </Group>
            <NumberInput
              label="Token Price (USD)"
              value={priceB}
              onChange={(v) => setPriceB(Number(v) || 0)}
              min={0}
              prefix="$"
              decimalScale={2}
              thousandSeparator=","
            />
          </Stack>
        </Paper>
      </SimpleGrid>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Trade Parameters
          </Text>
          <Group grow>
            <NumberInput
              label="Trade Amount (USD)"
              value={tradeAmount}
              onChange={(v) => setTradeAmount(Number(v) || 0)}
              min={0}
              prefix="$"
              thousandSeparator=","
            />
            <NumberInput
              label="Gas Cost (USD)"
              value={gasCost}
              onChange={(v) => setGasCost(Number(v) || 0)}
              min={0}
              prefix="$"
              decimalScale={2}
            />
          </Group>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" fw={600}>
              Result
            </Text>
            <Badge
              size="lg"
              variant="light"
              color={result.profitable ? "green" : "red"}
            >
              {result.profitable ? "Profitable" : "Unprofitable"}
            </Badge>
          </Group>
          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Price Spread</Table.Td>
                <Table.Td ta="right">
                  {result.spreadPercent.toFixed(3)}%
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Strategy</Table.Td>
                <Table.Td ta="right">
                  Buy on Pool {result.buyPool}, Sell on Pool {result.sellPool}
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Profit (before gas)</Table.Td>
                <Table.Td ta="right">
                  ${result.profitBeforeGas.toFixed(2)}
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Gas Cost</Table.Td>
                <Table.Td ta="right">-${gasCost.toFixed(2)}</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Net Profit</Table.Td>
                <Table.Td ta="right">
                  <Text fw={600} c={result.profitable ? "green" : "red"}>
                    ${result.profitAfterGas.toFixed(2)}
                  </Text>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Price Comparison
          </Text>
          <SimpleBarChart
            data={[
              { pool: "Pool A", price: priceA },
              { pool: "Pool B", price: priceB },
            ]}
            xKey="pool"
            yKeys={["price"]}
            grouped
            height={200}
          />
          <Text size="xs" c="dimmed" ta="center">
            Price spread: {result.spreadPercent.toFixed(3)}% —{" "}
            {result.profitable
              ? "Profitable after gas"
              : "Unprofitable after gas"}
          </Text>
        </Stack>
      </Paper>

      <EducationPanel
        howItWorks={[
          {
            title: "Spot the Spread",
            description:
              "Find the same token priced differently on two exchanges. Buy low on one, sell high on the other.",
          },
          {
            title: "Calculate Profitability",
            description:
              "Profit = (priceDiff / buyPrice) * tradeAmount - gasCost. Must exceed gas to be worthwhile.",
          },
          {
            title: "Execute Atomically",
            description:
              "Use flash loans to execute both legs in a single transaction, eliminating capital requirements and execution risk.",
          },
        ]}
        whyItMatters="Arbitrageurs keep prices consistent across DeFi protocols. They're essential for market efficiency — when prices diverge, arbs bring them back in line."
        tips={[
          "MEV (Maximal Extractable Value) bots compete for the same opportunities",
          "Gas costs on Ethereum L1 often exceed small arbitrage profits",
          "L2s and alternative chains offer lower gas for smaller arb opportunities",
        ]}
      />
    </Stack>
  );
}
