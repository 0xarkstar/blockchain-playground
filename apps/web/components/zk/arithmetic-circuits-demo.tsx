"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import {
  parseExpression,
  computeWitness,
  gatesToR1CS,
  verifySatisfaction,
  getPresetExpressions,
  type WitnessResult,
} from "../../lib/zk/circuit";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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

export function ArithmeticCircuitsDemo() {
  const presets = getPresetExpressions();
  const [expression, setExpression] = useState(presets[0].expression);
  const [inputValues, setInputValues] = useState<Record<string, number>>({
    x: 3,
    y: 4,
  });
  const [witnessResult, setWitnessResult] = useState<WitnessResult | null>(
    null,
  );
  const p = 23n;

  const handlePresetChange = (presetName: string) => {
    const preset = presets.find((p) => p.name === presetName);
    if (!preset) return;
    setExpression(preset.expression);
    const inputs: Record<string, number> = {};
    for (const [k, v] of Object.entries(preset.suggestedInputs)) {
      inputs[k] = Number(v);
    }
    setInputValues(inputs);
    setWitnessResult(null);
  };

  const handleCompute = () => {
    const gates = parseExpression(expression);
    if (gates.length === 0) return;
    const bigInputs: Record<string, bigint> = {};
    for (const [k, v] of Object.entries(inputValues)) {
      bigInputs[k] = BigInt(v);
    }
    setWitnessResult(computeWitness(gates, bigInputs, p));
  };

  const gates = parseExpression(expression);
  const variables = new Set<string>();
  for (const g of gates) {
    if (!/^\d+$/.test(g.left) && !g.left.startsWith("_")) variables.add(g.left);
    if (!/^\d+$/.test(g.right) && !g.right.startsWith("_"))
      variables.add(g.right);
  }

  return (
    <div className="flex flex-col gap-6">
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <Info className="h-4 w-4" />
        <AlertDescription>
          An arithmetic circuit expresses computation as addition and
          multiplication gates over a finite field (p=23). This is the first step
          in building a SNARK.
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Expression</p>
          <div>
            <Label htmlFor="zk-circuits-preset">Preset</Label>
            <Select onValueChange={handlePresetChange}>
              <SelectTrigger id="zk-circuits-preset" className="w-full">
                <SelectValue placeholder="Choose a preset..." />
              </SelectTrigger>
              <SelectContent>
                {presets.map((p) => (
                  <SelectItem key={p.name} value={p.name}>
                    {p.name}: {p.expression}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="zk-circuits-expression">Custom expression</Label>
            <p className="text-xs text-muted-foreground mb-1">
              Operators: + * ( ) — Variables: a-z — Constants: 0-9
            </p>
            <Input
              id="zk-circuits-expression"
              value={expression}
              onChange={(e) => {
                setExpression(e.target.value);
                setWitnessResult(null);
              }}
            />
          </div>
        </div>
      </div>

      {gates.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">
              Gates ({gates.length})
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Operation</TableHead>
                  <TableHead>Output</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gates.map((g, i) => (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                        {g.left} {g.op === "mul" ? "*" : "+"} {g.right}
                      </code>
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{g.output}</code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {gates.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold">Circuit Diagram</p>
            <svg
              width="100%"
              height={Math.max(120, gates.length * 80 + 40)}
              viewBox={`0 0 420 ${Math.max(120, gates.length * 80 + 40)}`}
            >
              {gates.map((g, i) => {
                const y = 30 + i * 80;
                const isMul = g.op === "mul";
                return (
                  <g key={i}>
                    <rect x={30} y={y} width={80} height={30} rx={4} className="fill-blue-100 stroke-blue-500 dark:fill-blue-900 dark:stroke-blue-400" strokeWidth={1} />
                    <text x={70} y={y + 19} textAnchor="middle" fontSize={11} className="fill-blue-900 dark:fill-blue-200">{g.left}</text>
                    <line x1={110} y1={y + 15} x2={160} y2={y + 15} className="stroke-gray-400" strokeWidth={1.5} />
                    <rect x={130} y={y} width={80} height={30} rx={4} className="fill-violet-100 stroke-violet-500 dark:fill-violet-900 dark:stroke-violet-400" strokeWidth={1} />
                    <text x={170} y={y + 19} textAnchor="middle" fontSize={11} className="fill-violet-900 dark:fill-violet-200">{g.right}</text>
                    <line x1={210} y1={y + 15} x2={240} y2={y + 15} className="stroke-gray-400" strokeWidth={1.5} />
                    <circle
                      cx={260}
                      cy={y + 15}
                      r={18}
                      className={isMul ? "fill-orange-100 stroke-orange-500 dark:fill-orange-900 dark:stroke-orange-400" : "fill-teal-100 stroke-teal-500 dark:fill-teal-900 dark:stroke-teal-400"}
                      strokeWidth={1.5}
                    />
                    <text x={260} y={y + 20} textAnchor="middle" fontSize={16} fontWeight={700} className={isMul ? "fill-orange-900 dark:fill-orange-200" : "fill-teal-900 dark:fill-teal-200"}>
                      {isMul ? "\u00d7" : "+"}
                    </text>
                    <line x1={278} y1={y + 15} x2={310} y2={y + 15} className="stroke-gray-400" strokeWidth={1.5} />
                    <rect x={310} y={y} width={80} height={30} rx={4} className="fill-green-100 stroke-green-500 dark:fill-green-900 dark:stroke-green-400" strokeWidth={1} />
                    <text x={350} y={y + 19} textAnchor="middle" fontSize={11} className="fill-green-900 dark:fill-green-200">{g.output}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Inputs (mod {p.toString()})
          </p>
          <div className="grid grid-cols-2 gap-4">
            {Array.from(variables).map((v) => (
              <div key={v}>
                <Label htmlFor={`zk-circuits-var-${v}`}>{v}</Label>
                <Input
                  id={`zk-circuits-var-${v}`}
                  type="number"
                  value={inputValues[v] ?? 0}
                  onChange={(e) =>
                    setInputValues({ ...inputValues, [v]: Number(e.target.value) || 0 })
                  }
                  min={0}
                  max={22}
                />
              </div>
            ))}
          </div>
          <Button variant="secondary" onClick={handleCompute}>
            Compute Witness
          </Button>
        </div>
      </div>

      {witnessResult && (
        <>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Witness</p>
                <Badge
                  variant="secondary"
                  className={
                    witnessResult.satisfied
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  }
                >
                  {witnessResult.satisfied
                    ? "R1CS Satisfied"
                    : "R1CS Not Satisfied"}
                </Badge>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Wire</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(witnessResult.values).map(([wire, val]) => (
                    <TableRow key={wire}>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{wire}</code>
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{val.toString()}</code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">
                R1CS Constraints (A·w * B·w = C·w)
              </p>
              {(() => {
                const r1cs = gatesToR1CS(gates, p);
                const checks = verifySatisfaction(
                  r1cs,
                  witnessResult.wireVector,
                  p,
                );
                return (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>(A·w) * (B·w)</TableHead>
                        <TableHead>C·w</TableHead>
                        <TableHead>Satisfied</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {checks.map((c) => (
                        <TableRow key={c.index}>
                          <TableCell>{c.index + 1}</TableCell>
                          <TableCell>
                            <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{c.lhs.toString()}</code>
                          </TableCell>
                          <TableCell>
                            <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{c.rhs.toString()}</code>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                c.satisfied
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              }
                            >
                              {c.satisfied ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
