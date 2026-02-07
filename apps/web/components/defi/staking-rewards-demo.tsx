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
import {
  aprToApy,
  calculateCompoundedValue,
  calculateStakingRewards,
  calculatePoolShare,
} from "../../lib/defi/yield";

const DURATION_PRESETS: Record<string, number> = {
  "1M": 1 / 12,
  "3M": 3 / 12,
  "6M": 6 / 12,
  "1Y": 1,
  "2Y": 2,
};

export function StakingRewardsDemo() {
  const [stakeAmount, setStakeAmount] = useState<number>(10000);
  const [totalStaked, setTotalStaked] = useState<number>(1000000);
  const [rewardRate, setRewardRate] = useState<number>(12);
  const [durationKey, setDurationKey] = useState("1Y");

  const duration = DURATION_PRESETS[durationKey];

  const result = useMemo(() => {
    const apr = rewardRate / 100;
    const simpleRewards = calculateStakingRewards(stakeAmount, apr, duration);
    const poolShare = calculatePoolShare(stakeAmount, totalStaked);

    const compounding = [
      { label: "None (Simple)", freq: 0 },
      { label: "Yearly", freq: 1 },
      { label: "Monthly", freq: 12 },
      { label: "Daily", freq: 365 },
    ].map(({ label, freq }) => {
      const apy = aprToApy(apr, freq);
      const finalValue = calculateCompoundedValue(
        stakeAmount,
        apr,
        freq,
        duration,
      );
      return {
        label,
        freq,
        apy: apy * 100,
        finalValue,
        rewards: finalValue - stakeAmount,
      };
    });

    return { simpleRewards, poolShare, compounding, apr };
  }, [stakeAmount, totalStaked, rewardRate, duration]);

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Staking Parameters
          </Text>
          <Group grow>
            <NumberInput
              label="Stake Amount"
              value={stakeAmount}
              onChange={(v) => setStakeAmount(Number(v) || 0)}
              min={0}
              thousandSeparator=","
            />
            <NumberInput
              label="Total Pool Staked"
              value={totalStaked}
              onChange={(v) => setTotalStaked(Number(v) || 0)}
              min={0}
              thousandSeparator=","
            />
          </Group>
          <NumberInput
            label="Reward Rate (APR %)"
            value={rewardRate}
            onChange={(v) => setRewardRate(Number(v) || 0)}
            min={0}
            max={1000}
            suffix="%"
            decimalScale={1}
          />
          <div>
            <Text size="xs" c="dimmed" mb={4}>
              Duration
            </Text>
            <SegmentedControl
              value={durationKey}
              onChange={setDurationKey}
              data={Object.keys(DURATION_PRESETS)}
              fullWidth
            />
          </div>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Summary
          </Text>
          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Pool Share</Table.Td>
                <Table.Td ta="right">
                  {(result.poolShare * 100).toFixed(4)}%
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Simple Rewards ({durationKey})</Table.Td>
                <Table.Td ta="right">
                  <Text fw={600}>{result.simpleRewards.toFixed(2)}</Text>
                </Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>APR</Table.Td>
                <Table.Td ta="right">{rewardRate}%</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Compounding Comparison ({durationKey})
          </Text>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Frequency</Table.Th>
                <Table.Th ta="right">APY</Table.Th>
                <Table.Th ta="right">Final Value</Table.Th>
                <Table.Th ta="right">Rewards</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {result.compounding.map((row) => (
                <Table.Tr key={row.label}>
                  <Table.Td>{row.label}</Table.Td>
                  <Table.Td ta="right">{row.apy.toFixed(2)}%</Table.Td>
                  <Table.Td ta="right">{row.finalValue.toFixed(2)}</Table.Td>
                  <Table.Td ta="right">
                    <Text fw={600} c="green">
                      {row.rewards.toFixed(2)}
                    </Text>
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
