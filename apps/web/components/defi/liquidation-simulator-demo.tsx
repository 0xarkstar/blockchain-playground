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
import { EducationPanel } from "../../components/shared";

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
      liquidationThreshold,
    );
    const liqPrice = calculateLiquidationPrice(
      debtAmount,
      collateralAmount,
      liquidationThreshold,
    );
    const liquidatable = isFinite(healthFactor) && healthFactor < 1;

    const bonusValue = liquidatable
      ? collateralValue * (liquidationBonus / 100)
      : 0;

    const priceDropToLiquidation =
      initialPrice > 0 ? ((initialPrice - liqPrice) / initialPrice) * 100 : 0;

    const collateralRatio =
      debtAmount > 0 ? (collateralValue / debtAmount) * 100 : Infinity;

    return {
      collateralValue,
      healthFactor,
      liqPrice,
      liquidatable,
      bonusValue,
      priceDropToLiquidation,
      collateralRatio,
    };
  }, [
    collateralAmount,
    currentPrice,
    debtAmount,
    liquidationThreshold,
    liquidationBonus,
    initialPrice,
  ]);

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
          <Text size="sm" fw={600}>
            Position Setup
          </Text>
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
            Simulate Price Crash: ${currentPrice.toFixed(2)} (
            {currentPricePercent}% of initial)
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
          <Text size="sm" fw={600}>
            Collateral Ratio Gauge
          </Text>
          <Progress.Root size={32}>
            {isFinite(result.collateralRatio) ? (
              <Progress.Section
                value={Math.min(result.collateralRatio / 2, 100)}
                color={
                  result.collateralRatio >= 150
                    ? "green"
                    : result.collateralRatio >= 125
                      ? "yellow"
                      : "red"
                }
              >
                <Progress.Label>
                  {isFinite(result.collateralRatio)
                    ? `${result.collateralRatio.toFixed(0)}%`
                    : "N/A"}
                </Progress.Label>
              </Progress.Section>
            ) : (
              <Progress.Section value={100} color="green">
                <Progress.Label>No Debt</Progress.Label>
              </Progress.Section>
            )}
          </Progress.Root>
          <Group gap="xl" justify="center">
            <Badge color="red" variant="light" size="sm">
              &lt;125% Danger
            </Badge>
            <Badge color="yellow" variant="light" size="sm">
              125-150% Warning
            </Badge>
            <Badge color="green" variant="light" size="sm">
              &gt;150% Safe
            </Badge>
          </Group>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" fw={600}>
              Position Status
            </Text>
            <Badge size="lg" variant="light" color={hfColor}>
              {result.liquidatable ? "Liquidatable" : "Safe"}
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
              color={hfColor}
              size="lg"
            />
          </div>

          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Collateral Value</Table.Td>
                <Table.Td ta="right">
                  $
                  {result.collateralValue.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Health Factor</Table.Td>
                <Table.Td ta="right">
                  <Text fw={600} c={hfColor}>
                    {hfDisplay}
                  </Text>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Liquidation Trigger Price</Table.Td>
                <Table.Td ta="right">
                  <Text fw={600} c="red">
                    ${result.liqPrice.toFixed(2)}
                  </Text>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Price Drop to Liquidation</Table.Td>
                <Table.Td ta="right">
                  {result.priceDropToLiquidation.toFixed(1)}%
                </Table.Td>
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
                Health factor is below 1.0. A liquidator can repay part of the
                debt and claim collateral at a {liquidationBonus}% bonus.
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

      <EducationPanel
        howItWorks={[
          {
            title: "Price Drop Simulation",
            description:
              "As collateral price drops, health factor decreases. When HF < 1, the position becomes liquidatable.",
          },
          {
            title: "Liquidation Process",
            description:
              "A liquidator repays part of the debt and receives collateral at a discount (liquidation bonus), typically 5-15%.",
          },
          {
            title: "Collateral Ratio",
            description:
              "The ratio of collateral value to debt. Below ~125% is dangerous territory. Most protocols require >150% for safety.",
          },
        ]}
        whyItMatters="Liquidations protect lending protocols from bad debt. Understanding liquidation mechanics helps you manage positions safely and avoid losing the liquidation bonus penalty."
        tips={[
          "Set price alerts for your collateral assets near the liquidation price",
          "Use stablecoins as collateral to reduce liquidation risk from price volatility",
          "Some protocols offer self-liquidation to avoid the bonus penalty",
        ]}
      />
    </Stack>
  );
}
