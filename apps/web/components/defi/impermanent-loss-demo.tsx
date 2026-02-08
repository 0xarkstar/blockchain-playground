"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  NumberInput,
  Slider,
  Text,
  Paper,
  Table,
} from "@mantine/core";
import { calculateImpermanentLoss } from "../../lib/defi/amm";
import { SimpleAreaChart, EducationPanel } from "../../components/shared";

export function ImpermanentLossDemo() {
  const [totalValue, setTotalValue] = useState<number>(10000);
  const [priceRatio, setPriceRatio] = useState<number>(1);

  const result = useMemo(() => {
    // 50/50 pool: each side gets half the initial value
    const halfValue = totalValue / 2;
    const il = calculateImpermanentLoss(priceRatio);

    // HODL value: token A changes by priceRatio, token B stays
    const hodlValue = halfValue * priceRatio + halfValue;

    // LP value = hodlValue * (1 + IL) for a 50/50 pool
    const lpValue = hodlValue * (1 + il);

    const difference = lpValue - hodlValue;
    const ilPercent = il * 100;

    return {
      hodlValue,
      lpValue,
      difference,
      ilPercent,
      halfValue,
    };
  }, [totalValue, priceRatio]);

  const ilCurveData = useMemo(() => {
    const points: Record<string, unknown>[] = [];
    const ratios = [0.1, 0.2, 0.3, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5, 7, 10];
    for (const r of ratios) {
      const il = calculateImpermanentLoss(r);
      points.push({ ratio: `${r}x`, ilPercent: Math.round(il * -10000) / 100 });
    }
    return points;
  }, []);

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Impermanent Loss Curve
          </Text>
          <SimpleAreaChart
            data={ilCurveData}
            xKey="ratio"
            yKeys={["ilPercent"]}
            colors={["#fa5252"]}
            height={250}
          />
          <Text size="xs" c="dimmed" ta="center">
            IL % (y-axis) vs Price Ratio Change (x-axis). Loss increases with
            divergence from 1x.
          </Text>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Initial Position (50/50 Pool)
          </Text>
          <NumberInput
            label="Total Position Value (USD)"
            description="Automatically split equally between Token A and Token B"
            value={totalValue}
            onChange={(v) => setTotalValue(Number(v) || 0)}
            min={0}
            thousandSeparator=","
            prefix="$"
          />
          <Text size="xs" c="dimmed">
            Token A: ${result.halfValue.toLocaleString()} | Token B: $
            {result.halfValue.toLocaleString()}
          </Text>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Price Ratio Change: {priceRatio.toFixed(2)}x
          </Text>
          <Text size="xs" c="dimmed">
            How much Token A price has changed relative to Token B
          </Text>
          <Slider
            value={priceRatio}
            onChange={setPriceRatio}
            min={0.1}
            max={10}
            step={0.1}
            marks={[
              { value: 0.1, label: "0.1x" },
              { value: 1, label: "1x" },
              { value: 2, label: "2x" },
              { value: 5, label: "5x" },
              { value: 10, label: "10x" },
            ]}
            label={(v) => `${v.toFixed(1)}x`}
          />
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Comparison
          </Text>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Metric</Table.Th>
                <Table.Th ta="right">Value</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Initial Value</Table.Td>
                <Table.Td ta="right">
                  $
                  {totalValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>HODL Value</Table.Td>
                <Table.Td ta="right">
                  $
                  {result.hodlValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>LP Value</Table.Td>
                <Table.Td ta="right">
                  $
                  {result.lpValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Difference (LP - HODL)</Table.Td>
                <Table.Td ta="right">
                  <Text c={result.difference < 0 ? "red" : "green"} fw={600}>
                    $
                    {result.difference.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Impermanent Loss</Table.Td>
                <Table.Td ta="right">
                  <Text c="red" fw={600}>
                    {result.ilPercent.toFixed(2)}%
                  </Text>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      <EducationPanel
        howItWorks={[
          {
            title: "IL Formula",
            description:
              "IL = 2*sqrt(r)/(1+r) - 1, where r is the price ratio. At r=1 (no change), IL=0.",
          },
          {
            title: "Why It Happens",
            description:
              "AMM pools rebalance automatically. When prices diverge, arbitrageurs extract value, leaving LPs with less than if they had held.",
          },
          {
            title: "When It Disappears",
            description:
              "If prices return to original ratio, IL goes to zero. Hence 'impermanent' — it only locks in when you withdraw.",
          },
        ]}
        whyItMatters="Impermanent loss is the hidden cost of providing liquidity. At 2x price change, IL is ~5.7%. At 5x, it's ~25.5%. Trading fees must exceed IL for LPs to profit."
        tips={[
          "Stablecoin pairs (USDC/USDT) have minimal IL due to low price divergence",
          "High-volume pools generate more fees to offset IL",
          "Concentrated liquidity (Uniswap v3) amplifies both fees AND IL",
        ]}
      />
    </Stack>
  );
}
