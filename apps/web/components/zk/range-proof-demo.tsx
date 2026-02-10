"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { createPedersenParams } from "../../lib/zk/pedersen";
import {
  constructRangeProof,
  verifyRangeProof,
  decomposeToBits,
  type RangeProof,
} from "../../lib/zk/range-proof";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export function RangeProofDemo() {
  const params = createPedersenParams();
  const [value, setValue] = useState(5);
  const [numBits, setNumBits] = useState(4);
  const [proof, setProof] = useState<RangeProof | null>(null);

  const handleProve = () => {
    setProof(constructRangeProof(params, BigInt(value), numBits));
  };

  const maxValue = (1 << numBits) - 1;
  const bits = decomposeToBits(
    BigInt(Math.max(0, Math.min(value, maxValue))),
    numBits,
  );

  return (
    <div className="flex flex-col gap-6">
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Range proof: prove a committed value is in [0, 2^n) without revealing
          it. The value is decomposed into bits, each committed separately. The
          verifier checks each bit is 0 or 1, and the product reconstructs the
          original commitment.
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Configure</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zk-range-value">{`Value (range: 0 to ${maxValue})`}</Label>
              <Input
                id="zk-range-value"
                type="number"
                value={value}
                onChange={(e) => setValue(Number(e.target.value) ?? 0)}
                min={-1}
                max={maxValue + 1}
              />
            </div>
            <div>
              <Label htmlFor="zk-range-bits">Bit width (n)</Label>
              <Input
                id="zk-range-bits"
                type="number"
                value={numBits}
                onChange={(e) => setNumBits(Number(e.target.value) || 1)}
                min={1}
                max={8}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Binary: {bits.slice().reverse().join("")} (value {value}, {numBits}
            -bit)
          </p>
          <div className="flex items-center gap-1 justify-center">
            {bits
              .slice()
              .reverse()
              .map((bit, i) => {
                const pos = numBits - 1 - i;
                return (
                  <div
                    key={i}
                    className={`rounded-lg border p-2 text-center min-w-[52px] ${
                      bit === 1
                        ? "bg-blue-50 border-blue-500 dark:bg-blue-900 dark:border-blue-400"
                        : "bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <p className="text-xs text-muted-foreground">
                        2^{pos}
                      </p>
                      <p className={`text-lg font-bold ${bit === 1 ? "text-blue-600 dark:text-blue-400" : "text-gray-500"}`}>
                        {bit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ={1 << pos}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
          <Button variant="secondary" onClick={handleProve}>
            Generate Range Proof
          </Button>
        </div>
      </div>

      {proof && (
        <>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Proof Result</p>
                <Badge
                  variant="secondary"
                  className={
                    proof.valid
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  }
                >
                  {proof.valid
                    ? "Valid — value in range"
                    : "Invalid — value out of range"}
                </Badge>
              </div>
              {proof.valid && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bit Position</TableHead>
                      <TableHead>Bit Value</TableHead>
                      <TableHead>Commitment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proof.bitCommitments.map((bc) => (
                      <TableRow key={bc.bitPosition}>
                        <TableCell>2^{bc.bitPosition}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              bc.bit === 1
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                : ""
                            }
                          >
                            {bc.bit}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{bc.commitment.commitment.toString()}</code>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          {proof.valid && (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold">Verification</p>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Total commitment</TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{proof.totalCommitment.toString()}</code>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Reconstructed from bits</TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{proof.reconstructed.toString()}</code>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Match</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            verifyRangeProof(proof)
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }
                        >
                          {verifyRangeProof(proof) ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
