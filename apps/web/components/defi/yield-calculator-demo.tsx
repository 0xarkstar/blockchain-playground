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
import { aprToApy, calculateCompoundedValue } from "../../lib/defi/yield";
import { SimpleBarChart, EducationPanel } from "../../components/shared";

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
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Parameters</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Principal</Label>
              <Input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div>
              <Label>APR (%)</Label>
              <Input
                type="number"
                value={apr}
                onChange={(e) => setApr(Number(e.target.value) || 0)}
                min={0}
                max={1000}
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Duration</p>
            <Tabs value={durationKey} onValueChange={setDurationKey}>
              <TabsList className="w-full">
                {Object.keys(DURATION_MAP).map((key) => (
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
          <p className="text-sm font-semibold">APR → APY Conversion</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Compounding</TableHead>
                <TableHead className="text-right">APY</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.label}>
                  <TableCell>{row.label}</TableCell>
                  <TableCell className="text-right">{row.apy.toFixed(4)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Final Values ({durationKey})</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Compounding</TableHead>
                <TableHead className="text-right">Final Value</TableHead>
                <TableHead className="text-right">Total Return</TableHead>
                <TableHead className="text-right">Return %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.label}
                  className={
                    row.label === bestRow.label
                      ? "font-bold bg-green-50 dark:bg-green-950"
                      : ""
                  }
                >
                  <TableCell>{row.label}</TableCell>
                  <TableCell className="text-right">
                    $
                    {row.finalValue.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-600">
                      +$
                      {row.totalReturn.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {row.returnPercent.toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Yield Comparison by Strategy
          </p>
          <SimpleBarChart
            data={rows
              .filter((r) => r.freq > 0)
              .map((r) => ({
                strategy: r.label,
                totalReturn: Math.round(r.totalReturn * 100) / 100,
              }))}
            xKey="strategy"
            yKeys={["totalReturn"]}
            colors={["#40c057"]}
            height={220}
          />
          <p className="text-xs text-muted-foreground text-center">
            Total return ($) by compounding frequency over {durationKey}
          </p>
        </div>
      </div>

      <EducationPanel
        howItWorks={[
          {
            title: "Simple vs Compound",
            description:
              "Simple interest: principal * rate * time. Compound interest: principal * (1 + rate/n)^(n*t), where n is compounding frequency.",
          },
          {
            title: "Continuous Compounding",
            description:
              "As frequency approaches infinity, compound interest converges to principal * e^(rate*time). Hourly compounding approximates this.",
          },
          {
            title: "DeFi Yield Sources",
            description:
              "Lending interest, LP fees, staking rewards, token emissions, and protocol revenue sharing.",
          },
        ]}
        whyItMatters="Understanding yield calculations prevents falling for misleading APY claims. A 1000% APR with no compounding is very different from 1000% APY."
        tips={[
          "Always compare APY (not APR) across different protocols",
          "Higher compounding frequency has diminishing returns — daily vs hourly difference is minimal",
          "Factor in gas costs for manual compounding — auto-compounders save gas",
          "Sustainable yield comes from real economic activity, not just token emissions",
        ]}
      />
    </div>
  );
}
