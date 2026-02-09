"use client";

import { useState, useMemo } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { calculateImpermanentLoss } from "../../lib/defi/amm";
import { SimpleAreaChart, EducationPanel } from "../../components/shared";

export function ImpermanentLossDemo() {
  const [totalValue, setTotalValue] = useState<number>(10000);
  const [priceRatio, setPriceRatio] = useState<number>(1);

  const result = useMemo(() => {
    const halfValue = totalValue / 2;
    const il = calculateImpermanentLoss(priceRatio);
    const hodlValue = halfValue * priceRatio + halfValue;
    const lpValue = hodlValue * (1 + il);
    const difference = lpValue - hodlValue;
    const ilPercent = il * 100;

    return {
      hodlValue,
      lpValue,
      difference,
      ilPercent,
      halfValue,
    };
  }, [totalValue, priceRatio]);

  const ilCurveData = useMemo(() => {
    const points: Record<string, unknown>[] = [];
    const ratios = [0.1, 0.2, 0.3, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5, 7, 10];
    for (const r of ratios) {
      const il = calculateImpermanentLoss(r);
      points.push({ ratio: `${r}x`, ilPercent: Math.round(il * -10000) / 100 });
    }
    return points;
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Impermanent Loss Curve</p>
          <SimpleAreaChart
            data={ilCurveData}
            xKey="ratio"
            yKeys={["ilPercent"]}
            colors={["#fa5252"]}
            height={250}
          />
          <p className="text-xs text-muted-foreground text-center">
            IL % (y-axis) vs Price Ratio Change (x-axis). Loss increases with
            divergence from 1x.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Initial Position (50/50 Pool)</p>
          <div>
            <Label>Total Position Value (USD)</Label>
            <p className="text-xs text-muted-foreground mb-1">
              Automatically split equally between Token A and Token B
            </p>
            <Input
              type="number"
              value={totalValue}
              onChange={(e) => setTotalValue(Number(e.target.value) || 0)}
              min={0}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Token A: ${result.halfValue.toLocaleString()} | Token B: $
            {result.halfValue.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Price Ratio Change: {priceRatio.toFixed(2)}x
          </p>
          <p className="text-xs text-muted-foreground">
            How much Token A price has changed relative to Token B
          </p>
          <Slider
            value={[priceRatio]}
            onValueChange={([v]) => setPriceRatio(v)}
            min={0.1}
            max={10}
            step={0.1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.1x</span>
            <span>1x</span>
            <span>2x</span>
            <span>5x</span>
            <span>10x</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Comparison</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Initial Value</TableCell>
                <TableCell className="text-right">
                  $
                  {totalValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>HODL Value</TableCell>
                <TableCell className="text-right">
                  $
                  {result.hodlValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>LP Value</TableCell>
                <TableCell className="text-right">
                  $
                  {result.lpValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Difference (LP - HODL)</TableCell>
                <TableCell className="text-right">
                  <span className={`font-semibold ${result.difference < 0 ? "text-red-600" : "text-green-600"}`}>
                    $
                    {result.difference.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Impermanent Loss</TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold text-red-600">
                    {result.ilPercent.toFixed(2)}%
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <EducationPanel
        howItWorks={[
          {
            title: "IL Formula",
            description:
              "IL = 2*sqrt(r)/(1+r) - 1, where r is the price ratio. At r=1 (no change), IL=0.",
          },
          {
            title: "Why It Happens",
            description:
              "AMM pools rebalance automatically. When prices diverge, arbitrageurs extract value, leaving LPs with less than if they had held.",
          },
          {
            title: "When It Disappears",
            description:
              "If prices return to original ratio, IL goes to zero. Hence 'impermanent' — it only locks in when you withdraw.",
          },
        ]}
        whyItMatters="Impermanent loss is the hidden cost of providing liquidity. At 2x price change, IL is ~5.7%. At 5x, it's ~25.5%. Trading fees must exceed IL for LPs to profit."
        tips={[
          "Stablecoin pairs (USDC/USDT) have minimal IL due to low price divergence",
          "High-volume pools generate more fees to offset IL",
          "Concentrated liquidity (Uniswap v3) amplifies both fees AND IL",
        ]}
      />
    </div>
  );
}
