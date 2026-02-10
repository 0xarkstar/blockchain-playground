"use client";

import { useState, useMemo } from "react";
import { Info } from "lucide-react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "../ui/table";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { calculateSwapOutput, calculateSpotPrice } from "../../lib/defi/amm";
import {
  SimpleLineChart,
  DemoLayout,
  EducationPanel,
} from "../../components/shared";

export function SimpleSwapDemo() {
  const [reserveA, setReserveA] = useState<number>(10000);
  const [reserveB, setReserveB] = useState<number>(10000);
  const [amountIn, setAmountIn] = useState<number>(100);
  const [feeRate, setFeeRate] = useState<number>(0.3);
  const [direction, setDirection] = useState("AtoB");

  const result = useMemo(() => {
    const rIn = direction === "AtoB" ? reserveA : reserveB;
    const rOut = direction === "AtoB" ? reserveB : reserveA;
    return calculateSwapOutput(rIn, rOut, amountIn, feeRate / 100);
  }, [reserveA, reserveB, amountIn, feeRate, direction]);

  const spotPrice = useMemo(() => {
    return direction === "AtoB"
      ? calculateSpotPrice(reserveA, reserveB)
      : calculateSpotPrice(reserveB, reserveA);
  }, [reserveA, reserveB, direction]);

  const highImpact = result.priceImpact > 5;

  const k = reserveA * reserveB;

  const curveData = useMemo(() => {
    if (k <= 0) return [];
    const points: Record<string, unknown>[] = [];
    const maxX = Math.max(reserveA * 3, 1000);
    const step = Math.max(maxX / 50, 1);
    for (let x = step; x <= maxX; x += step) {
      points.push({ x: Math.round(x), y: Math.round(k / x) });
    }
    return points;
  }, [k, reserveA]);

  const rIn = direction === "AtoB" ? reserveA : reserveB;
  const newRIn = rIn + amountIn;
  const newROut = k > 0 ? k / newRIn : 0;

  const swapPoints = useMemo(() => {
    const pts: Record<string, unknown>[] = [];
    if (direction === "AtoB") {
      pts.push({
        x: Math.round(reserveA),
        y: Math.round(reserveB),
        label: "Before",
      });
      pts.push({
        x: Math.round(newRIn),
        y: Math.round(newROut),
        label: "After",
      });
    } else {
      pts.push({
        x: Math.round(reserveA),
        y: Math.round(reserveB),
        label: "Before",
      });
      pts.push({
        x: Math.round(newROut),
        y: Math.round(newRIn),
        label: "After",
      });
    }
    return pts;
  }, [reserveA, reserveB, newRIn, newROut, direction]);

  const inputPanel = (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Pool Reserves</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defi-swap-reserveA">Token A Reserve</Label>
              <Input
                id="defi-swap-reserveA"
                type="number"
                value={reserveA}
                onChange={(e) => setReserveA(Number(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div>
              <Label htmlFor="defi-swap-reserveB">Token B Reserve</Label>
              <Input
                id="defi-swap-reserveB"
                type="number"
                value={reserveB}
                onChange={(e) => setReserveB(Number(e.target.value) || 0)}
                min={0}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Constant Product (k): {k.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Swap</p>
          <Tabs value={direction} onValueChange={setDirection}>
            <TabsList className="w-full">
              <TabsTrigger value="AtoB" className="flex-1">A → B</TabsTrigger>
              <TabsTrigger value="BtoA" className="flex-1">B → A</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defi-swap-amountIn">Amount In</Label>
              <Input
                id="defi-swap-amountIn"
                type="number"
                value={amountIn}
                onChange={(e) => setAmountIn(Number(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div>
              <Label htmlFor="defi-swap-feeRate">Fee Rate (%)</Label>
              <Input
                id="defi-swap-feeRate"
                type="number"
                value={feeRate}
                onChange={(e) => setFeeRate(Number(e.target.value) || 0)}
                min={0}
                max={99}
                step={0.1}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const resultPanel = (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Constant Product Curve (x * y = k)
          </p>
          <SimpleLineChart
            data={[...curveData, ...swapPoints]}
            xKey="x"
            yKeys={["y"]}
            height={250}
          />
          <p className="text-xs text-muted-foreground text-center">
            Token A (x-axis) vs Token B (y-axis). Swap moves along the curve.
          </p>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Result</p>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Spot Price</TableCell>
                <TableCell className="text-right">{spotPrice.toFixed(6)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Amount Out</TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold">{result.amountOut.toFixed(6)}</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Effective Price</TableCell>
                <TableCell className="text-right">
                  {result.effectivePrice.toFixed(6)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Price Impact</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="secondary"
                    className={
                      highImpact
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    }
                  >
                    {result.priceImpact.toFixed(2)}%
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Fee Paid</TableCell>
                <TableCell className="text-right">{result.fee.toFixed(6)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          {highImpact && (
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertTitle>High Price Impact</AlertTitle>
              <AlertDescription>
                This trade has a price impact of {result.priceImpact.toFixed(2)}%.
                Consider reducing your trade size or using a pool with deeper
                liquidity.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <DemoLayout
        inputPanel={inputPanel}
        resultPanel={resultPanel}
        learnContent={
          <EducationPanel
            howItWorks={[
              {
                title: "Constant Product Formula",
                description:
                  "AMMs use x * y = k, where x and y are token reserves and k is a constant. Every swap must maintain this invariant.",
              },
              {
                title: "Price Determination",
                description:
                  "The spot price is the ratio of reserves (y/x). Larger trades move further along the curve, causing more price impact.",
              },
              {
                title: "Fees",
                description:
                  "A small fee is deducted from each swap. This fee rewards liquidity providers and slightly increases k over time.",
              },
            ]}
            whyItMatters="AMMs like Uniswap replaced traditional order books, enabling permissionless, 24/7 token trading without intermediaries. Understanding the constant product formula is fundamental to DeFi."
            tips={[
              "Larger trades relative to pool size cause higher price impact",
              "Deep liquidity pools offer better prices for large trades",
              "Fees typically range from 0.01% to 1% depending on the pool",
            ]}
          />
        }
      />
    </div>
  );
}
