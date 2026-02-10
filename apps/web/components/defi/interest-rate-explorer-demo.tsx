"use client";

import { useState, useMemo } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import {
  calculateBorrowRate,
  calculateSupplyRate,
} from "../../lib/defi/lending";
import { SimpleLineChart, EducationPanel } from "../../components/shared";

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
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Current Utilization: {utilization}%
          </p>
          <Slider
            value={[utilization]}
            onValueChange={([v]) => setUtilization(v)}
            min={0}
            max={100}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>{kink}% (kink)</span>
            <span>100%</span>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm">
              Borrow Rate:{" "}
              <span className="font-semibold text-red-600 dark:text-red-400">
                {currentRates.borrowRate.toFixed(2)}%
              </span>
            </p>
            <p className="text-sm">
              Supply Rate:{" "}
              <span className="font-semibold text-green-600 dark:text-green-400">
                {currentRates.supplyRate.toFixed(2)}%
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Model Parameters (%)</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defi-rate-base">Base Rate</Label>
              <Input
                id="defi-rate-base"
                type="number"
                value={baseRate}
                onChange={(e) => setBaseRate(Number(e.target.value) || 0)}
                min={0}
                max={100}
              />
            </div>
            <div>
              <Label htmlFor="defi-rate-slope1">Slope 1 (below kink)</Label>
              <Input
                id="defi-rate-slope1"
                type="number"
                value={slope1}
                onChange={(e) => setSlope1(Number(e.target.value) || 0)}
                min={0}
                max={100}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defi-rate-slope2">Slope 2 (above kink)</Label>
              <Input
                id="defi-rate-slope2"
                type="number"
                value={slope2}
                onChange={(e) => setSlope2(Number(e.target.value) || 0)}
                min={0}
                max={500}
              />
            </div>
            <div>
              <Label htmlFor="defi-rate-kink">Kink Point</Label>
              <Input
                id="defi-rate-kink"
                type="number"
                value={kink}
                onChange={(e) =>
                  setKink(Math.max(1, Math.min(99, Number(e.target.value) || 1)))
                }
                min={1}
                max={99}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="defi-rate-reserve">Reserve Factor</Label>
            <Input
              id="defi-rate-reserve"
              type="number"
              value={reserveFactor}
              onChange={(e) => setReserveFactor(Number(e.target.value) || 0)}
              min={0}
              max={100}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Rate Curve</p>
          <SimpleLineChart
            data={rateTable.map((r) => ({
              utilization: `${r.utilization}%`,
              borrowRate: Math.round(r.borrowRate * 100) / 100,
              supplyRate: Math.round(r.supplyRate * 100) / 100,
            }))}
            xKey="utilization"
            yKeys={["borrowRate", "supplyRate"]}
            height={280}
          />
          <p className="text-xs text-muted-foreground text-center">
            Notice the kink at {kink}% utilization where borrow rates spike
            sharply.
          </p>
        </div>
      </div>

      <EducationPanel
        howItWorks={[
          {
            title: "Kinked Rate Model",
            description:
              "Below the kink, rates increase gradually (slope1). Above the kink, rates spike (slope2) to incentivize repayment.",
          },
          {
            title: "Supply Rate",
            description:
              "supplyRate = borrowRate * utilization * (1 - reserveFactor). Suppliers earn from borrower interest.",
          },
          {
            title: "Reserve Factor",
            description:
              "A portion of interest goes to the protocol treasury. Higher reserve factor means lower supplier APY.",
          },
        ]}
        whyItMatters="Interest rate models balance supply and demand for capital. The kink mechanism prevents full utilization (which would block withdrawals) by making borrowing very expensive above the target."
        tips={[
          "Borrowers should watch utilization — rates spike above the kink point",
          "Suppliers benefit from higher utilization (more fees) but face withdrawal risk",
          "Different assets have different kink parameters based on risk profile",
        ]}
      />
    </div>
  );
}
