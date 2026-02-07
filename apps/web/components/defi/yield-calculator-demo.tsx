"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  NumberInput,
  Text,
  Paper,
  Group,
  Table,
  SegmentedControl,
} from "@mantine/core";
import { aprToApy, calculateCompoundedValue } from "../../lib/defi/yield";

const DURATION_MAP: Record<string, number> = {
  "1M": 1 / 12,
  "6M": 0.5,
  "1Y": 1,
  "3Y": 3,
  "5Y": 5,
};

const COMPOUNDING_OPTIONS = [
  { label: "None", freq: 0 },
  { label: "Yearly", freq: 1 },
  { label: "Quarterly", freq: 4 },
  { label: "Monthly", freq: 12 },
  { label: "Weekly", freq: 52 },
  { label: "Daily", freq: 365 },
  { label: "Hourly", freq: 8760 },
];

export function YieldCalculatorDemo() {
  const [principal, setPrincipal] = useState<number>(10000);
  const [apr, setApr] = useState<number>(10);
  const [durationKey, setDurationKey] = useState("1Y");

  const duration = DURATION_MAP[durationKey];

  const rows = useMemo(() => {
    const aprDecimal = apr / 100;
    return COMPOUNDING_OPTIONS.map(({ label, freq }) => {
      const apy = aprToApy(aprDecimal, freq);
      const finalValue = calculateCompoundedValue(
        principal,
        aprDecimal,
        freq,
        duration,
      );
      const totalReturn = finalValue - principal;
      const returnPercent = principal > 0 ? (totalReturn / principal) * 100 : 0;

      return {
        label,
        freq,
        apy: apy * 100,
        finalValue,
        totalReturn,
        returnPercent,
      };
    });
  }, [principal, apr, duration]);

  const bestRow = useMemo(
    () =>
      rows.reduce((best, row) =>
        row.finalValue > best.finalValue ? row : best,
      ),
    [rows],
  );

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Parameters
          </Text>
          <Group grow>
            <NumberInput
              label="Principal"
              value={principal}
              onChange={(v) => setPrincipal(Number(v) || 0)}
              min={0}
              thousandSeparator=","
              prefix="$"
            />
            <NumberInput
              label="APR (%)"
              value={apr}
              onChange={(v) => setApr(Number(v) || 0)}
              min={0}
              max={1000}
              suffix="%"
              decimalScale={1}
            />
          </Group>
          <div>
            <Text size="xs" c="dimmed" mb={4}>
              Duration
            </Text>
            <SegmentedControl
              value={durationKey}
              onChange={setDurationKey}
              data={Object.keys(DURATION_MAP)}
              fullWidth
            />
          </div>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            APR → APY Conversion
          </Text>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Compounding</Table.Th>
                <Table.Th ta="right">APY</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((row) => (
                <Table.Tr key={row.label}>
                  <Table.Td>{row.label}</Table.Td>
                  <Table.Td ta="right">{row.apy.toFixed(4)}%</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Final Values ({durationKey})
          </Text>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Compounding</Table.Th>
                <Table.Th ta="right">Final Value</Table.Th>
                <Table.Th ta="right">Total Return</Table.Th>
                <Table.Th ta="right">Return %</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((row) => (
                <Table.Tr
                  key={row.label}
                  style={{
                    fontWeight: row.label === bestRow.label ? 700 : 400,
                    backgroundColor:
                      row.label === bestRow.label
                        ? "var(--mantine-color-green-light)"
                        : undefined,
                  }}
                >
                  <Table.Td>{row.label}</Table.Td>
                  <Table.Td ta="right">
                    $
                    {row.finalValue.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text c="green">
                      +$
                      {row.totalReturn.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    {row.returnPercent.toFixed(2)}%
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
