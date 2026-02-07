"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  NumberInput,
  Slider,
  Text,
  Paper,
  Group,
  Table,
} from "@mantine/core";
import {
  calculateBorrowRate,
  calculateSupplyRate,
} from "../../lib/defi/lending";

export function InterestRateExplorerDemo() {
  const [utilization, setUtilization] = useState<number>(50);
  const [baseRate, setBaseRate] = useState<number>(2);
  const [slope1, setSlope1] = useState<number>(10);
  const [slope2, setSlope2] = useState<number>(100);
  const [kink, setKink] = useState<number>(80);
  const [reserveFactor, setReserveFactor] = useState<number>(10);

  const currentRates = useMemo(() => {
    const u = utilization / 100;
    const bRate = calculateBorrowRate(
      u,
      baseRate / 100,
      slope1 / 100,
      slope2 / 100,
      kink / 100,
    );
    const sRate = calculateSupplyRate(u, bRate, reserveFactor / 100);
    return { borrowRate: bRate * 100, supplyRate: sRate * 100 };
  }, [utilization, baseRate, slope1, slope2, kink, reserveFactor]);

  const rateTable = useMemo(() => {
    const points = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100];
    return points.map((u) => {
      const util = u / 100;
      const bRate = calculateBorrowRate(
        util,
        baseRate / 100,
        slope1 / 100,
        slope2 / 100,
        kink / 100,
      );
      const sRate = calculateSupplyRate(util, bRate, reserveFactor / 100);
      return {
        utilization: u,
        borrowRate: bRate * 100,
        supplyRate: sRate * 100,
      };
    });
  }, [baseRate, slope1, slope2, kink, reserveFactor]);

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Current Utilization: {utilization}%
          </Text>
          <Slider
            value={utilization}
            onChange={setUtilization}
            min={0}
            max={100}
            step={1}
            marks={[
              { value: 0, label: "0%" },
              { value: kink, label: `${kink}% (kink)` },
              { value: 100, label: "100%" },
            ]}
            label={(v) => `${v}%`}
          />
          <Group>
            <Text size="sm">
              Borrow Rate:{" "}
              <Text span fw={600} c="red">
                {currentRates.borrowRate.toFixed(2)}%
              </Text>
            </Text>
            <Text size="sm">
              Supply Rate:{" "}
              <Text span fw={600} c="green">
                {currentRates.supplyRate.toFixed(2)}%
              </Text>
            </Text>
          </Group>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Model Parameters (%)
          </Text>
          <Group grow>
            <NumberInput
              label="Base Rate"
              value={baseRate}
              onChange={(v) => setBaseRate(Number(v) || 0)}
              min={0}
              max={100}
              suffix="%"
              decimalScale={1}
            />
            <NumberInput
              label="Slope 1 (below kink)"
              value={slope1}
              onChange={(v) => setSlope1(Number(v) || 0)}
              min={0}
              max={100}
              suffix="%"
              decimalScale={1}
            />
          </Group>
          <Group grow>
            <NumberInput
              label="Slope 2 (above kink)"
              value={slope2}
              onChange={(v) => setSlope2(Number(v) || 0)}
              min={0}
              max={500}
              suffix="%"
              decimalScale={1}
            />
            <NumberInput
              label="Kink Point"
              value={kink}
              onChange={(v) =>
                setKink(Math.max(1, Math.min(99, Number(v) || 1)))
              }
              min={1}
              max={99}
              suffix="%"
              decimalScale={0}
            />
          </Group>
          <NumberInput
            label="Reserve Factor"
            value={reserveFactor}
            onChange={(v) => setReserveFactor(Number(v) || 0)}
            min={0}
            max={100}
            suffix="%"
            decimalScale={1}
          />
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Rate Curve
          </Text>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Utilization</Table.Th>
                <Table.Th ta="right">Borrow Rate</Table.Th>
                <Table.Th ta="right">Supply Rate</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rateTable.map((row) => (
                <Table.Tr
                  key={row.utilization}
                  style={{
                    fontWeight: row.utilization === utilization ? 700 : 400,
                    backgroundColor:
                      row.utilization === utilization
                        ? "var(--mantine-color-blue-light)"
                        : undefined,
                  }}
                >
                  <Table.Td>{row.utilization}%</Table.Td>
                  <Table.Td ta="right" c="red">
                    {row.borrowRate.toFixed(2)}%
                  </Table.Td>
                  <Table.Td ta="right" c="green">
                    {row.supplyRate.toFixed(2)}%
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
