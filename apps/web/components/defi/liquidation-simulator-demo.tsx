"use client";

import { useState, useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { Slider } from "../ui/slider";
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
  calculateHealthFactor,
  calculateLiquidationPrice,
} from "../../lib/defi/lending";
import { EducationPanel } from "../../components/shared";

export function LiquidationSimulatorDemo() {
  const [initialPrice, setInitialPrice] = useState<number>(2000);
  const [currentPricePercent, setCurrentPricePercent] = useState<number>(100);
  const [collateralAmount, setCollateralAmount] = useState<number>(10);
  const [debtAmount, setDebtAmount] = useState<number>(12000);
  const [liquidationThreshold, setLiquidationThreshold] = useState<number>(0.8);
  const [liquidationBonus, setLiquidationBonus] = useState<number>(5);

  const currentPrice = (initialPrice * currentPricePercent) / 100;

  const result = useMemo(() => {
    const collateralValue = collateralAmount * currentPrice;
    const healthFactor = calculateHealthFactor(
      collateralValue,
      debtAmount,
      liquidationThreshold,
    );
    const liqPrice = calculateLiquidationPrice(
      debtAmount,
      collateralAmount,
      liquidationThreshold,
    );
    const liquidatable = isFinite(healthFactor) && healthFactor < 1;

    const bonusValue = liquidatable
      ? collateralValue * (liquidationBonus / 100)
      : 0;

    const priceDropToLiquidation =
      initialPrice > 0 ? ((initialPrice - liqPrice) / initialPrice) * 100 : 0;

    const collateralRatio =
      debtAmount > 0 ? (collateralValue / debtAmount) * 100 : Infinity;

    return {
      collateralValue,
      healthFactor,
      liqPrice,
      liquidatable,
      bonusValue,
      priceDropToLiquidation,
      collateralRatio,
    };
  }, [
    collateralAmount,
    currentPrice,
    debtAmount,
    liquidationThreshold,
    liquidationBonus,
    initialPrice,
  ]);

  const hfDisplay = isFinite(result.healthFactor)
    ? result.healthFactor.toFixed(3)
    : "∞";

  const hfColorClass = result.liquidatable
    ? "text-red-600"
    : result.healthFactor < 1.2
      ? "text-orange-600"
      : result.healthFactor < 1.5
        ? "text-yellow-600"
        : "text-green-600";

  const hfBadgeClass = result.liquidatable
    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    : result.healthFactor < 1.2
      ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      : result.healthFactor < 1.5
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";

  const hfProgressClass = result.liquidatable
    ? "[&>div]:bg-red-500"
    : result.healthFactor < 1.2
      ? "[&>div]:bg-orange-500"
      : result.healthFactor < 1.5
        ? "[&>div]:bg-yellow-500"
        : "[&>div]:bg-green-500";

  const gaugeColor =
    result.collateralRatio >= 150
      ? "green"
      : result.collateralRatio >= 125
        ? "yellow"
        : "red";

  const gaugeProgressClass =
    gaugeColor === "green"
      ? "[&>div]:bg-green-500"
      : gaugeColor === "yellow"
        ? "[&>div]:bg-yellow-500"
        : "[&>div]:bg-red-500";

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Position Setup</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Initial Collateral Price</Label>
              <Input
                type="number"
                value={initialPrice}
                onChange={(e) => setInitialPrice(Number(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div>
              <Label>Collateral Amount</Label>
              <Input
                type="number"
                value={collateralAmount}
                onChange={(e) => setCollateralAmount(Number(e.target.value) || 0)}
                min={0}
                step={0.0001}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Debt Amount (USD)</Label>
              <Input
                type="number"
                value={debtAmount}
                onChange={(e) => setDebtAmount(Number(e.target.value) || 0)}
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
          <div>
            <Label>Liquidation Bonus (%)</Label>
            <Input
              type="number"
              value={liquidationBonus}
              onChange={(e) => setLiquidationBonus(Number(e.target.value) || 0)}
              min={0}
              max={50}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Simulate Price Crash: ${currentPrice.toFixed(2)} (
            {currentPricePercent}% of initial)
          </p>
          <Slider
            value={[currentPricePercent]}
            onValueChange={([v]) => setCurrentPricePercent(v)}
            min={1}
            max={150}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
            <span>150%</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Collateral Ratio Gauge</p>
          <div className="relative">
            <Progress
              value={
                isFinite(result.collateralRatio)
                  ? Math.min(result.collateralRatio / 2, 100)
                  : 100
              }
              className={`h-8 ${gaugeProgressClass}`}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
              {isFinite(result.collateralRatio)
                ? `${result.collateralRatio.toFixed(0)}%`
                : "No Debt"}
            </span>
          </div>
          <div className="flex items-center justify-center gap-6">
            <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
              &lt;125% Danger
            </Badge>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
              125-150% Warning
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              &gt;150% Safe
            </Badge>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Position Status</p>
            <Badge variant="secondary" className={hfBadgeClass}>
              {result.liquidatable ? "Liquidatable" : "Safe"}
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
              className={`h-3 ${hfProgressClass}`}
            />
          </div>

          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Collateral Value</TableCell>
                <TableCell className="text-right">
                  $
                  {result.collateralValue.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Health Factor</TableCell>
                <TableCell className="text-right">
                  <span className={`font-semibold ${hfColorClass}`}>
                    {hfDisplay}
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Liquidation Trigger Price</TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold text-red-600">
                    ${result.liqPrice.toFixed(2)}
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Price Drop to Liquidation</TableCell>
                <TableCell className="text-right">
                  {result.priceDropToLiquidation.toFixed(1)}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {result.liquidatable && (
            <>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Position Liquidatable</AlertTitle>
                <AlertDescription>
                  Health factor is below 1.0. A liquidator can repay part of the
                  debt and claim collateral at a {liquidationBonus}% bonus.
                </AlertDescription>
              </Alert>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Liquidation Details</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Liquidation Bonus (Liquidator Profit)</TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-green-600">
                        ${result.bonusValue.toFixed(2)}
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </>
          )}
        </div>
      </div>

      <EducationPanel
        howItWorks={[
          {
            title: "Price Drop Simulation",
            description:
              "As collateral price drops, health factor decreases. When HF < 1, the position becomes liquidatable.",
          },
          {
            title: "Liquidation Process",
            description:
              "A liquidator repays part of the debt and receives collateral at a discount (liquidation bonus), typically 5-15%.",
          },
          {
            title: "Collateral Ratio",
            description:
              "The ratio of collateral value to debt. Below ~125% is dangerous territory. Most protocols require >150% for safety.",
          },
        ]}
        whyItMatters="Liquidations protect lending protocols from bad debt. Understanding liquidation mechanics helps you manage positions safely and avoid losing the liquidation bonus penalty."
        tips={[
          "Set price alerts for your collateral assets near the liquidation price",
          "Use stablecoins as collateral to reduce liquidation risk from price volatility",
          "Some protocols offer self-liquidation to avoid the bonus penalty",
        ]}
      />
    </div>
  );
}
