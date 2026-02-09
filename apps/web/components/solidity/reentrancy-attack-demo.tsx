"use client";

import { useState, useMemo } from "react";
import { Info } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  simulateReentrancyAttack,
  simulateWithReentrancyGuard,
  simulateChecksEffectsInteractions,
} from "../../lib/solidity/security";
import { EducationPanel } from "../../components/shared";

type Defense = "vulnerable" | "guard" | "cei";

const DEFENSES: { value: Defense; label: string }[] = [
  { value: "vulnerable", label: "Vulnerable" },
  { value: "guard", label: "ReentrancyGuard" },
  { value: "cei", label: "CEI Pattern" },
];

export function ReentrancyAttackDemo() {
  const [victimBalance, setVictimBalance] = useState<number>(100);
  const [attackerDeposit, setAttackerDeposit] = useState<number>(10);
  const [maxDepth, setMaxDepth] = useState<number>(5);
  const [defense, setDefense] = useState<Defense>("vulnerable");

  const simulation = useMemo(() => {
    switch (defense) {
      case "vulnerable":
        return simulateReentrancyAttack(
          victimBalance,
          attackerDeposit,
          maxDepth,
        );
      case "guard":
        return simulateWithReentrancyGuard(victimBalance, attackerDeposit);
      case "cei":
        return simulateChecksEffectsInteractions(
          victimBalance,
          attackerDeposit,
        );
    }
  }, [victimBalance, attackerDeposit, maxDepth, defense]);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Configuration</p>
          <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
            {DEFENSES.map((d) => (
              <Button
                key={d.value}
                variant={defense === d.value ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setDefense(d.value)}
              >
                {d.label}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Victim Balance (ETH)</Label>
              <Input
                type="number"
                value={victimBalance}
                onChange={(e) => setVictimBalance(Number(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div>
              <Label>Attacker Deposit (ETH)</Label>
              <Input
                type="number"
                value={attackerDeposit}
                onChange={(e) => setAttackerDeposit(Number(e.target.value) || 1)}
                min={1}
              />
            </div>
            {defense === "vulnerable" && (
              <div>
                <Label>Max Reentrancy Depth</Label>
                <Input
                  type="number"
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(Number(e.target.value) || 1)}
                  min={1}
                  max={10}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Result</p>
            <Badge
              className={`text-sm px-3 py-1 ${simulation.attackSuccessful ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}
            >
              {simulation.attackSuccessful
                ? "ATTACK SUCCESSFUL"
                : "ATTACK BLOCKED"}
            </Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead />
                <TableHead className="text-right">Before</TableHead>
                <TableHead className="text-right">After</TableHead>
                <TableHead className="text-right">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Victim Contract</TableCell>
                <TableCell className="text-right">
                  {simulation.initialBalances.victim} ETH
                </TableCell>
                <TableCell className="text-right">
                  {simulation.finalBalances.victim} ETH
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="secondary"
                    className={
                      simulation.finalBalances.victim <
                      simulation.initialBalances.victim
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        : ""
                    }
                  >
                    {simulation.finalBalances.victim -
                      simulation.initialBalances.victim}{" "}
                    ETH
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Attacker</TableCell>
                <TableCell className="text-right">
                  {simulation.initialBalances.attacker} ETH
                </TableCell>
                <TableCell className="text-right">
                  {simulation.finalBalances.attacker} ETH
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="secondary"
                    className={
                      simulation.attackerProfit > 0
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    }
                  >
                    {simulation.attackerProfit > 0 ? "+" : ""}
                    {simulation.attackerProfit} ETH
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          {simulation.totalReentrancyDepth > 0 && (
            <p className="text-xs text-muted-foreground">
              Reentrancy depth: {simulation.totalReentrancyDepth}
            </p>
          )}
        </div>
      </div>

      {simulation.totalReentrancyDepth > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">
              Re-Entry Depth Visualization
            </p>
            <div className="flex flex-col gap-1">
              {Array.from(
                { length: simulation.totalReentrancyDepth },
                (_, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border p-2 ${
                      i === simulation.totalReentrancyDepth - 1
                        ? "border-red-500 bg-red-50 dark:bg-red-950"
                        : "border-orange-300 bg-orange-50 dark:bg-orange-950"
                    }`}
                    style={{ marginLeft: i * 24 }}
                  >
                    <div className="flex items-center gap-1">
                      <Badge
                        className={`text-xs ${
                          i === simulation.totalReentrancyDepth - 1
                            ? "bg-red-600 text-white"
                            : "bg-orange-600 text-white"
                        }`}
                      >
                        Depth {i + 1}
                      </Badge>
                      <p className="text-xs">
                        {i === 0
                          ? "Initial withdraw() call"
                          : `Re-entrant withdraw() call #${i}`}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      )}

      {simulation.frames.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">Call Trace</p>
            <div className="flex flex-col gap-2 border-l-2 border-border pl-4">
              {simulation.frames.map((frame) => (
                <div key={frame.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-1 flex-wrap">
                    <Badge
                      className={`text-xs ${
                        frame.status === "reverted"
                          ? "bg-red-600 text-white"
                          : frame.status === "success"
                            ? "bg-green-600 text-white"
                            : "bg-yellow-600 text-white"
                      }`}
                    >
                      {frame.status}
                    </Badge>
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono" style={{ fontSize: 11 }}>
                      {frame.caller} → {frame.target}.{frame.functionName}()
                    </code>
                    {frame.ethValue > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {frame.ethValue} ETH
                      </Badge>
                    )}
                  </div>
                  <p
                    className="text-xs text-muted-foreground"
                    style={{ marginLeft: frame.depth * 16 }}
                  >
                    {"  ".repeat(frame.depth)}
                    {frame.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Alert
        className={
          defense === "vulnerable"
            ? "border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100"
            : "border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100"
        }
      >
        <Info className="h-4 w-4" />
        <AlertDescription>
          {defense === "vulnerable" && (
            <>
              <p className="font-semibold">Vulnerable Pattern</p>
              <p className="text-sm">
                The withdraw function sends ETH before updating the balance. The
                attacker&apos;s receive() function re-calls withdraw(), draining
                the contract.
              </p>
            </>
          )}
          {defense === "guard" && (
            <>
              <p className="font-semibold">ReentrancyGuard (OpenZeppelin)</p>
              <p className="text-sm">
                A mutex lock prevents re-entering the function. The second
                withdraw() call reverts because the lock is still held.
              </p>
            </>
          )}
          {defense === "cei" && (
            <>
              <p className="font-semibold">
                Checks-Effects-Interactions (CEI)
              </p>
              <p className="text-sm">
                Update state (set balance to 0) BEFORE sending ETH. When the
                attacker re-enters, the check fails because balance is already 0.
              </p>
            </>
          )}
        </AlertDescription>
      </Alert>

      <EducationPanel
        howItWorks={[
          {
            title: "The Attack",
            description:
              "Attacker deposits, then calls withdraw(). The victim sends ETH, triggering the attacker's receive(). The attacker re-calls withdraw() before state updates.",
          },
          {
            title: "ReentrancyGuard",
            description:
              "A boolean mutex (_locked) prevents re-entry. On function entry, lock is set. Any re-entrant call sees the lock and reverts.",
          },
          {
            title: "CEI Pattern",
            description:
              "Checks-Effects-Interactions: validate conditions, update state, THEN interact with external contracts. Re-entry finds state already updated.",
          },
        ]}
        whyItMatters="The DAO hack (2016, $60M) exploited reentrancy. It remains one of the most common smart contract vulnerabilities. Understanding it is essential for any Solidity developer."
        tips={[
          "Always use ReentrancyGuard or CEI pattern for functions that send ETH",
          "Use transfer() or send() instead of call() to limit gas forwarded",
          "Audit all external calls — any can trigger re-entry via fallback/receive",
        ]}
      />
    </div>
  );
}
