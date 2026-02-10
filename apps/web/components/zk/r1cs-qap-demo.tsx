"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import {
  parseExpression,
  gatesToR1CS,
  computeWitness,
} from "../../lib/zk/circuit";
import {
  r1csToQAP,
  verifyQAP,
  formatPolynomial,
  evaluatePolynomial,
  type QAPVerification,
} from "../../lib/zk/polynomial";
import { SimpleLineChart } from "../shared";
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

export function R1CSQAPDemo() {
  const [expression, setExpression] = useState("x * y");
  const [xVal, setXVal] = useState(3);
  const [yVal, setYVal] = useState(4);
  const [zVal, setZVal] = useState(0);
  const [qapResult, setQapResult] = useState<QAPVerification | null>(null);
  const [wireNames, setWireNames] = useState<readonly string[]>([]);
  const [polys, setPolys] = useState<{
    Ai: readonly (readonly bigint[])[];
    Bi: readonly (readonly bigint[])[];
    Ci: readonly (readonly bigint[])[];
    target: readonly bigint[];
  } | null>(null);
  const p = 23n;

  const handleRun = () => {
    const gates = parseExpression(expression);
    if (gates.length === 0) return;

    const vars = new Set<string>();
    for (const g of gates) {
      if (!/^\d+$/.test(g.left) && !g.left.startsWith("_")) vars.add(g.left);
      if (!/^\d+$/.test(g.right) && !g.right.startsWith("_")) vars.add(g.right);
    }
    const inputs: Record<string, bigint> = {};
    if (vars.has("x")) inputs.x = BigInt(xVal);
    if (vars.has("y")) inputs.y = BigInt(yVal);
    if (vars.has("z")) inputs.z = BigInt(zVal);

    const witness = computeWitness(gates, inputs, p);
    const r1cs = gatesToR1CS(gates, p);
    const qap = r1csToQAP(r1cs, p);
    const result = verifyQAP(qap, witness.wireVector, p, 7n);

    setWireNames(r1cs.wireNames);
    setPolys({ Ai: qap.Ai, Bi: qap.Bi, Ci: qap.Ci, target: qap.target });
    setQapResult(result);
  };

  return (
    <div className="flex flex-col gap-6">
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <Info className="h-4 w-4" />
        <AlertDescription>
          R1CS → QAP: interpolate constraint matrices into polynomials. Then
          verify A(x)*B(x) - C(x) = H(x)*T(x), turning discrete constraint checks
          into a single polynomial divisibility check.
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Expression</p>
          <div>
            <Label htmlFor="zk-r1cs-expression">Arithmetic expression</Label>
            <Input
              id="zk-r1cs-expression"
              value={expression}
              onChange={(e) => {
                setExpression(e.target.value);
                setQapResult(null);
              }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="zk-r1cs-x">x</Label>
              <Input id="zk-r1cs-x" type="number" value={xVal} onChange={(e) => setXVal(Number(e.target.value) || 0)} min={0} max={22} />
            </div>
            <div>
              <Label htmlFor="zk-r1cs-y">y</Label>
              <Input id="zk-r1cs-y" type="number" value={yVal} onChange={(e) => setYVal(Number(e.target.value) || 0)} min={0} max={22} />
            </div>
            <div>
              <Label htmlFor="zk-r1cs-z">z</Label>
              <Input id="zk-r1cs-z" type="number" value={zVal} onChange={(e) => setZVal(Number(e.target.value) || 0)} min={0} max={22} />
            </div>
          </div>
          <Button variant="secondary" onClick={handleRun}>
            R1CS → QAP → Verify
          </Button>
        </div>
      </div>

      {polys && wireNames.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">QAP Polynomials</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wire</TableHead>
                  <TableHead>A_i(x)</TableHead>
                  <TableHead>B_i(x)</TableHead>
                  <TableHead>C_i(x)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wireNames.map((w, i) => (
                  <TableRow key={w}>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{w}</code>
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{formatPolynomial(polys.Ai[i] ?? [0n])}</code>
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{formatPolynomial(polys.Bi[i] ?? [0n])}</code>
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{formatPolynomial(polys.Ci[i] ?? [0n])}</code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-sm">
              Target T(x) = <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{formatPolynomial(polys.target)}</code>
            </p>

            {qapResult && (
              <SimpleLineChart
                data={Array.from({ length: 20 }, (_, i) => {
                  const x = BigInt(i + 1);
                  const sumA = wireNames.reduce(
                    (acc, _, wi) =>
                      acc +
                      evaluatePolynomial(polys.Ai[wi] ?? [0n], x, p) *
                        (qapResult ? 1n : 0n),
                    0n,
                  );
                  const sumB = wireNames.reduce(
                    (acc, _, wi) =>
                      acc + evaluatePolynomial(polys.Bi[wi] ?? [0n], x, p) * 1n,
                    0n,
                  );
                  const sumC = wireNames.reduce(
                    (acc, _, wi) =>
                      acc + evaluatePolynomial(polys.Ci[wi] ?? [0n], x, p) * 1n,
                    0n,
                  );
                  return {
                    x: i + 1,
                    "A(x)": Number(((sumA % p) + p) % p),
                    "B(x)": Number(((sumB % p) + p) % p),
                    "C(x)": Number(((sumC % p) + p) % p),
                  };
                })}
                xKey="x"
                yKeys={["A(x)", "B(x)", "C(x)"]}
                height={250}
              />
            )}
          </div>
        </div>
      )}

      {qapResult && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                Verification at x = 7
              </p>
              <Badge
                variant="secondary"
                className={
                  qapResult.verified
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                }
              >
                {qapResult.verified ? "QAP Verified" : "QAP Failed"}
              </Badge>
            </div>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>A(7)</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{qapResult.Ax.toString()}</code>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>B(7)</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{qapResult.Bx.toString()}</code>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>C(7)</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{qapResult.Cx.toString()}</code>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>A*B - C (mod p)</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{qapResult.lhs.toString()}</code>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>H(7) * T(7) (mod p)</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{qapResult.rhs.toString()}</code>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
