"use client";

import { useState, useMemo } from "react";
import { Info } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
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
  createERC20,
  mint,
  approve,
  transferFrom,
  balanceOf,
  type ERC20State,
} from "../../lib/tokens/erc20";

export function TokenAllowanceDemo() {
  const [state, setState] = useState<ERC20State>(() => {
    let s = createERC20("TestToken", "TT", 0);
    s = mint(s, "owner", BigInt(10000)).newState;
    return s;
  });

  const [approveSpender, setApproveSpender] = useState("spender");
  const [approveAmount, setApproveAmount] = useState(500);
  const [tfSpender, setTfSpender] = useState("spender");
  const [tfFrom, setTfFrom] = useState("owner");
  const [tfTo, setTfTo] = useState("recipient");
  const [tfAmount, setTfAmount] = useState(200);
  const [lastMessage, setLastMessage] = useState("owner starts with 10,000 TT");

  const addresses = useMemo(() => {
    return Array.from(new Set(Object.keys(state.balances)));
  }, [state.balances]);

  const handleApprove = () => {
    const result = approve(
      state,
      "owner",
      approveSpender,
      BigInt(approveAmount),
    );
    setState(result.newState);
    setLastMessage(result.message);
  };

  const handleTransferFrom = () => {
    const result = transferFrom(
      state,
      tfSpender,
      tfFrom,
      tfTo,
      BigInt(tfAmount),
    );
    setState(result.newState);
    setLastMessage(result.message);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Step 1: Owner Approves Spender
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tok-allow-spender">Spender</Label>
              <Input
                id="tok-allow-spender"
                value={approveSpender}
                onChange={(e) => setApproveSpender(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tok-allow-amount">Amount</Label>
              <Input
                id="tok-allow-amount"
                type="number"
                value={approveAmount}
                onChange={(e) => setApproveAmount(Number(e.target.value) || 0)}
                min={0}
              />
            </div>
          </div>
          <Button variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:hover:bg-orange-800" onClick={handleApprove}>
            Approve
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Step 2: Spender Transfers From Owner
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="tok-allow-tfSpender">Spender</Label>
              <Input
                id="tok-allow-tfSpender"
                value={tfSpender}
                onChange={(e) => setTfSpender(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tok-allow-tfFrom">From</Label>
              <Input
                id="tok-allow-tfFrom"
                value={tfFrom}
                onChange={(e) => setTfFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tok-allow-tfTo">To</Label>
              <Input
                id="tok-allow-tfTo"
                value={tfTo}
                onChange={(e) => setTfTo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tok-allow-tfAmount">Amount</Label>
              <Input
                id="tok-allow-tfAmount"
                type="number"
                value={tfAmount}
                onChange={(e) => setTfAmount(Number(e.target.value) || 0)}
                min={1}
              />
            </div>
          </div>
          <Button variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800" onClick={handleTransferFrom}>
            Transfer From
          </Button>
        </div>
      </div>

      {lastMessage && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>{lastMessage}</AlertDescription>
        </Alert>
      )}

      {Object.keys(state.allowances).length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">
              Approval Flow
            </p>
            <svg
              width="100%"
              height={
                80 *
                Object.entries(state.allowances).reduce(
                  (sum, [, spenders]) => sum + Object.keys(spenders).length,
                  0,
                )
              }
              viewBox={`0 0 500 ${
                80 *
                Object.entries(state.allowances).reduce(
                  (sum, [, spenders]) => sum + Object.keys(spenders).length,
                  0,
                )
              }`}
              style={{ maxHeight: 300 }}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="10"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    className="fill-orange-500"
                  />
                </marker>
              </defs>
              {Object.entries(state.allowances).flatMap(([owner, spenders]) => {
                let rowIdx = 0;
                for (const entries of Object.entries(state.allowances)) {
                  if (entries[0] === owner) break;
                  rowIdx += Object.keys(entries[1]).length;
                }
                return Object.entries(spenders).map(([spender, amount], si) => {
                  const y = 40 + (rowIdx + si) * 80;
                  return (
                    <g key={`${owner}-${spender}`}>
                      <rect
                        x={20}
                        y={y - 18}
                        width={120}
                        height={36}
                        rx={6}
                        className="fill-blue-100 stroke-blue-500 dark:fill-blue-900 dark:stroke-blue-400"
                        strokeWidth={1}
                      />
                      <text
                        x={80}
                        y={y + 5}
                        textAnchor="middle"
                        fontSize={13}
                        className="fill-blue-800 dark:fill-blue-200"
                      >
                        {owner}
                      </text>
                      <line
                        x1={140}
                        y1={y}
                        x2={340}
                        y2={y}
                        className="stroke-orange-500"
                        strokeWidth={2}
                        markerEnd="url(#arrowhead)"
                      />
                      <text
                        x={240}
                        y={y - 8}
                        textAnchor="middle"
                        fontSize={11}
                        className="fill-orange-600 dark:fill-orange-400"
                      >
                        Limit: {amount.toString()}
                      </text>
                      <rect
                        x={350}
                        y={y - 18}
                        width={120}
                        height={36}
                        rx={6}
                        className="fill-green-100 stroke-green-500 dark:fill-green-900 dark:stroke-green-400"
                        strokeWidth={1}
                      />
                      <text
                        x={410}
                        y={y + 5}
                        textAnchor="middle"
                        fontSize={13}
                        className="fill-green-800 dark:fill-green-200"
                      >
                        {spender}
                      </text>
                    </g>
                  );
                });
              })}
            </svg>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Balances</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addresses.map((addr) => (
                <TableRow key={addr}>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{addr}</code>
                  </TableCell>
                  <TableCell className="text-right">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{balanceOf(state, addr).toString()}</code>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Allowances</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Owner</TableHead>
                <TableHead>Spender</TableHead>
                <TableHead className="text-right">Allowance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(state.allowances).flatMap(([owner, spenders]) =>
                Object.entries(spenders).map(([spender, amount]) => (
                  <TableRow key={`${owner}-${spender}`}>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{owner}</code>
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{spender}</code>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="secondary"
                        className={
                          amount > BigInt(0)
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                        }
                      >
                        {amount.toString()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )),
              )}
              {Object.keys(state.allowances).length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    <p className="text-sm text-muted-foreground">
                      No allowances set
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
