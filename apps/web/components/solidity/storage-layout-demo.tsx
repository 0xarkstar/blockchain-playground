"use client";

import { useState, useMemo, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  calculateStorageLayout,
  optimizeStorageLayout,
  getTypeSize,
  type SolidityStorageType,
  type StorageVariable,
} from "../../lib/solidity/storage";
import { SimplePieChart, EducationPanel } from "../../components/shared";

const TYPES: SolidityStorageType[] = [
  "uint8",
  "uint16",
  "uint32",
  "uint64",
  "uint128",
  "uint256",
  "int8",
  "int16",
  "int32",
  "int64",
  "int128",
  "int256",
  "bool",
  "address",
  "bytes1",
  "bytes2",
  "bytes4",
  "bytes8",
  "bytes16",
  "bytes32",
];

const SLOT_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-indigo-500",
];

interface VariableWithId extends StorageVariable {
  readonly id: number;
}

export function StorageLayoutDemo() {
  const nextId = useRef(4);
  const [variables, setVariables] = useState<VariableWithId[]>([
    { id: 0, name: "owner", type: "address" },
    { id: 1, name: "balance", type: "uint256" },
    { id: 2, name: "active", type: "bool" },
    { id: 3, name: "count", type: "uint8" },
  ]);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<SolidityStorageType>("uint256");
  const [showOptimized, setShowOptimized] = useState(false);

  const layout = useMemo(() => calculateStorageLayout(variables), [variables]);

  const optimized = useMemo(
    () => optimizeStorageLayout(variables),
    [variables],
  );

  const activeLayout = showOptimized ? optimized : layout;

  const efficiencyPieData = useMemo(() => {
    const used = activeLayout.usedBytes;
    const wasted = activeLayout.wastedBytes;
    if (used + wasted <= 0) return [];
    return [
      { name: "Used", value: used },
      { name: "Wasted", value: wasted },
    ];
  }, [activeLayout.usedBytes, activeLayout.wastedBytes]);

  const addVariable = () => {
    if (!newName.trim()) return;
    setVariables([
      ...variables,
      { id: nextId.current++, name: newName.trim(), type: newType },
    ]);
    setNewName("");
  };

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Add Variable</p>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Variable name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1"
            />
            <Select
              value={newType}
              onValueChange={(v) => setNewType(v as SolidityStorageType)}
            >
              <SelectTrigger id="storage-variable-type" className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addVariable}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">
              Variables ({variables.length})
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {variables.map((v, i) => (
                <TableRow key={v.id}>
                  <TableCell>{v.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{v.type}</Badge>
                  </TableCell>
                  <TableCell>{getTypeSize(v.type)} bytes</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Remove variable"
                      className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      onClick={() => removeVariable(i)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Storage Layout</p>
            <Button
              size="sm"
              variant={showOptimized ? "default" : "outline"}
              onClick={() => setShowOptimized(!showOptimized)}
            >
              {showOptimized ? "Showing Optimized" : "Show Optimized"}
            </Button>
          </div>

          {activeLayout.assignments.length > 0 && (
            <>
              {Array.from({ length: activeLayout.totalSlots }, (_, slotIdx) => {
                const slotAssignments = activeLayout.assignments.filter(
                  (a) => a.slotIndex === slotIdx,
                );
                const usedInSlot = slotAssignments.reduce(
                  (s, a) => s + a.size,
                  0,
                );
                const wastedInSlot = 32 - usedInSlot;

                return (
                  <div
                    key={slotIdx}
                    className="rounded-lg border border-border bg-card p-2"
                  >
                    <p className="text-xs text-muted-foreground mb-1">
                      Slot {slotIdx}
                    </p>
                    <div className="flex h-6 w-full overflow-hidden rounded-full">
                      {slotAssignments.map((a, i) => (
                        <div
                          key={a.variable.name}
                          className={`${SLOT_COLORS[i % SLOT_COLORS.length]} flex items-center justify-center text-xs text-white font-medium`}
                          style={{ width: `${(a.size / 32) * 100}%` }}
                        >
                          {a.variable.name} ({a.size}B)
                        </div>
                      ))}
                      {wastedInSlot > 0 && (
                        <div
                          className="bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium"
                          style={{ width: `${(wastedInSlot / 32) * 100}%` }}
                        >
                          {wastedInSlot}B
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {efficiencyPieData.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">
              Slot Packing Efficiency (
              {showOptimized ? "Optimized" : "Original"})
            </p>
            <SimplePieChart
              data={efficiencyPieData}
              nameKey="name"
              valueKey="value"
              height={200}
            />
            <p className="text-xs text-muted-foreground text-center">
              {activeLayout.efficiency.toFixed(1)}% of allocated storage is
              utilized
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Comparison</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead className="text-right">Original</TableHead>
                <TableHead className="text-right">Optimized</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Total Slots</TableCell>
                <TableCell className="text-right">
                  {layout.totalSlots}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="secondary"
                    className={
                      optimized.totalSlots < layout.totalSlots
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : ""
                    }
                  >
                    {optimized.totalSlots}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Used Bytes</TableCell>
                <TableCell className="text-right">
                  {layout.usedBytes}
                </TableCell>
                <TableCell className="text-right">
                  {optimized.usedBytes}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Wasted Bytes</TableCell>
                <TableCell className="text-right">
                  {layout.wastedBytes}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="secondary"
                    className={
                      optimized.wastedBytes < layout.wastedBytes
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : ""
                    }
                  >
                    {optimized.wastedBytes}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Efficiency</TableCell>
                <TableCell className="text-right">
                  {layout.efficiency.toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="secondary"
                    className={
                      optimized.efficiency > layout.efficiency
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : ""
                    }
                  >
                    {optimized.efficiency.toFixed(1)}%
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <EducationPanel
        howItWorks={[
          {
            title: "32-Byte Slots",
            description:
              "EVM storage is organized into 32-byte slots. Each SSTORE costs 20,000 gas (new) or 5,000 gas (update).",
          },
          {
            title: "Variable Packing",
            description:
              "Small variables (bool, uint8, address) can share a slot if they fit within 32 bytes together.",
          },
          {
            title: "Optimization",
            description:
              "Order variables by size (smallest first) to maximize packing. This can save entire storage slots.",
          },
        ]}
        whyItMatters="Storage is the most expensive resource on Ethereum. Packing variables efficiently can save thousands of gas per transaction, adding up to significant cost savings."
        tips={[
          "Group small variables together in your struct/contract declarations",
          "uint256 always takes a full slot — no packing benefit",
          "bool + uint8 + address = 1+1+20 = 22 bytes, fits in one slot",
          "Mappings and dynamic arrays always start a new slot",
        ]}
      />
    </div>
  );
}
