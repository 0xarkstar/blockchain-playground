"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  NumberInput,
  Slider,
  Text,
  Paper,
  Group,
  Badge,
  Table,
  Progress,
  Alert,
} from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import {
  calculateHealthFactor,
  calculateLiquidationPrice,
} from "../../lib/defi/lending";

export function LiquidationSimulatorDemo() {
  const [initialPrice, setInitialPrice] = useState<number>(2000);
  const [currentPricePercent, setCurrentPricePercent] = useState<number>(100);
  const [collateralAmount, setCollateralAmount] = useState<number>(10);
  const [debtAmount, setDebtAmount] = useState<number>(12000);
  const [liquidationThreshold, setLiquidationThreshold] = useState<number>(0.8);
  const [liquidationBonus, setLiquidationBonus] = useState<number>(5);

  const currentPrice = (initialPrice * currentPricePercent) / 100;

  const result = useMemo(() => {
    const collateralValue = collateralAmount * currentPrice;
    const healthFactor = calculateHealthFactor(
      collateralValue,
      debtAmount,
      liquidationThreshold
    );
    const liqPrice = calculateLiquidationPrice(
      debtAmount,
      collateralAmount,
      liquidationThreshold
    );
    const liquidatable = isFinite(healthFactor) && healthFactor < 1;

    const bonusValue = liquidatable
      ? collateralValue * (liquidationBonus / 100)
      : 0;

    const priceDropToLiquidation = initialPrice > 0
      ? ((initialPrice - liqPrice) / initialPrice) * 100
      : 0;

    return {
      collateralValue,
      healthFactor,
      liqPrice,
      liquidatable,
      bonusValue,
      priceDropToLiquidation,
    };
  }, [collateralAmount, currentPrice, debtAmount, liquidationThreshold, liquidationBonus, initialPrice]);

  const hfDisplay = isFinite(result.healthFactor)
    ? result.healthFactor.toFixed(3)
    : "∞";

  const hfColor = result.liquidatable
    ? "red"
    : result.healthFactor < 1.2
      ? "orange"
      : result.healthFactor < 1.5
        ? "yellow"
        : "green";

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>Position Setup</Text>
          <Group grow>
            <NumberInput
              label="Initial Collateral Price"
              value={initialPrice}
              onChange={(v) => setInitialPrice(Number(v) || 0)}
              min={0}
              prefix="$"
              thousandSeparator=","
            />
            <NumberInput
              label="Collateral Amount"
              value={collateralAmount}
              onChange={(v) => setCollateralAmount(Number(v) || 0)}
              min={0}
              decimalScale={4}
            />
          </Group>
          <Group grow>
            <NumberInput
              label="Debt Amount (USD)"
              value={debtAmount}
              onChange={(v) => setDebtAmount(Number(v) || 0)}
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
          </Group>
          <NumberInput
            label="Liquidation Bonus (%)"
            value={liquidationBonus}
            onChange={(v) => setLiquidationBonus(Number(v) || 0)}
            min={0}
            max={50}
            suffix="%"
            decimalScale={1}
          />
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Simulate Price Crash: ${currentPrice.toFixed(2)} ({currentPricePercent}% of initial)
          </Text>
          <Slider
            value={currentPricePercent}
            onChange={setCurrentPricePercent}
            min={1}
            max={150}
            step={1}
            marks={[
              { value: 25, label: "25%" },
              { value: 50, label: "50%" },
              { value: 75, label: "75%" },
              { value: 100, label: "100%" },
              { value: 150, label: "150%" },
            ]}
            label={(v) => `${v}%`}
            color={hfColor}
          />
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" fw={600}>Position Status</Text>
            <Badge size="lg" variant="light" color={hfColor}>
              {result.liquidatable ? "Liquidatable" : "Safe"}
            </Badge>
          </Group>

          <div>
            <Text size="xs" c="dimmed" mb={4}>Health Factor: {hfDisplay}</Text>
            <Progress
              value={Math.min(isFinite(result.healthFactor) ? result.healthFactor * 50 : 100, 100)}
              color={hfColor}
              size="lg"
            />
          </div>

          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Collateral Value</Table.Td>
                <Table.Td ta="right">
                  ${result.collateralValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Health Factor</Table.Td>
                <Table.Td ta="right">
                  <Text fw={600} c={hfColor}>{hfDisplay}</Text>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Liquidation Trigger Price</Table.Td>
                <Table.Td ta="right">
                  <Text fw={600} c="red">${result.liqPrice.toFixed(2)}</Text>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Price Drop to Liquidation</Table.Td>
                <Table.Td ta="right">{result.priceDropToLiquidation.toFixed(1)}%</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>

          {result.liquidatable && (
            <>
              <Alert
                icon={<IconAlertTriangle size={16} />}
                color="red"
                title="Position Liquidatable"
              >
                Health factor is below 1.0. A liquidator can repay part of the debt
                and claim collateral at a {liquidationBonus}% bonus.
              </Alert>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Liquidation Details</Table.Th>
                    <Table.Th ta="right">Value</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td>Liquidation Bonus (Liquidator Profit)</Table.Td>
                    <Table.Td ta="right">
                      <Text fw={600} c="green">
                        ${result.bonusValue.toFixed(2)}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
