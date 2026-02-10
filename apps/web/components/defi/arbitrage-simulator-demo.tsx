"use client";

import { useState, useMemo } from "react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "../ui/table";
import { calculateArbitrageProfit } from "../../lib/defi/flash-loan";
import { SimpleBarChart, EducationPanel } from "../../components/shared";

export function ArbitrageSimulatorDemo() {
  const [priceA, setPriceA] = useState<number>(2000);
  const [priceB, setPriceB] = useState<number>(2050);
  const [tradeAmount, setTradeAmount] = useState<number>(10000);
  const [gasCost, setGasCost] = useState<number>(15);

  const result = useMemo(() => {
    const profitBeforeGas = calculateArbitrageProfit(
      priceA,
      priceB,
      tradeAmount,
      0,
    );
    const profitAfterGas = calculateArbitrageProfit(
      priceA,
      priceB,
      tradeAmount,
      gasCost,
    );
    const spreadPercent =
      priceA > 0 && priceB > 0
        ? (Math.abs(priceA - priceB) / Math.min(priceA, priceB)) * 100
        : 0;

    return {
      profitBeforeGas,
      profitAfterGas,
      profitable: profitAfterGas > 0,
      spreadPercent,
      buyPool: priceA <= priceB ? "A" : "B",
      sellPool: priceA <= priceB ? "B" : "A",
    };
  }, [priceA, priceB, tradeAmount, gasCost]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Pool A</p>
              {result.buyPool === "A" && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Buy Here
                </Badge>
              )}
              {result.sellPool === "A" && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  Sell Here
                </Badge>
              )}
            </div>
            <div>
              <Label htmlFor="defi-arb-priceA">Token Price (USD)</Label>
              <Input
                id="defi-arb-priceA"
                type="number"
                value={priceA}
                onChange={(e) => setPriceA(Number(e.target.value) || 0)}
                min={0}
                step={0.01}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Pool B</p>
              {result.buyPool === "B" && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Buy Here
                </Badge>
              )}
              {result.sellPool === "B" && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  Sell Here
                </Badge>
              )}
            </div>
            <div>
              <Label htmlFor="defi-arb-priceB">Token Price (USD)</Label>
              <Input
                id="defi-arb-priceB"
                type="number"
                value={priceB}
                onChange={(e) => setPriceB(Number(e.target.value) || 0)}
                min={0}
                step={0.01}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Trade Parameters</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defi-arb-tradeAmount">Trade Amount (USD)</Label>
              <Input
                id="defi-arb-tradeAmount"
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(Number(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div>
              <Label htmlFor="defi-arb-gasCost">Gas Cost (USD)</Label>
              <Input
                id="defi-arb-gasCost"
                type="number"
                value={gasCost}
                onChange={(e) => setGasCost(Number(e.target.value) || 0)}
                min={0}
                step={0.01}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Result</p>
            <Badge
              variant="secondary"
              className={
                result.profitable
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
              }
            >
              {result.profitable ? "Profitable" : "Unprofitable"}
            </Badge>
          </div>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Price Spread</TableCell>
                <TableCell className="text-right">
                  {result.spreadPercent.toFixed(3)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Strategy</TableCell>
                <TableCell className="text-right">
                  Buy on Pool {result.buyPool}, Sell on Pool {result.sellPool}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Profit (before gas)</TableCell>
                <TableCell className="text-right">
                  ${result.profitBeforeGas.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Gas Cost</TableCell>
                <TableCell className="text-right">-${gasCost.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Net Profit</TableCell>
                <TableCell className="text-right">
                  <span className={`font-semibold ${result.profitable ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    ${result.profitAfterGas.toFixed(2)}
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Price Comparison</p>
          <SimpleBarChart
            data={[
              { pool: "Pool A", price: priceA },
              { pool: "Pool B", price: priceB },
            ]}
            xKey="pool"
            yKeys={["price"]}
            grouped
            height={200}
          />
          <p className="text-xs text-muted-foreground text-center">
            Price spread: {result.spreadPercent.toFixed(3)}% —{" "}
            {result.profitable
              ? "Profitable after gas"
              : "Unprofitable after gas"}
          </p>
        </div>
      </div>

      <EducationPanel
        howItWorks={[
          {
            title: "Spot the Spread",
            description:
              "Find the same token priced differently on two exchanges. Buy low on one, sell high on the other.",
          },
          {
            title: "Calculate Profitability",
            description:
              "Profit = (priceDiff / buyPrice) * tradeAmount - gasCost. Must exceed gas to be worthwhile.",
          },
          {
            title: "Execute Atomically",
            description:
              "Use flash loans to execute both legs in a single transaction, eliminating capital requirements and execution risk.",
          },
        ]}
        whyItMatters="Arbitrageurs keep prices consistent across DeFi protocols. They're essential for market efficiency — when prices diverge, arbs bring them back in line."
        tips={[
          "MEV (Maximal Extractable Value) bots compete for the same opportunities",
          "Gas costs on Ethereum L1 often exceed small arbitrage profits",
          "L2s and alternative chains offer lower gas for smaller arb opportunities",
        ]}
      />
    </div>
  );
}
