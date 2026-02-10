"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import {
  createPedersenParams,
  pedersenCommit,
  verifyPedersen,
  demonstrateHomomorphic,
  type PedersenCommitmentResult,
  type HomomorphicDemo,
} from "../../lib/zk/pedersen";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "../ui/table";

export function PedersenCommitmentDemo() {
  const params = createPedersenParams();
  const [value, setValue] = useState(5);
  const [randomness, setRandomness] = useState(3);
  const [commitment, setCommitment] = useState<PedersenCommitmentResult | null>(
    null,
  );
  const [verifyVal, setVerifyVal] = useState(5);
  const [verifyRand, setVerifyRand] = useState(3);
  const [verified, setVerified] = useState<boolean | null>(null);

  const [v1, setV1] = useState(3);
  const [r1, setR1] = useState(2);
  const [v2, setV2] = useState(4);
  const [r2, setR2] = useState(5);
  const [homoResult, setHomoResult] = useState<HomomorphicDemo | null>(null);

  const handleCommit = () => {
    setCommitment(pedersenCommit(params, BigInt(value), BigInt(randomness)));
    setVerified(null);
  };

  const handleVerify = () => {
    if (!commitment) return;
    setVerified(
      verifyPedersen(
        params,
        BigInt(verifyVal),
        BigInt(verifyRand),
        commitment.commitment,
      ),
    );
  };

  const handleHomomorphic = () => {
    setHomoResult(
      demonstrateHomomorphic(
        params,
        BigInt(v1),
        BigInt(r1),
        BigInt(v2),
        BigInt(r2),
      ),
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Pedersen commitment: C = g^v * h^r mod p. It is perfectly hiding
          (information-theoretically secure) and computationally binding. Unlike
          hash commitments, it supports homomorphic addition.
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">
            Parameters (p=23, subgroup order q=11)
          </p>
          <div className="flex items-center gap-4">
            <p className="text-sm">
              g = <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{params.g.toString()}</code>
            </p>
            <p className="text-sm">
              h = <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{params.h.toString()}</code>
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Create Commitment</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zk-pedersen-value">Value (v)</Label>
              <Input
                id="zk-pedersen-value"
                type="number"
                value={value}
                onChange={(e) => setValue(Number(e.target.value) || 0)}
                min={0}
                max={22}
              />
            </div>
            <div>
              <Label htmlFor="zk-pedersen-randomness">Randomness (r)</Label>
              <Input
                id="zk-pedersen-randomness"
                type="number"
                value={randomness}
                onChange={(e) => setRandomness(Number(e.target.value) || 0)}
                min={0}
                max={10}
              />
            </div>
          </div>
          <Button variant="secondary" onClick={handleCommit}>
            Commit
          </Button>
        </div>
      </div>

      {commitment && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">Commitment Result</p>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>g^v mod p</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{commitment.gPart.toString()}</code>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>h^r mod p</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{commitment.hPart.toString()}</code>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>C = g^v * h^r mod p</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono font-bold">{commitment.commitment.toString()}</code>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <p className="text-sm font-semibold mt-4">Verify</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zk-pedersen-verify-value">Value</Label>
                <Input
                  id="zk-pedersen-verify-value"
                  type="number"
                  value={verifyVal}
                  onChange={(e) => setVerifyVal(Number(e.target.value) || 0)}
                  min={0}
                  max={22}
                />
              </div>
              <div>
                <Label htmlFor="zk-pedersen-verify-rand">Randomness</Label>
                <Input
                  id="zk-pedersen-verify-rand"
                  type="number"
                  value={verifyRand}
                  onChange={(e) => setVerifyRand(Number(e.target.value) || 0)}
                  min={0}
                  max={10}
                />
              </div>
            </div>
            <Button variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300" onClick={handleVerify}>
              Verify
            </Button>
            {verified !== null && (
              <Badge
                variant="secondary"
                className={
                  verified
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                }
              >
                {verified ? "Valid" : "Invalid"}
              </Badge>
            )}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Homomorphic Property</p>
          <svg width="100%" height={100} viewBox="0 0 500 100">
            <rect
              x={10}
              y={25}
              width={100}
              height={50}
              rx={8}
              className="fill-blue-100 stroke-blue-500 dark:fill-blue-900 dark:stroke-blue-400"
              strokeWidth={1.5}
            />
            <text
              x={60}
              y={45}
              textAnchor="middle"
              fontSize={11}
              className="fill-blue-900 dark:fill-blue-200"
            >
              C(a)
            </text>
            <text
              x={60}
              y={62}
              textAnchor="middle"
              fontSize={10}
              className="fill-blue-700 dark:fill-blue-300"
            >
              g^a * h^r1
            </text>
            <text
              x={130}
              y={55}
              textAnchor="middle"
              fontSize={18}
              fontWeight={700}
              className="fill-muted-foreground"
            >
              +
            </text>
            <rect
              x={150}
              y={25}
              width={100}
              height={50}
              rx={8}
              className="fill-violet-100 stroke-violet-500 dark:fill-violet-900 dark:stroke-violet-400"
              strokeWidth={1.5}
            />
            <text
              x={200}
              y={45}
              textAnchor="middle"
              fontSize={11}
              className="fill-violet-900 dark:fill-violet-200"
            >
              C(b)
            </text>
            <text
              x={200}
              y={62}
              textAnchor="middle"
              fontSize={10}
              className="fill-violet-700 dark:fill-violet-300"
            >
              g^b * h^r2
            </text>
            <text
              x={270}
              y={55}
              textAnchor="middle"
              fontSize={18}
              fontWeight={700}
              className="fill-muted-foreground"
            >
              =
            </text>
            <rect
              x={290}
              y={25}
              width={180}
              height={50}
              rx={8}
              className="fill-green-100 stroke-green-500 dark:fill-green-900 dark:stroke-green-400"
              strokeWidth={1.5}
            />
            <text
              x={380}
              y={45}
              textAnchor="middle"
              fontSize={11}
              className="fill-green-900 dark:fill-green-200"
            >
              C(a+b)
            </text>
            <text
              x={380}
              y={62}
              textAnchor="middle"
              fontSize={10}
              className="fill-green-700 dark:fill-green-300"
            >
              g^(a+b) * h^(r1+r2)
            </text>
          </svg>
          <p className="text-sm text-muted-foreground">
            commit(v1, r1) * commit(v2, r2) = commit(v1+v2, r1+r2)
          </p>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="zk-pedersen-v1">v1</Label>
              <Input id="zk-pedersen-v1" type="number" value={v1} onChange={(e) => setV1(Number(e.target.value) || 0)} min={0} max={10} />
            </div>
            <div>
              <Label htmlFor="zk-pedersen-r1">r1</Label>
              <Input id="zk-pedersen-r1" type="number" value={r1} onChange={(e) => setR1(Number(e.target.value) || 0)} min={0} max={10} />
            </div>
            <div>
              <Label htmlFor="zk-pedersen-v2">v2</Label>
              <Input id="zk-pedersen-v2" type="number" value={v2} onChange={(e) => setV2(Number(e.target.value) || 0)} min={0} max={10} />
            </div>
            <div>
              <Label htmlFor="zk-pedersen-r2">r2</Label>
              <Input id="zk-pedersen-r2" type="number" value={r2} onChange={(e) => setR2(Number(e.target.value) || 0)} min={0} max={10} />
            </div>
          </div>
          <Button variant="secondary" className="bg-violet-100 text-violet-800 hover:bg-violet-200 dark:bg-violet-900 dark:text-violet-300" onClick={handleHomomorphic}>
            Demonstrate
          </Button>
        </div>
      </div>

      {homoResult && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">Homomorphic Result</p>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>C1 = commit(v1, r1)</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{homoResult.c1.commitment.toString()}</code>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>C2 = commit(v2, r2)</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{homoResult.c2.commitment.toString()}</code>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>C1 * C2 mod p</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{homoResult.product.toString()}</code>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>commit(v1+v2, r1+r2)</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{homoResult.combined.toString()}</code>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Badge
              variant="secondary"
              className={
                homoResult.matches
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
              }
            >
              {homoResult.matches
                ? "Match — homomorphism verified!"
                : "Mismatch"}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
