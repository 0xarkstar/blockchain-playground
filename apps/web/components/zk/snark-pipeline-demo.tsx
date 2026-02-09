"use client";

import { useState } from "react";
import { Info, AlertTriangle } from "lucide-react";
import { getFullPipeline, type FullPipelineResult } from "../../lib/zk/snark";
import { ProgressPipeline, EducationPanel } from "../shared";
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

export function SNARKPipelineDemo() {
  const [expression, setExpression] = useState("x * y");
  const [xVal, setXVal] = useState(3);
  const [yVal, setYVal] = useState(4);
  const [zVal, setZVal] = useState(0);
  const [result, setResult] = useState<FullPipelineResult | null>(null);
  const p = 23n;

  const handleRun = () => {
    const vars = expression.match(/[a-zA-Z_]+/g) ?? [];
    const uniqueVars = [...new Set(vars)];
    const inputs: Record<string, bigint> = {};
    if (uniqueVars.includes("x")) inputs.x = BigInt(xVal);
    if (uniqueVars.includes("y")) inputs.y = BigInt(yVal);
    if (uniqueVars.includes("z")) inputs.z = BigInt(zVal);
    setResult(getFullPipeline(expression, inputs, p));
  };

  return (
    <div className="flex flex-col gap-6">
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Full SNARK pipeline: Expression → Circuit → R1CS → QAP → Trusted Setup →
          Proof → Verify. This is a simplified simulation over a small field
          (p=23).
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Configure
          </p>
          <div>
            <Label>Arithmetic expression</Label>
            <Input
              value={expression}
              onChange={(e) => {
                setExpression(e.target.value);
                setResult(null);
              }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>x</Label>
              <Input type="number" value={xVal} onChange={(e) => setXVal(Number(e.target.value) || 0)} min={0} max={22} />
            </div>
            <div>
              <Label>y</Label>
              <Input type="number" value={yVal} onChange={(e) => setYVal(Number(e.target.value) || 0)} min={0} max={22} />
            </div>
            <div>
              <Label>z</Label>
              <Input type="number" value={zVal} onChange={(e) => setZVal(Number(e.target.value) || 0)} min={0} max={22} />
            </div>
          </div>
          <Button variant="secondary" onClick={handleRun}>
            Run Full Pipeline
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            SNARK Pipeline
          </p>
          <ProgressPipeline
            steps={[
              { id: "circuit", label: "Circuit" },
              { id: "r1cs", label: "R1CS" },
              { id: "qap", label: "QAP" },
              { id: "setup", label: "Setup" },
              { id: "prove", label: "Prove" },
              { id: "verify", label: "Verify" },
            ]}
            currentStepIndex={result ? 6 : 0}
          />
        </div>
      </div>

      <EducationPanel
        howItWorks={[
          {
            title: "Parse Expression into Circuit",
            description:
              "The arithmetic expression is decomposed into addition and multiplication gates.",
          },
          {
            title: "Circuit to R1CS",
            description:
              "Each gate becomes a Rank-1 Constraint: A*B = C using sparse vectors.",
          },
          {
            title: "R1CS to QAP",
            description:
              "Constraint vectors are interpolated into polynomials via Lagrange interpolation.",
          },
          {
            title: "Trusted Setup",
            description:
              "Generate CRS (common reference string) with toxic waste that must be destroyed.",
          },
          {
            title: "Prove",
            description:
              "The prover evaluates polynomials at a secret point to create a succinct proof.",
          },
          {
            title: "Verify",
            description:
              "The verifier checks the polynomial identity using bilinear pairings (simulated here).",
          },
        ]}
        whyItMatters="SNARKs compress arbitrary computation into constant-size proofs that can be verified in milliseconds, enabling scalable and private blockchain computation."
        tips={[
          "The trusted setup is a one-time ceremony — if compromised, fake proofs can be generated",
          "Real SNARKs use elliptic curve pairings; this demo simulates with modular arithmetic",
          "Groth16 produces the smallest proofs (~200 bytes) among SNARK constructions",
        ]}
      />

      {result && (
        <>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                  Result
                </p>
                <Badge
                  variant="secondary"
                  className={
                    result.verified
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  }
                >
                  {result.verified ? "Proof Verified" : "Verification Failed"}
                </Badge>
              </div>
              <p className="text-sm">
                Output: <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{result.output.toString()}</code> (mod{" "}
                {p.toString()})
              </p>
            </div>
          </div>

          {result.steps.map((step, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold">
                  {step.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
                {step.warning && (
                  <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950 p-2">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <AlertDescription className="text-xs">{step.warning}</AlertDescription>
                  </Alert>
                )}
                <Table>
                  <TableBody>
                    {Object.entries(step.data).map(([key, val]) => (
                      <TableRow key={key}>
                        <TableCell>
                          <p className="text-sm">{key}</p>
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                            {Array.isArray(val) ? val.join(", ") : String(val)}
                          </code>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">
                Proof Components
              </p>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>π_A</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{result.proof.piA.toString()}</code>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>π_B</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{result.proof.piB.toString()}</code>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>π_C</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{result.proof.piC.toString()}</code>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
