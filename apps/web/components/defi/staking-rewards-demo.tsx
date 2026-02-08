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
import {
  SimpleAreaChart,
  SimpleBarChart,
  EducationPanel,
} from "../../components/shared";

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

  const rewardGrowthData = useMemo(() => {
    const apr_d = rewardRate / 100;
    const months = Math.max(Math.round(duration * 12), 1);
    const points: Record<string, unknown>[] = [];
    for (let m = 0; m <= months; m++) {
      const t = m / 12;
      const simple =
        stakeAmount + calculateStakingRewards(stakeAmount, apr_d, t);
      const daily = calculateCompoundedValue(stakeAmount, apr_d, 365, t);
      points.push({
        month: `M${m}`,
        simple: Math.round(simple),
        daily: Math.round(daily),
      });
    }
    return points;
  }, [stakeAmount, rewardRate, duration]);

  const aprVsApyData = useMemo(() => {
    const rates = [5, 10, 20, 50, 100];
    return rates.map((r) => ({
      rate: `${r}%`,
      APR: r,
      APY: Math.round(aprToApy(r / 100, 365) * 10000) / 100,
    }));
  }, []);

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

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            Reward Growth Over Time
          </Text>
          <SimpleAreaChart
            data={rewardGrowthData}
            xKey="month"
            yKeys={["simple", "daily"]}
            colors={["#228be6", "#40c057"]}
            height={250}
          />
          <Text size="xs" c="dimmed" ta="center">
            Simple (blue) vs Daily compound (green) reward accumulation
          </Text>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={600}>
            APR vs APY (Daily Compounding)
          </Text>
          <SimpleBarChart
            data={aprVsApyData}
            xKey="rate"
            yKeys={["APR", "APY"]}
            grouped
            height={220}
          />
          <Text size="xs" c="dimmed" ta="center">
            Higher APR rates show larger gap between APR and APY due to
            compounding
          </Text>
        </Stack>
      </Paper>

      <EducationPanel
        howItWorks={[
          {
            title: "APR vs APY",
            description:
              "APR is the simple annual rate. APY includes compounding effects. Daily compounding of 100% APR gives ~171.5% APY.",
          },
          {
            title: "Pool Share",
            description:
              "Your rewards are proportional to your share of the total staked amount. More stakers = lower individual rewards.",
          },
          {
            title: "Compounding Frequency",
            description:
              "More frequent compounding (daily > monthly > yearly) yields higher returns due to earning interest on interest.",
          },
        ]}
        whyItMatters="Staking is a core DeFi primitive for earning passive yield. Understanding APR vs APY prevents misunderstanding actual returns — a common source of confusion."
        tips={[
          "Auto-compounding vaults save gas by batching compound transactions",
          "Very high APRs often come with high inflation or token emission",
          "Compare APY (not APR) across protocols for fair comparison",
        ]}
      />
    </Stack>
  );
}
