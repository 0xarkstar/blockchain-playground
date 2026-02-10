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
import { simulateCall, type CallContext } from "../../lib/solidity/evm";
import { EducationPanel } from "../../components/shared";

const CALL_TYPES: { value: CallContext["callType"]; label: string }[] = [
  { value: "call", label: "CALL" },
  { value: "delegatecall", label: "DELEGATECALL" },
  { value: "staticcall", label: "STATICCALL" },
];

export function ContractInteractionsDemo() {
  const [callType, setCallType] = useState<CallContext["callType"]>("call");
  const [from, setFrom] = useState("0xContractA");
  const [to, setTo] = useState("0xContractB");
  const [value, setValue] = useState<number>(0);

  const result = useMemo(
    () => simulateCall({ callType, from, to, value }),
    [callType, from, to, value],
  );

  const allResults = useMemo(
    () =>
      (["call", "delegatecall", "staticcall"] as const).map((ct) =>
        simulateCall({ callType: ct, from, to, value }),
      ),
    [from, to, value],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Inter-Contract Call Flow</p>
          <div className="rounded-lg border border-border bg-muted p-4 text-center">
            <div className="flex items-center gap-4 justify-center">
              <div className="rounded-lg border border-border bg-blue-100 dark:bg-blue-900 p-3 min-w-[100px] text-center">
                <p className="text-xs font-semibold">{from}</p>
                <p className="text-xs text-muted-foreground">Caller</p>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Badge
                  className={
                    callType === "call"
                      ? "bg-blue-600 dark:bg-blue-500 text-white"
                      : callType === "delegatecall"
                        ? "bg-violet-600 dark:bg-violet-500 text-white"
                        : "bg-cyan-600 dark:bg-cyan-500 text-white"
                  }
                >
                  {callType.toUpperCase()}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {value > 0 ? `${value} wei` : "no value"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-green-100 dark:bg-green-900 p-3 min-w-[100px] text-center">
                <p className="text-xs font-semibold">{to}</p>
                <p className="text-xs text-muted-foreground">Target</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Storage: {result.storageContext} | Code: {result.codeSource} |
              msg.sender: {result.msgSender}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Call Configuration</p>
          <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
            {CALL_TYPES.map((ct) => (
              <Button
                key={ct.value}
                variant={callType === ct.value ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setCallType(ct.value)}
              >
                {ct.label}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sol-interact-from">From (caller)</Label>
              <Input
                id="sol-interact-from"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sol-interact-to">To (target)</Label>
              <Input
                id="sol-interact-to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="sol-interact-value">Value (wei)</Label>
            <Input
              id="sol-interact-value"
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value) || 0)}
              min={0}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">{result.callType} Context</p>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>msg.sender</TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{result.msgSender}</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Storage Context</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                  >
                    {result.storageContext}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Code Source</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="secondary"
                    className="bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300"
                  >
                    {result.codeSource}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Value Transferred</TableCell>
                <TableCell className="text-right">
                  {result.valueTransferred} wei
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Can Modify State</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="secondary"
                    className={`${result.canModifyState ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"}`}
                  >
                    {result.canModifyState ? "Yes" : "No"}
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>{result.description}</AlertDescription>
          </Alert>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Side-by-Side Comparison</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>CALL</TableHead>
                <TableHead>DELEGATECALL</TableHead>
                <TableHead>STATICCALL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>msg.sender</TableCell>
                {allResults.map((r, i) => (
                  <TableCell key={i}>
                    <p className="text-xs">{r.msgSender}</p>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Storage</TableCell>
                {allResults.map((r, i) => (
                  <TableCell key={i}>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    >
                      {r.storageContext}
                    </Badge>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Code</TableCell>
                {allResults.map((r, i) => (
                  <TableCell key={i}>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300"
                    >
                      {r.codeSource}
                    </Badge>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Value</TableCell>
                {allResults.map((r, i) => (
                  <TableCell key={i}>
                    <p className="text-xs">{r.valueTransferred}</p>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>State Mutable</TableCell>
                {allResults.map((r, i) => (
                  <TableCell key={i}>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${r.canModifyState ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"}`}
                    >
                      {r.canModifyState ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {callType === "delegatecall" && (
        <Alert className="border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100">
          <Info className="h-4 w-4" />
          <AlertDescription>
            DELEGATECALL is used by proxy contracts. The target&apos;s code runs
            with the caller&apos;s storage, so storage layout must match between
            proxy and implementation.
          </AlertDescription>
        </Alert>
      )}

      <EducationPanel
        howItWorks={[
          {
            title: "CALL",
            description:
              "Standard external call. Target's code runs with target's storage. msg.sender = caller contract.",
          },
          {
            title: "DELEGATECALL",
            description:
              "Target's code runs with CALLER's storage and context. Used by proxy patterns for upgradeable contracts.",
          },
          {
            title: "STATICCALL",
            description:
              "Read-only call that reverts on any state modification. Used for view/pure function calls.",
          },
        ]}
        whyItMatters="Understanding call types is essential for proxy patterns and cross-contract composability. DELEGATECALL enables upgradeability but introduces storage layout risks."
        tips={[
          "Always use interfaces for type-safe external calls",
          "DELEGATECALL storage layout must match between proxy and implementation",
          "Use STATICCALL for oracle reads to prevent unexpected state changes",
        ]}
      />
    </div>
  );
}
