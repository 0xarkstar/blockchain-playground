"use client";

import { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  compareStorageVsMemory,
  comparePackedVsUnpacked,
  compareCallTypes,
  compareMappingVsArray,
  getGasConstantsTable,
} from "../../lib/solidity/gas";
import { SimpleBarChart, EducationPanel } from "../../components/shared";

const CATEGORIES = [
  { value: "storage-memory", label: "Storage vs Memory" },
  { value: "packed", label: "Packed Struct" },
  { value: "call-types", label: "Call Types" },
  { value: "mapping-array", label: "Mapping vs Array" },
];

export function GasOptimizerDemo() {
  const [category, setCategory] = useState("storage-memory");
  const [count, setCount] = useState<number>(5);

  const comparison = useMemo(() => {
    switch (category) {
      case "storage-memory":
        return compareStorageVsMemory(count);
      case "packed":
        return comparePackedVsUnpacked(count);
      case "call-types":
        return compareCallTypes(count);
      case "mapping-array":
        return compareMappingVsArray(count);
      default:
        return compareStorageVsMemory(count);
    }
  }, [category, count]);

  const gasConstants = useMemo(() => getGasConstantsTable(), []);

  const countLabel = (() => {
    switch (category) {
      case "storage-memory":
        return "Operation Count";
      case "packed":
        return "Field Count (uint8)";
      case "call-types":
        return "Data Size (bytes)";
      case "mapping-array":
        return "Element Count";
      default:
        return "Count";
    }
  })();

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Pattern Category</p>
          <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={category === cat.value ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setCategory(cat.value)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
          <div>
            <Label htmlFor="sol-gas-count">{countLabel}</Label>
            <Input
              id="sol-gas-count"
              type="number"
              value={count}
              onChange={(e) => setCount(Number(e.target.value) || 1)}
              min={1}
              max={1000}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Gas Comparison</p>
          <SimpleBarChart
            data={[
              {
                label: "Gas Used",
                unoptimized: comparison.unoptimized.totalGas,
                optimized: comparison.optimized.totalGas,
              },
            ]}
            xKey="label"
            yKeys={["unoptimized", "optimized"]}
            grouped
            height={200}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex flex-col gap-1 items-center">
                <p className="text-xs text-muted-foreground">
                  {comparison.unoptimized.label}
                </p>
                <p className="text-xl font-bold text-red-500 dark:text-red-400">
                  {comparison.unoptimized.totalGas.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">gas</p>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex flex-col gap-1 items-center">
                <p className="text-xs text-muted-foreground">
                  {comparison.optimized.label}
                </p>
                <p className="text-xl font-bold text-green-500 dark:text-green-400">
                  {comparison.optimized.totalGas.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">gas</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-sm px-3 py-1"
            >
              {comparison.savings.toLocaleString()} gas saved (
              {comparison.savingsPercent.toFixed(1)}%)
            </Badge>
          </div>

          <Progress value={100 - comparison.savingsPercent} className="h-3" />
          <p className="text-xs text-muted-foreground text-center">
            {comparison.explanation}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-red-500 dark:text-red-400">
              Unoptimized Breakdown
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operation</TableHead>
                  <TableHead className="text-right">Gas/Op</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparison.unoptimized.breakdown.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <p className="text-xs">{item.operation}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.gasPerOp.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                    <TableCell className="text-right">
                      {item.totalGas.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-green-500 dark:text-green-400">
              Optimized Breakdown
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operation</TableHead>
                  <TableHead className="text-right">Gas/Op</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparison.optimized.breakdown.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <p className="text-xs">{item.operation}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.gasPerOp.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                    <TableCell className="text-right">
                      {item.totalGas.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">EVM Gas Constants Reference</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opcode</TableHead>
                <TableHead className="text-right">Gas</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gasConstants.map((c) => (
                <TableRow key={c.name}>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {c.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {c.gas.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <p className="text-xs">{c.description}</p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <EducationPanel
        howItWorks={[
          {
            title: "Storage vs Memory",
            description:
              "SSTORE costs 20,000 gas vs MSTORE at 3 gas. Cache storage reads in memory variables for repeated access.",
          },
          {
            title: "Struct Packing",
            description:
              "Pack multiple small values into a single storage slot. Reading one slot is cheaper than reading multiple.",
          },
          {
            title: "Call Types",
            description:
              "CALL (2,600 base gas) vs STATICCALL (cheaper, read-only) vs DELEGATECALL (used by proxies, same gas as CALL).",
          },
        ]}
        whyItMatters="Gas optimization directly reduces user costs. A 50% gas reduction means 50% cheaper transactions. On Ethereum L1, this can save hundreds of dollars per complex transaction."
        tips={[
          "Use view/pure functions — they're free when called off-chain",
          "Prefer mappings over arrays for key-value lookups",
          "Use events instead of storage for data only needed off-chain",
          "Short-circuit conditions: put cheap checks before expensive ones",
        ]}
      />
    </div>
  );
}
