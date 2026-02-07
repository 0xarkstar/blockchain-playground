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
  Progress,
} from "@mantine/core";
import {
  calculateHealthFactor,
  calculateMaxBorrow,
  calculateLiquidationPrice,
  calculateUtilizationRate,
} from "../../lib/defi/lending";

function healthColor(hf: number): string {
  if (hf >= 2) return "green";
  if (hf >= 1.5) return "lime";
  if (hf >= 1.1) return "yellow";
  if (hf >= 1) return "orange";
  return "red";
}

function healthLabel(hf: number): string {
  if (!isFinite(hf)) return "Safe (No Debt)";
  if (hf >= 2) return "Healthy";
  if (hf >= 1.5) return "Moderate";
  if (hf >= 1.1) return "At Risk";
  if (hf >= 1) return "Danger";
  return "Liquidatable";
}

export function LendingProtocolDemo() {
  const [collateralAmount, setCollateralAmount] = useState<number>(10);
  const [collateralPrice, setCollateralPrice] = useState<number>(2000);
  const [borrowAmount, setBorrowAmount] = useState<number>(10000);
  const [liquidationThreshold, setLiquidationThreshold] = useState<number>(0.8);

  const result = useMemo(() => {
    const collateralValue = collateralAmount * collateralPrice;
    const healthFactor = calculateHealthFactor(
      collateralValue,
      borrowAmount,
      liquidationThreshold,
    );
    const maxBorrow = calculateMaxBorrow(collateralValue, liquidationThreshold);
    const liqPrice = calculateLiquidationPrice(
      borrowAmount,
      collateralAmount,
      liquidationThreshold,
    );
    const utilization = calculateUtilizationRate(borrowAmount, collateralValue);
    const collateralRatio =
      borrowAmount > 0 ? (collateralValue / borrowAmount) * 100 : Infinity;

    return {
      collateralValue,
      healthFactor,
      maxBorrow,
      liqPrice,
      utilization,
      collateralRatio,
    };
  }, [collateralAmount, collateralPrice, borrowAmount, liquidationThreshold]);

  const hfDisplay = isFinite(result.healthFactor)
    ? result.healthFactor.toFixed(2)
    : "∞";

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Collateral
          </Text>
          <Group grow>
            <NumberInput
              label="Amount (tokens)"
              value={collateralAmount}
              onChange={(v) => setCollateralAmount(Number(v) || 0)}
              min={0}
              decimalScale={4}
            />
            <NumberInput
              label="Price (USD)"
              value={collateralPrice}
              onChange={(v) => setCollateralPrice(Number(v) || 0)}
              min={0}
              prefix="$"
              thousandSeparator=","
            />
          </Group>
          <Text size="xs" c="dimmed">
            Collateral Value: ${result.collateralValue.toLocaleString()}
          </Text>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Borrow
          </Text>
          <NumberInput
            label="Borrow Amount (USD)"
            value={borrowAmount}
            onChange={(v) => setBorrowAmount(Number(v) || 0)}
            min={0}
            prefix="$"
            thousandSeparator=","
          />
          <NumberInput
            label="Liquidation Threshold"
            value={liquidationThreshold}
            onChange={(v) => setLiquidationThreshold(Number(v) || 0)}
            min={0}
            max={1}
            step={0.05}
            decimalScale={2}
          />
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" fw={600}>
              Position Health
            </Text>
            <Badge
              size="lg"
              variant="light"
              color={healthColor(result.healthFactor)}
            >
              {healthLabel(result.healthFactor)}
            </Badge>
          </Group>

          <div>
            <Text size="xs" c="dimmed" mb={4}>
              Health Factor: {hfDisplay}
            </Text>
            <Progress
              value={Math.min(
                isFinite(result.healthFactor) ? result.healthFactor * 50 : 100,
                100,
              )}
              color={healthColor(result.healthFactor)}
              size="lg"
            />
          </div>

          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Health Factor</Table.Td>
                <Table.Td ta="right">
                  <Text fw={600} c={healthColor(result.healthFactor)}>
                    {hfDisplay}
                  </Text>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Max Borrow</Table.Td>
                <Table.Td ta="right">
                  ${result.maxBorrow.toLocaleString()}
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Collateral Ratio</Table.Td>
                <Table.Td ta="right">
                  {isFinite(result.collateralRatio)
                    ? `${result.collateralRatio.toFixed(1)}%`
                    : "∞"}
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Liquidation Price</Table.Td>
                <Table.Td ta="right">
                  <Text fw={600} c="red">
                    ${result.liqPrice.toFixed(2)}
                  </Text>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Utilization</Table.Td>
                <Table.Td ta="right">
                  {(result.utilization * 100).toFixed(1)}%
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>
    </Stack>
  );
}
