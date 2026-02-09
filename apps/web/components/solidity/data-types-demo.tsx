"use client";

import { useState, useMemo } from "react";
import { Info } from "lucide-react";
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
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  getSolidityTypeInfo,
  encodeValue,
  getAllSolidityTypes,
} from "../../lib/solidity/types";
import { SimpleBarChart, EducationPanel } from "../../components/shared";

export function DataTypesDemo() {
  const allTypes = useMemo(() => getAllSolidityTypes(), []);
  const typeNames = useMemo(() => allTypes.map((t) => t.name), [allTypes]);

  const sizeChartData = useMemo(() => {
    const representative = [
      "bool",
      "uint8",
      "uint16",
      "uint32",
      "uint64",
      "uint128",
      "uint256",
      "address",
      "bytes32",
    ];
    return representative
      .map((name) => {
        const info = getSolidityTypeInfo(name);
        return info ? { type: name, bytes: info.size } : null;
      })
      .filter((d): d is { type: string; bytes: number } => d !== null);
  }, []);

  const [selectedType, setSelectedType] = useState("uint256");
  const [inputValue, setInputValue] = useState("42");

  const typeInfo = useMemo(
    () => getSolidityTypeInfo(selectedType),
    [selectedType],
  );

  const encoded = useMemo(
    () => encodeValue(inputValue, selectedType),
    [inputValue, selectedType],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Input</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Solidity Type</Label>
              <Select
                value={selectedType}
                onValueChange={(v) => {
                  setSelectedType(v);
                  const info = getSolidityTypeInfo(v);
                  setInputValue(info?.defaultValue ?? "0");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeNames.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {typeInfo && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">Type Info</p>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{typeInfo.category}</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Size</TableCell>
                  <TableCell className="text-right">
                    {typeInfo.size} bytes ({typeInfo.bits} bits)
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Signed</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="secondary"
                      className={
                        typeInfo.signed
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          : ""
                      }
                    >
                      {typeInfo.signed ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Min</TableCell>
                  <TableCell className="text-right">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono" style={{ fontSize: 11 }}>
                      {typeInfo.min.length > 40
                        ? typeInfo.min.slice(0, 20) + "..."
                        : typeInfo.min}
                    </code>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Max</TableCell>
                  <TableCell className="text-right">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono" style={{ fontSize: 11 }}>
                      {typeInfo.max.length > 40
                        ? typeInfo.max.slice(0, 20) + "..."
                        : typeInfo.max}
                    </code>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Encoded Value</p>
          {encoded.valid ? (
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Hex</TableCell>
                  <TableCell className="text-right">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                      {encoded.hex}
                    </code>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Padded (32 bytes)</TableCell>
                  <TableCell className="text-right">
                    <code
                      className="rounded bg-muted px-1.5 py-0.5 font-mono"
                      style={{ fontSize: 11, wordBreak: "break-all" }}
                    >
                      {encoded.paddedHex}
                    </code>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Decimal</TableCell>
                  <TableCell className="text-right">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                      {encoded.decimal}
                    </code>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertDescription>{encoded.error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Memory Size Comparison</p>
          <SimpleBarChart
            data={sizeChartData}
            xKey="type"
            yKeys={["bytes"]}
            colors={["#7950f2"]}
            height={220}
          />
          <p className="text-xs text-muted-foreground text-center">
            Bytes required per type. All types pad to 32 bytes in ABI encoding.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">All Types Reference</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="text-right">Bits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allTypes.map((t) => (
                <TableRow key={t.name}>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                      {t.name}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {t.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{t.size}B</TableCell>
                  <TableCell className="text-right">{t.bits}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <EducationPanel
        howItWorks={[
          {
            title: "Value Types",
            description:
              "uint, int, bool, address, bytes1-32 — stored directly on stack or in storage. Always passed by value (copied).",
          },
          {
            title: "Reference Types",
            description:
              "arrays, structs, mappings, string, bytes — stored in storage/memory. Passed by reference with explicit location.",
          },
          {
            title: "ABI Encoding",
            description:
              "All values are padded to 32-byte words for encoding. A bool uses 1 byte but occupies 32 bytes in calldata.",
          },
        ]}
        whyItMatters="Choosing the right data type directly impacts gas costs and contract security. Using uint8 instead of uint256 for small values enables storage packing."
        tips={[
          "Use uint256 for arithmetic — smaller types require extra gas for masking",
          "Use bytes32 instead of string for fixed-length strings (much cheaper)",
          "address payable is needed to send ETH; regular address cannot",
        ]}
      />
    </div>
  );
}
