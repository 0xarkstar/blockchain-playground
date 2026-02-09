"use client";

import { useState, useMemo } from "react";
import { Info } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { EducationPanel } from "../../components/shared";

type VariableContext = "state" | "parameter" | "local" | "return";

interface LocationInfo {
  readonly location: string;
  readonly persistent: boolean;
  readonly mutable: boolean;
  readonly gasCost: string;
  readonly description: string;
}

const LOCATIONS: Record<string, LocationInfo> = {
  storage: {
    location: "storage",
    persistent: true,
    mutable: true,
    gasCost: "20,000 (write) / 2,100 (read)",
    description:
      "Persistent on-chain state. Survives function calls and transactions. Most expensive.",
  },
  memory: {
    location: "memory",
    persistent: false,
    mutable: true,
    gasCost: "3 (read/write) + expansion",
    description:
      "Temporary during function execution. Cleared after external call returns. Cheap for computation.",
  },
  calldata: {
    location: "calldata",
    persistent: false,
    mutable: false,
    gasCost: "4-16 per byte (input only)",
    description:
      "Read-only input data from the transaction. Cannot be modified. Cheapest for function parameters.",
  },
  stack: {
    location: "stack",
    persistent: false,
    mutable: true,
    gasCost: "2-3 (cheapest)",
    description:
      "EVM execution stack. Limited to 1024 depth, 16 accessible. Used for value types and locals.",
  },
};

function getRecommendation(
  context: VariableContext,
  dataType: string,
): {
  recommended: string;
  reason: string;
  alternatives: string[];
} {
  const isValueType = [
    "uint256",
    "address",
    "bool",
    "bytes32",
    "int256",
    "uint8",
  ].includes(dataType);
  const isReferenceType = [
    "struct",
    "array",
    "mapping",
    "string",
    "bytes",
  ].includes(dataType);

  if (context === "state") {
    return {
      recommended: "storage",
      reason:
        "State variables always live in storage — they persist across transactions.",
      alternatives: [],
    };
  }

  if (context === "parameter") {
    if (isValueType) {
      return {
        recommended: "stack",
        reason:
          "Value type parameters are copied to the stack. No explicit location needed.",
        alternatives: [],
      };
    }
    return {
      recommended: "calldata",
      reason:
        "Reference type parameters should use calldata (read-only) for cheapest gas. Use memory if modification needed.",
      alternatives: ["memory"],
    };
  }

  if (context === "local") {
    if (isValueType) {
      return {
        recommended: "stack",
        reason: "Local value types live on the stack automatically.",
        alternatives: [],
      };
    }
    if (isReferenceType) {
      return {
        recommended: "memory",
        reason:
          "Local reference types default to memory. Temporary and mutable.",
        alternatives: ["storage (reference to state)"],
      };
    }
  }

  if (context === "return") {
    if (isValueType) {
      return {
        recommended: "stack",
        reason: "Returned value types are passed via the stack.",
        alternatives: [],
      };
    }
    return {
      recommended: "memory",
      reason: "Returned reference types must be in memory.",
      alternatives: [],
    };
  }

  return {
    recommended: "memory",
    reason: "Default to memory for temporary data.",
    alternatives: [],
  };
}

const CONTEXTS: { value: VariableContext; label: string }[] = [
  { value: "state", label: "State Variable" },
  { value: "parameter", label: "Function Parameter" },
  { value: "local", label: "Local Variable" },
  { value: "return", label: "Return Value" },
];

const DATA_TYPES = [
  "uint256",
  "address",
  "bool",
  "bytes32",
  "int256",
  "uint8",
  "struct",
  "array",
  "mapping",
  "string",
  "bytes",
];

export function DataLocationsDemo() {
  const [context, setContext] = useState<VariableContext>("parameter");
  const [dataType, setDataType] = useState("array");

  const recommendation = useMemo(
    () => getRecommendation(context, dataType),
    [context, dataType],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Data Location Overview</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border border-border bg-red-50 dark:bg-red-950 p-3 text-center">
              <Badge className="bg-red-600 text-white mb-1">Storage</Badge>
              <p className="text-xs">Persistent on-chain</p>
              <p className="text-xs font-semibold">20,000 gas (write)</p>
              <p className="text-xs text-muted-foreground">State variables</p>
            </div>
            <div className="rounded-lg border border-border bg-blue-50 dark:bg-blue-950 p-3 text-center">
              <Badge className="bg-blue-600 text-white mb-1">Memory</Badge>
              <p className="text-xs">Temporary, mutable</p>
              <p className="text-xs font-semibold">3 gas (read/write)</p>
              <p className="text-xs text-muted-foreground">Local ref types</p>
            </div>
            <div className="rounded-lg border border-border bg-green-50 dark:bg-green-950 p-3 text-center">
              <Badge className="bg-green-600 text-white mb-1">Calldata</Badge>
              <p className="text-xs">Read-only input</p>
              <p className="text-xs font-semibold">4-16 gas/byte</p>
              <p className="text-xs text-muted-foreground">Function params</p>
            </div>
            <div className="rounded-lg border border-border bg-yellow-50 dark:bg-yellow-950 p-3 text-center">
              <Badge className="bg-yellow-600 text-white mb-1">Stack</Badge>
              <p className="text-xs">Cheapest, limited</p>
              <p className="text-xs font-semibold">2-3 gas</p>
              <p className="text-xs text-muted-foreground">Value types</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Variable Context</p>
          <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
            {CONTEXTS.map((ctx) => (
              <Button
                key={ctx.value}
                variant={context === ctx.value ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setContext(ctx.value)}
              >
                {ctx.label}
              </Button>
            ))}
          </div>
          <div>
            <Label>Data Type</Label>
            <Select value={dataType} onValueChange={(v) => setDataType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATA_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Recommendation</p>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold">
                Use: {recommendation.recommended}
              </p>
              <p className="text-sm">{recommendation.reason}</p>
              {recommendation.alternatives.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Alternatives: {recommendation.alternatives.join(", ")}
                </p>
              )}
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Location Comparison</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Persistent</TableHead>
                <TableHead>Mutable</TableHead>
                <TableHead>Gas Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(LOCATIONS).map((loc) => (
                <TableRow
                  key={loc.location}
                  className={
                    loc.location === recommendation.recommended
                      ? "bg-blue-50 dark:bg-blue-950/50"
                      : ""
                  }
                >
                  <TableCell>
                    <Badge
                      variant={
                        loc.location === recommendation.recommended
                          ? "default"
                          : "outline"
                      }
                    >
                      {loc.location}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${loc.persistent ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : ""}`}
                    >
                      {loc.persistent ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${loc.mutable ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"}`}
                    >
                      {loc.mutable ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs">{loc.gasCost}</p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Rules Summary</p>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    State vars
                  </Badge>
                </TableCell>
                <TableCell>Always storage (implicit)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    Value params
                  </Badge>
                </TableCell>
                <TableCell>Copied to stack (no keyword needed)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    Reference params
                  </Badge>
                </TableCell>
                <TableCell>
                  calldata (read-only) or memory (mutable) required
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    Local ref vars
                  </Badge>
                </TableCell>
                <TableCell>
                  memory (default) or storage (state reference)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    Mappings
                  </Badge>
                </TableCell>
                <TableCell>
                  Only in storage — cannot be in memory or calldata
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <EducationPanel
        howItWorks={[
          {
            title: "Storage",
            description:
              "Permanent on-chain state. Persists across transactions. Most expensive — 20,000 gas for first write, 5,000 for updates.",
          },
          {
            title: "Memory",
            description:
              "Temporary during function execution. Cleared when function returns. Linear gas cost with expansion.",
          },
          {
            title: "Calldata",
            description:
              "Immutable function input data. Read-only and cheapest for reference-type parameters. Use instead of memory when possible.",
          },
        ]}
        whyItMatters="Choosing the wrong data location is a common gas waste. Using calldata instead of memory for read-only parameters saves significant gas. Understanding locations prevents costly mistakes."
        tips={[
          "Use calldata for external function params you don't need to modify",
          "Memory arrays must be fixed-size at creation — no dynamic push",
          "Storage references in local variables point to state — modifying them changes state",
          "Stack is limited to 16 accessible slots — causes 'stack too deep' errors",
        ]}
      />
    </div>
  );
}
