"use client";

import { useState, useMemo } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
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
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Staking Parameters</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Stake Amount</Label>
              <Input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(Number(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div>
              <Label>Total Pool Staked</Label>
              <Input
                type="number"
                value={totalStaked}
                onChange={(e) => setTotalStaked(Number(e.target.value) || 0)}
                min={0}
              />
            </div>
          </div>
          <div>
            <Label>Reward Rate (APR %)</Label>
            <Input
              type="number"
              value={rewardRate}
              onChange={(e) => setRewardRate(Number(e.target.value) || 0)}
              min={0}
              max={1000}
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Duration</p>
            <Tabs value={durationKey} onValueChange={setDurationKey}>
              <TabsList className="w-full">
                {Object.keys(DURATION_PRESETS).map((key) => (
                  <TabsTrigger key={key} value={key} className="flex-1">
                    {key}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Summary</p>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Pool Share</TableCell>
                <TableCell className="text-right">
                  {(result.poolShare * 100).toFixed(4)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Simple Rewards ({durationKey})</TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold">{result.simpleRewards.toFixed(2)}</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>APR</TableCell>
                <TableCell className="text-right">{rewardRate}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Compounding Comparison ({durationKey})
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Frequency</TableHead>
                <TableHead className="text-right">APY</TableHead>
                <TableHead className="text-right">Final Value</TableHead>
                <TableHead className="text-right">Rewards</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.compounding.map((row) => (
                <TableRow key={row.label}>
                  <TableCell>{row.label}</TableCell>
                  <TableCell className="text-right">{row.apy.toFixed(2)}%</TableCell>
                  <TableCell className="text-right">{row.finalValue.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-green-600">
                      {row.rewards.toFixed(2)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Reward Growth Over Time</p>
          <SimpleAreaChart
            data={rewardGrowthData}
            xKey="month"
            yKeys={["simple", "daily"]}
            colors={["#228be6", "#40c057"]}
            height={250}
          />
          <p className="text-xs text-muted-foreground text-center">
            Simple (blue) vs Daily compound (green) reward accumulation
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            APR vs APY (Daily Compounding)
          </p>
          <SimpleBarChart
            data={aprVsApyData}
            xKey="rate"
            yKeys={["APR", "APY"]}
            grouped
            height={220}
          />
          <p className="text-xs text-muted-foreground text-center">
            Higher APR rates show larger gap between APR and APY due to
            compounding
          </p>
        </div>
      </div>

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
    </div>
  );
}
