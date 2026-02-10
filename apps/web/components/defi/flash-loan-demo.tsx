"use client";

import { useState, useMemo } from "react";
import { Zap, Check, X } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "../ui/table";
import { simulateFlashLoan } from "../../lib/defi/flash-loan";
import { StepCard, EducationPanel } from "../../components/shared";

export function FlashLoanDemo() {
  const [borrowAmount, setBorrowAmount] = useState<number>(100000);
  const [feeRate, setFeeRate] = useState<number>(0.09);
  const [arbitrageProfit, setArbitrageProfit] = useState<number>(500);

  const result = useMemo(() => {
    return simulateFlashLoan(borrowAmount, feeRate / 100, arbitrageProfit);
  }, [borrowAmount, feeRate, arbitrageProfit]);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Flash Loan Parameters</p>
          <div>
            <Label htmlFor="defi-flash-borrow">Borrow Amount</Label>
            <Input
              id="defi-flash-borrow"
              type="number"
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(Number(e.target.value) || 0)}
              min={0}
            />
          </div>
          <div>
            <Label htmlFor="defi-flash-fee">Protocol Fee (%)</Label>
            <Input
              id="defi-flash-fee"
              type="number"
              value={feeRate}
              onChange={(e) => setFeeRate(Number(e.target.value) || 0)}
              min={0}
              max={100}
              step={0.01}
            />
          </div>
          <div>
            <Label htmlFor="defi-flash-profit">Arbitrage Profit (before fee)</Label>
            <Input
              id="defi-flash-profit"
              type="number"
              value={arbitrageProfit}
              onChange={(e) => setArbitrageProfit(Number(e.target.value) || 0)}
              min={0}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Transaction Simulation</p>
          <div className="flex items-center gap-4">
            {[
              {
                label: "Borrow",
                desc: `$${borrowAmount.toLocaleString()}`,
                icon: <Zap className="h-4 w-4" />,
                done: true,
              },
              {
                label: "Arbitrage",
                desc: `Profit: $${arbitrageProfit.toLocaleString()}`,
                icon: null,
                done: true,
              },
              {
                label: "Repay",
                desc: `$${result.repayAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
                icon: result.success ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />,
                done: result.success,
              },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    step.done
                      ? result.success
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : i < 2
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.icon ?? (i + 1)}
                </div>
                <div>
                  <p className="text-xs font-semibold">{step.label}</p>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
                {i < 2 && <div className="mx-2 h-px w-8 bg-border" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Result</p>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Borrow Amount</TableCell>
                <TableCell className="text-right">${borrowAmount.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Protocol Fee</TableCell>
                <TableCell className="text-right">
                  $
                  {(result.repayAmount - borrowAmount).toLocaleString(
                    undefined,
                    { maximumFractionDigits: 2 },
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Repay Amount</TableCell>
                <TableCell className="text-right">
                  $
                  {result.repayAmount.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Net Profit</TableCell>
                <TableCell className="text-right">
                  <span className={`font-semibold ${result.profit > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    $
                    {result.profit.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Flash Loan Steps</p>
          <StepCard
            stepNumber={1}
            title="Borrow"
            description={`Borrow $${borrowAmount.toLocaleString()} from the lending pool in a single transaction.`}
          />
          <StepCard
            stepNumber={2}
            title="Execute Strategy"
            description={`Execute arbitrage or liquidation. Expected profit: $${arbitrageProfit.toLocaleString()}.`}
          />
          <StepCard
            stepNumber={3}
            title="Repay"
            description={`Repay $${result.repayAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} (principal + fee). ${result.success ? "Transaction succeeds." : "REVERTS — insufficient funds."}`}
            isLast
          />
        </div>
      </div>

      <Alert variant={result.success ? "default" : "destructive"}>
        {result.success ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
        <AlertTitle>{result.success ? "Transaction Success" : "Transaction Reverted"}</AlertTitle>
        <AlertDescription>
          {result.success
            ? `Flash loan executed successfully. Net profit: $${result.profit.toFixed(2)} after repaying principal + fee.`
            : `Transaction reverted — arbitrage profit ($${arbitrageProfit}) is insufficient to cover the protocol fee ($${(result.repayAmount - borrowAmount).toFixed(2)}). In a real flash loan, the entire transaction would revert atomically.`}
        </AlertDescription>
      </Alert>

      <EducationPanel
        howItWorks={[
          {
            title: "Atomic Transaction",
            description:
              "Flash loans borrow and repay within a single transaction. If repayment fails, the entire transaction reverts as if it never happened.",
          },
          {
            title: "No Collateral Needed",
            description:
              "Because repayment is guaranteed by the atomic nature, no collateral is required — unique to blockchain.",
          },
          {
            title: "Use Cases",
            description:
              "Arbitrage between DEXs, liquidation of undercollateralized positions, collateral swaps, and self-liquidation.",
          },
        ]}
        whyItMatters="Flash loans democratize access to large capital for atomic operations. They enable capital-efficient strategies that were previously only available to well-funded traders."
        tips={[
          "Flash loan fees are typically 0.05-0.09% of the borrowed amount",
          "All operations must complete in a single transaction (one block)",
          "Failed flash loans cost only the gas fee — no capital is at risk",
        ]}
      />
    </div>
  );
}
