"use client";

import { useState, useCallback, useMemo } from "react";
import { Plus, Trash2, Info } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  calculateTWAP,
  detectPriceDeviation,
  isHeartbeatStale,
  type PriceSnapshot,
} from "../../lib/defi/oracle";
import { SimpleLineChart, EducationPanel } from "../../components/shared";

export function OraclePriceFeedDemo() {
  const [snapshots, setSnapshots] = useState<readonly PriceSnapshot[]>([
    { price: 2000, timestamp: 0 },
    { price: 2010, timestamp: 60 },
    { price: 2005, timestamp: 120 },
    { price: 2020, timestamp: 180 },
    { price: 2015, timestamp: 240 },
  ]);
  const [newPrice, setNewPrice] = useState<number>(2025);
  const [deviationThreshold, setDeviationThreshold] = useState<number>(5);
  const [heartbeatInterval, setHeartbeatInterval] = useState<number>(300);

  const addSnapshot = useCallback(() => {
    const lastTimestamp =
      snapshots.length > 0 ? snapshots[snapshots.length - 1].timestamp : 0;
    setSnapshots([
      ...snapshots,
      { price: newPrice, timestamp: lastTimestamp + 60 },
    ]);
  }, [snapshots, newPrice]);

  const removeSnapshot = useCallback(
    (index: number) => {
      setSnapshots(snapshots.filter((_, i) => i !== index));
    },
    [snapshots],
  );

  const analysis = useMemo(() => {
    const twap = calculateTWAP(snapshots);
    const currentPrice =
      snapshots.length > 0 ? snapshots[snapshots.length - 1].price : 0;
    const lastUpdate =
      snapshots.length > 0 ? snapshots[snapshots.length - 1].timestamp : 0;
    const totalTime =
      snapshots.length > 1
        ? snapshots[snapshots.length - 1].timestamp - snapshots[0].timestamp
        : 0;

    const deviation = detectPriceDeviation(
      currentPrice,
      twap,
      deviationThreshold / 100,
    );
    const stale = isHeartbeatStale(
      lastUpdate,
      heartbeatInterval,
      totalTime + 120,
    );

    return { twap, currentPrice, deviation, stale, lastUpdate, totalTime };
  }, [snapshots, deviationThreshold, heartbeatInterval]);

  const priceChartData = useMemo(() => {
    const twap = analysis.twap;
    return snapshots.map((s) => ({
      time: `${s.timestamp}s`,
      price: s.price,
      TWAP: Math.round(twap * 100) / 100,
      upper: Math.round(twap * (1 + deviationThreshold / 100) * 100) / 100,
      lower: Math.round(twap * (1 - deviationThreshold / 100) * 100) / 100,
    }));
  }, [snapshots, analysis.twap, deviationThreshold]);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Price History</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Time (s)</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshots.map((s, i) => (
                <TableRow key={s.timestamp}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>${s.price.toFixed(2)}</TableCell>
                  <TableCell>{s.timestamp}s</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-600"
                      onClick={() => removeSnapshot(i)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(Number(e.target.value) || 0)}
              min={0}
              step={0.01}
              className="flex-1"
            />
            <Button size="sm" onClick={addSnapshot}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {priceChartData.length > 1 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">Price Feed Chart</p>
            <SimpleLineChart
              data={priceChartData}
              xKey="time"
              yKeys={["price", "TWAP", "upper", "lower"]}
              colors={["#228be6", "#fab005", "#fa5252", "#fa5252"]}
              height={250}
            />
            <p className="text-xs text-muted-foreground text-center">
              Price (blue) with TWAP (yellow) and deviation bands (red)
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Configuration</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Deviation Threshold (%)</Label>
              <Input
                type="number"
                value={deviationThreshold}
                onChange={(e) => setDeviationThreshold(Number(e.target.value) || 0)}
                min={0}
                max={100}
              />
            </div>
            <div>
              <Label>Heartbeat Interval (s)</Label>
              <Input
                type="number"
                value={heartbeatInterval}
                onChange={(e) => setHeartbeatInterval(Number(e.target.value) || 0)}
                min={0}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Analysis</p>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={
                analysis.deviation.deviated
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              }
            >
              {analysis.deviation.deviated ? "Price Deviated" : "Price Normal"}
            </Badge>
            <Badge
              variant="secondary"
              className={
                analysis.stale
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              }
            >
              {analysis.stale ? "Heartbeat Stale" : "Heartbeat Fresh"}
            </Badge>
          </div>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Current Price</TableCell>
                <TableCell className="text-right">
                  ${analysis.currentPrice.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>TWAP</TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold">${analysis.twap.toFixed(2)}</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Deviation from TWAP</TableCell>
                <TableCell className="text-right">
                  {(analysis.deviation.deviation * 100).toFixed(3)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>TWAP Window</TableCell>
                <TableCell className="text-right">{analysis.totalTime}s</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {analysis.deviation.deviated && (
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertTitle>Price Deviation Detected</AlertTitle>
              <AlertDescription>
                Current price deviates{" "}
                {(analysis.deviation.deviation * 100).toFixed(3)}% from TWAP,
                exceeding the {deviationThreshold}% threshold. This may indicate
                price manipulation or extreme volatility.
              </AlertDescription>
            </Alert>
          )}

          {analysis.stale && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Stale Heartbeat</AlertTitle>
              <AlertDescription>
                The oracle has not updated within the {heartbeatInterval}s
                heartbeat interval. Price data may be unreliable.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <EducationPanel
        howItWorks={[
          {
            title: "TWAP (Time-Weighted Average Price)",
            description:
              "Averages prices over time, weighting each price by the duration it was valid. Resistant to flash manipulation.",
          },
          {
            title: "Deviation Detection",
            description:
              "Compares current price to TWAP. Large deviations may indicate manipulation or extreme volatility.",
          },
          {
            title: "Heartbeat Monitoring",
            description:
              "Oracles must update within a heartbeat interval. Stale data means the price feed may be unreliable.",
          },
        ]}
        whyItMatters="Oracles are DeFi's connection to real-world data. Price manipulation through oracle attacks has caused hundreds of millions in losses. Understanding TWAP and deviation checks is critical for protocol security."
        tips={[
          "Chainlink is the most widely used decentralized oracle network",
          "TWAP oracles (like Uniswap v3) derive prices from on-chain liquidity",
          "Always check heartbeat freshness before using oracle prices",
        ]}
      />
    </div>
  );
}
