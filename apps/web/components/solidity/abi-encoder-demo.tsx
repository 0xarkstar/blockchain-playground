"use client";

import { useState, useMemo, useRef } from "react";
import { Plus, Trash2, Info } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
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
  TableRow,
} from "../ui/table";
import { encodeCalldata, type AbiParam } from "../../lib/solidity/abi";
import { EducationPanel } from "../../components/shared";

const PARAM_TYPES = ["uint256", "address", "bool", "bytes32", "uint8"];

interface ParamWithId extends AbiParam {
  readonly id: number;
}

export function AbiEncoderDemo() {
  const nextId = useRef(2);
  const [funcName, setFuncName] = useState("transfer");
  const [params, setParams] = useState<ParamWithId[]>([
    {
      id: 0,
      name: "to",
      type: "address",
      value: "0x0000000000000000000000000000000000000001",
    },
    { id: 1, name: "amount", type: "uint256", value: "1000" },
  ]);

  const result = useMemo(() => {
    try {
      return encodeCalldata(funcName, params);
    } catch {
      return null;
    }
  }, [funcName, params]);

  const addParam = () => {
    setParams([
      ...params,
      { id: nextId.current++, name: "", type: "uint256", value: "0" },
    ]);
  };

  const removeParam = (index: number) => {
    setParams(params.filter((_, i) => i !== index));
  };

  const updateParam = (
    index: number,
    field: keyof ParamWithId,
    value: string,
  ) => {
    setParams(
      params.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This encoder supports static types only: uint256, address, bool,
          bytes32, uint8. Dynamic types (string, bytes, arrays) require
          offset-based encoding.
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Function Definition</p>
          <div>
            <Label>Function Name</Label>
            <Input
              value={funcName}
              onChange={(e) => setFuncName(e.target.value)}
            />
          </div>
          <p className="text-xs font-semibold">Parameters</p>
          {params.map((param, i) => (
            <div key={param.id} className="flex items-end gap-2">
              <div className="w-[130px]">
                <Label>Type</Label>
                <Select
                  value={param.type}
                  onValueChange={(v) => updateParam(i, "type", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PARAM_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[120px]">
                <Label>Name</Label>
                <Input
                  value={param.name}
                  onChange={(e) => updateParam(i, "name", e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Label>Value</Label>
                <Input
                  value={param.value}
                  onChange={(e) => updateParam(i, "value", e.target.value)}
                />
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-500 hover:text-red-700"
                onClick={() => removeParam(i)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addParam}>
            <Plus className="h-4 w-4 mr-1" />
            Add Parameter
          </Button>
        </div>
      </div>

      {result && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">Encoded Result</p>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Function Signature</TableCell>
                  <TableCell className="text-right">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                      {result.functionSignature}
                    </code>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Selector (4 bytes)</TableCell>
                  <TableCell className="text-right">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {result.selector}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {result.encodedParams.length > 0 && (
              <>
                <p className="text-xs font-semibold">
                  Encoded Parameters (32-byte words)
                </p>
                {result.encodedParams.map((encoded, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      word {i}
                    </Badge>
                    <code
                      className="rounded bg-muted px-1.5 py-0.5 font-mono flex-1"
                      style={{ fontSize: 11 }}
                    >
                      {encoded}
                    </code>
                  </div>
                ))}
              </>
            )}

            <p className="text-xs font-semibold">Full Calldata (Color-Coded)</p>
            <div
              className="rounded-lg border border-border bg-card p-2 font-mono"
              style={{
                fontSize: 11,
                wordBreak: "break-all",
                lineHeight: 1.8,
              }}
            >
              <span className="bg-blue-100 dark:bg-blue-900/50 py-0.5">
                {result.selector}
              </span>
              {result.encodedParams.map((encoded, i) => {
                const colors = [
                  "bg-green-100 dark:bg-green-900/50",
                  "bg-orange-100 dark:bg-orange-900/50",
                  "bg-violet-100 dark:bg-violet-900/50",
                  "bg-cyan-100 dark:bg-cyan-900/50",
                  "bg-pink-100 dark:bg-pink-900/50",
                ];
                return (
                  <span key={i} className={`${colors[i % colors.length]} py-0.5`}>
                    {encoded.replace("0x", "")}
                  </span>
                );
              })}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Badge
                variant="secondary"
                className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              >
                Selector (4B)
              </Badge>
              {params.map((p, i) => {
                const badgeClasses = [
                  "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                  "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
                  "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300",
                  "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
                  "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
                ];
                return (
                  <Badge
                    key={p.id}
                    variant="secondary"
                    className={`text-xs ${badgeClasses[i % badgeClasses.length]}`}
                  >
                    {p.name || `param${i}`} (32B)
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <EducationPanel
        howItWorks={[
          {
            title: "Function Selector",
            description:
              "First 4 bytes of keccak256(signature). Identifies which function to call (e.g., 0xa9059cbb for transfer).",
          },
          {
            title: "Parameter Encoding",
            description:
              "Each parameter is padded to 32 bytes (256 bits). Addresses are left-padded with zeros, numbers are right-aligned.",
          },
          {
            title: "Calldata Assembly",
            description:
              "selector + encoded_param1 + encoded_param2 + ... Forms the complete transaction input data.",
          },
        ]}
        whyItMatters="ABI encoding is how your frontend talks to smart contracts. Understanding it helps debug failed transactions and verify contract interactions at the raw data level."
        tips={[
          "Function selectors can collide — different functions may share the same 4-byte selector",
          "Dynamic types (string, bytes, arrays) use offset-based encoding with pointers",
          "Tools like cast and Etherscan's decoder can parse calldata back to readable parameters",
        ]}
      />
    </div>
  );
}
