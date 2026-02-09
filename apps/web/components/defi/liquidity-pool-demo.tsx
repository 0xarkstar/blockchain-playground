"use client";

import { useState, useMemo } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "../ui/table";
import {
  calculateLPTokens,
  calculateRemoveLiquidity,
  calculateSpotPrice,
} from "../../lib/defi/amm";
import { SimplePieChart, EducationPanel } from "../../components/shared";

export function LiquidityPoolDemo() {
  const [reserveA, setReserveA] = useState<number>(10000);
  const [reserveB, setReserveB] = useState<number>(10000);
  const [totalSupply, setTotalSupply] = useState<number>(10000);
  const [mode, setMode] = useState("add");
  const [amountA, setAmountA] = useState<number>(1000);
  const [amountB, setAmountB] = useState<number>(1000);
  const [lpAmount, setLpAmount] = useState<number>(500);

  const addResult = useMemo(() => {
    const lpTokens = calculateLPTokens(
      reserveA,
      reserveB,
      amountA,
      amountB,
      totalSupply,
    );
    const newTotalSupply = totalSupply + lpTokens;
    const poolShare =
      newTotalSupply > 0 ? (lpTokens / newTotalSupply) * 100 : 0;
    return {
      lpTokens,
      poolShare,
      newReserveA: reserveA + amountA,
      newReserveB: reserveB + amountB,
      newTotalSupply,
    };
  }, [reserveA, reserveB, amountA, amountB, totalSupply]);

  const removeResult = useMemo(() => {
    const result = calculateRemoveLiquidity(
      reserveA,
      reserveB,
      lpAmount,
      totalSupply,
    );
    return {
      ...result,
      shareRemoved: totalSupply > 0 ? (lpAmount / totalSupply) * 100 : 0,
      newReserveA: reserveA - result.amountA,
      newReserveB: reserveB - result.amountB,
      newTotalSupply: totalSupply - lpAmount,
    };
  }, [reserveA, reserveB, lpAmount, totalSupply]);

  const spotPrice = useMemo(
    () => calculateSpotPrice(reserveA, reserveB),
    [reserveA, reserveB],
  );

  const reservePieData = useMemo(() => {
    const total = reserveA + reserveB;
    if (total <= 0) return [];
    return [
      { name: "Token A", value: Math.round((reserveA / total) * 100) },
      { name: "Token B", value: Math.round((reserveB / total) * 100) },
    ];
  }, [reserveA, reserveB]);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Pool Reserve Ratio</p>
          <SimplePieChart
            data={reservePieData}
            nameKey="name"
            valueKey="value"
            height={220}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Current Pool State</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Token A Reserve</Label>
              <Input
                type="number"
                value={reserveA}
                onChange={(e) => setReserveA(Number(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div>
              <Label>Token B Reserve</Label>
              <Input
                type="number"
                value={reserveB}
                onChange={(e) => setReserveB(Number(e.target.value) || 0)}
                min={0}
              />
            </div>
          </div>
          <div>
            <Label>Total LP Supply</Label>
            <Input
              type="number"
              value={totalSupply}
              onChange={(e) => setTotalSupply(Number(e.target.value) || 0)}
              min={0}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Spot Price (A/B): {spotPrice.toFixed(6)}
          </p>
        </div>
      </div>

      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="w-full">
          <TabsTrigger value="add" className="flex-1">Add Liquidity</TabsTrigger>
          <TabsTrigger value="remove" className="flex-1">Remove Liquidity</TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "add" ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">Add Liquidity</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Token A Amount</Label>
                <Input
                  type="number"
                  value={amountA}
                  onChange={(e) => setAmountA(Number(e.target.value) || 0)}
                  min={0}
                />
              </div>
              <div>
                <Label>Token B Amount</Label>
                <Input
                  type="number"
                  value={amountB}
                  onChange={(e) => setAmountB(Number(e.target.value) || 0)}
                  min={0}
                />
              </div>
            </div>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>LP Tokens Minted</TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold">{addResult.lpTokens.toFixed(4)}</span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Your Pool Share</TableCell>
                  <TableCell className="text-right">
                    {addResult.poolShare.toFixed(2)}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>New Reserve A</TableCell>
                  <TableCell className="text-right">
                    {addResult.newReserveA.toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>New Reserve B</TableCell>
                  <TableCell className="text-right">
                    {addResult.newReserveB.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Pool Share</p>
              <Progress value={addResult.poolShare} className="h-3" />
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">Remove Liquidity</p>
            <div>
              <Label>LP Tokens to Burn</Label>
              <Input
                type="number"
                value={lpAmount}
                onChange={(e) => setLpAmount(Number(e.target.value) || 0)}
                min={0}
                max={totalSupply}
              />
            </div>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Token A Received</TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold">{removeResult.amountA.toFixed(4)}</span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Token B Received</TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold">{removeResult.amountB.toFixed(4)}</span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Share Removed</TableCell>
                  <TableCell className="text-right">
                    {removeResult.shareRemoved.toFixed(2)}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Share Being Removed
              </p>
              <Progress value={removeResult.shareRemoved} className="h-3" />
            </div>
          </div>
        </div>
      )}

      <EducationPanel
        howItWorks={[
          {
            title: "Adding Liquidity",
            description:
              "Deposit equal-value amounts of both tokens. You receive LP tokens representing your pool share.",
          },
          {
            title: "LP Token Math",
            description:
              "LP tokens minted = min(amountA/reserveA, amountB/reserveB) * totalSupply. This ensures proportional deposits.",
          },
          {
            title: "Removing Liquidity",
            description:
              "Burn LP tokens to withdraw proportional amounts of both tokens from the pool.",
          },
        ]}
        whyItMatters="Liquidity providers earn trading fees proportional to their pool share. Understanding LP mechanics helps you evaluate risk vs reward before providing liquidity."
        tips={[
          "Always deposit tokens at the current pool ratio to avoid arbitrage losses",
          "LP tokens are transferable ERC-20 tokens themselves",
          "Impermanent loss can offset fee earnings — check the IL calculator",
        ]}
      />
    </div>
  );
}
