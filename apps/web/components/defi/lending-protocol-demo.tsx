"use client";

import { useState, useMemo } from "react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "../ui/table";
import {
  calculateHealthFactor,
  calculateMaxBorrow,
  calculateLiquidationPrice,
  calculateUtilizationRate,
} from "../../lib/defi/lending";
import { EducationPanel } from "../../components/shared";

function healthColor(hf: number): string {
  if (hf >= 2) return "text-green-600";
  if (hf >= 1.5) return "text-lime-600";
  if (hf >= 1.1) return "text-yellow-600";
  if (hf >= 1) return "text-orange-600";
  return "text-red-600";
}

function healthBadgeClass(hf: number): string {
  if (hf >= 2) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
  if (hf >= 1.5) return "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300";
  if (hf >= 1.1) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
  if (hf >= 1) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
  return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
}

function healthProgressColor(hf: number): string {
  if (hf >= 2) return "[&>div]:bg-green-500";
  if (hf >= 1.5) return "[&>div]:bg-lime-500";
  if (hf >= 1.1) return "[&>div]:bg-yellow-500";
  if (hf >= 1) return "[&>div]:bg-orange-500";
  return "[&>div]:bg-red-500";
}

function healthLabel(hf: number): string {
  if (!isFinite(hf)) return "Safe (No Debt)";
  if (hf >= 2) return "Healthy";
  if (hf >= 1.5) return "Moderate";
  if (hf >= 1.1) return "At Risk";
  if (hf >= 1) return "Danger";
  return "Liquidatable";
}

export function LendingProtocolDemo() {
  const [collateralAmount, setCollateralAmount] = useState<number>(10);
  const [collateralPrice, setCollateralPrice] = useState<number>(2000);
  const [borrowAmount, setBorrowAmount] = useState<number>(10000);
  const [liquidationThreshold, setLiquidationThreshold] = useState<number>(0.8);

  const result = useMemo(() => {
    const collateralValue = collateralAmount * collateralPrice;
    const healthFactor = calculateHealthFactor(
      collateralValue,
      borrowAmount,
      liquidationThreshold,
    );
    const maxBorrow = calculateMaxBorrow(collateralValue, liquidationThreshold);
    const liqPrice = calculateLiquidationPrice(
      borrowAmount,
      collateralAmount,
      liquidationThreshold,
    );
    const utilization = calculateUtilizationRate(borrowAmount, collateralValue);
    const collateralRatio =
      borrowAmount > 0 ? (collateralValue / borrowAmount) * 100 : Infinity;

    return {
      collateralValue,
      healthFactor,
      maxBorrow,
      liqPrice,
      utilization,
      collateralRatio,
    };
  }, [collateralAmount, collateralPrice, borrowAmount, liquidationThreshold]);

  const hfDisplay = isFinite(result.healthFactor)
    ? result.healthFactor.toFixed(2)
    : "∞";

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Collateral</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Amount (tokens)</Label>
              <Input
                type="number"
                value={collateralAmount}
                onChange={(e) => setCollateralAmount(Number(e.target.value) || 0)}
                min={0}
                step={0.0001}
              />
            </div>
            <div>
              <Label>Price (USD)</Label>
              <Input
                type="number"
                value={collateralPrice}
                onChange={(e) => setCollateralPrice(Number(e.target.value) || 0)}
                min={0}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Collateral Value: ${result.collateralValue.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Borrow</p>
          <div>
            <Label>Borrow Amount (USD)</Label>
            <Input
              type="number"
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(Number(e.target.value) || 0)}
              min={0}
            />
          </div>
          <div>
            <Label>Liquidation Threshold</Label>
            <Input
              type="number"
              value={liquidationThreshold}
              onChange={(e) => setLiquidationThreshold(Number(e.target.value) || 0)}
              min={0}
              max={1}
              step={0.05}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Position Health</p>
            <Badge variant="secondary" className={healthBadgeClass(result.healthFactor)}>
              {healthLabel(result.healthFactor)}
            </Badge>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Health Factor: {hfDisplay}
            </p>
            <Progress
              value={Math.min(
                isFinite(result.healthFactor) ? result.healthFactor * 50 : 100,
                100,
              )}
              className={`h-3 ${healthProgressColor(result.healthFactor)}`}
            />
          </div>

          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Health Factor</TableCell>
                <TableCell className="text-right">
                  <span className={`font-semibold ${healthColor(result.healthFactor)}`}>
                    {hfDisplay}
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Max Borrow</TableCell>
                <TableCell className="text-right">
                  ${result.maxBorrow.toLocaleString()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Collateral Ratio</TableCell>
                <TableCell className="text-right">
                  {isFinite(result.collateralRatio)
                    ? `${result.collateralRatio.toFixed(1)}%`
                    : "∞"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Liquidation Price</TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold text-red-600">
                    ${result.liqPrice.toFixed(2)}
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Utilization</TableCell>
                <TableCell className="text-right">
                  {(result.utilization * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <EducationPanel
        howItWorks={[
          {
            title: "Health Factor",
            description:
              "HF = (collateralValue * liquidationThreshold) / debtValue. When HF < 1, the position can be liquidated.",
          },
          {
            title: "Collateral Ratio",
            description:
              "The ratio of collateral value to borrowed value. Over-collateralization (>100%) is required in DeFi since there's no credit scoring.",
          },
          {
            title: "Liquidation",
            description:
              "When HF drops below 1, anyone can repay part of the debt and claim collateral at a discount (liquidation bonus).",
          },
        ]}
        whyItMatters="Lending protocols like Aave and Compound enable permissionless borrowing. Understanding health factors prevents unexpected liquidations that can cost you the liquidation bonus."
        tips={[
          "Keep health factor above 1.5 for a safety margin against volatility",
          "Monitor collateral price — a sudden drop can trigger liquidation",
          "Higher liquidation thresholds allow more borrowing but less safety margin",
        ]}
      />
    </div>
  );
}
