"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import {
  generateSchnorrKeys,
  runProtocol,
  type SchnorrProtocolResult,
} from "../../lib/zk/schnorr";
import { getSchnorrField } from "../../lib/zk/field";
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

export function SchnorrProtocolDemo() {
  const [numRounds, setNumRounds] = useState(3);
  const [result, setResult] = useState<SchnorrProtocolResult | null>(null);
  const params = getSchnorrField();

  const handleRun = () => {
    const keys = generateSchnorrKeys(params);
    setResult(runProtocol(params, keys, numRounds));
  };

  return (
    <div className="flex flex-col gap-6">
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Schnorr&apos;s sigma protocol: prove &quot;I know x such that y = g^x
          mod p&quot; without revealing x. Uses field p=23, subgroup generator
          g=2, order q=11.
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Protocol Parameters</p>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Prime p</TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">23</code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Generator g</TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">2</code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Subgroup order q</TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">11</code>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Run Protocol</p>
          <div>
            <Label htmlFor="zk-schnorr-rounds">Number of rounds</Label>
            <Input
              id="zk-schnorr-rounds"
              type="number"
              value={numRounds}
              onChange={(e) => setNumRounds(Number(e.target.value) || 1)}
              min={1}
              max={10}
            />
          </div>
          <Button variant="secondary" onClick={handleRun}>
            Generate Keys & Run
          </Button>
        </div>
      </div>

      {result && (
        <>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">Keys</p>
              <div className="flex items-center gap-4">
                <p className="text-sm">
                  Secret key x = <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{result.keys.secretKey.toString()}</code>
                </p>
                <p className="text-sm">
                  Public key y = g^x ={" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{result.keys.publicKey.toString()}</code>
                </p>
              </div>
              <Badge
                variant="secondary"
                className={
                  result.allVerified
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                }
              >
                {result.allVerified
                  ? "All rounds verified"
                  : "Verification failed"}
              </Badge>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">Round Details</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>R = g^r</TableHead>
                    <TableHead>Challenge e</TableHead>
                    <TableHead>Response s</TableHead>
                    <TableHead>g^s</TableHead>
                    <TableHead>R*y^e</TableHead>
                    <TableHead>Valid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.rounds.map((round) => (
                    <TableRow key={round.round}>
                      <TableCell>{round.round}</TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{round.commitment.toString()}</code>
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{round.challenge.toString()}</code>
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{round.response.toString()}</code>
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{round.lhs.toString()}</code>
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{round.rhs.toString()}</code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            round.verified
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }
                        >
                          {round.verified ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-4">
              <p className="text-sm font-semibold">Protocol Visualization</p>
              <svg
                width="100%"
                height={result.rounds.length * 130 + 60}
                viewBox={`0 0 460 ${result.rounds.length * 130 + 60}`}
              >
                <rect
                  x={40}
                  y={10}
                  width={100}
                  height={30}
                  rx={6}
                  className="fill-blue-100 stroke-blue-500 dark:fill-blue-900 dark:stroke-blue-400"
                  strokeWidth={1.5}
                />
                <text
                  x={90}
                  y={30}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={600}
                  className="fill-blue-900 dark:fill-blue-200"
                >
                  Prover
                </text>
                <rect
                  x={320}
                  y={10}
                  width={100}
                  height={30}
                  rx={6}
                  className="fill-green-100 stroke-green-500 dark:fill-green-900 dark:stroke-green-400"
                  strokeWidth={1.5}
                />
                <text
                  x={370}
                  y={30}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={600}
                  className="fill-green-900 dark:fill-green-200"
                >
                  Verifier
                </text>
                <line
                  x1={90}
                  y1={40}
                  x2={90}
                  y2={result.rounds.length * 130 + 50}
                  className="stroke-blue-300 dark:stroke-blue-700"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <line
                  x1={370}
                  y1={40}
                  x2={370}
                  y2={result.rounds.length * 130 + 50}
                  className="stroke-green-300 dark:stroke-green-700"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                {result.rounds.map((round, i) => {
                  const baseY = 60 + i * 130;
                  return (
                    <g key={round.round}>
                      <text
                        x={10}
                        y={baseY + 20}
                        fontSize={10}
                        className="fill-muted-foreground"
                      >
                        R{round.round}
                      </text>
                      <line
                        x1={100}
                        y1={baseY + 15}
                        x2={310}
                        y2={baseY + 15}
                        className="stroke-blue-500 dark:stroke-blue-400"
                        strokeWidth={1.5}
                        markerEnd="url(#schnorr-arrow)"
                      />
                      <text
                        x={200}
                        y={baseY + 10}
                        textAnchor="middle"
                        fontSize={10}
                        className="fill-blue-700 dark:fill-blue-300"
                      >
                        R = g^r = {round.commitment.toString()}
                      </text>
                      <line
                        x1={310}
                        y1={baseY + 55}
                        x2={100}
                        y2={baseY + 55}
                        className="stroke-green-500 dark:stroke-green-400"
                        strokeWidth={1.5}
                        markerEnd="url(#schnorr-arrow-rev)"
                      />
                      <text
                        x={200}
                        y={baseY + 50}
                        textAnchor="middle"
                        fontSize={10}
                        className="fill-green-700 dark:fill-green-300"
                      >
                        e = {round.challenge.toString()}
                      </text>
                      <line
                        x1={100}
                        y1={baseY + 95}
                        x2={310}
                        y2={baseY + 95}
                        className="stroke-blue-500 dark:stroke-blue-400"
                        strokeWidth={1.5}
                        markerEnd="url(#schnorr-arrow)"
                      />
                      <text
                        x={200}
                        y={baseY + 90}
                        textAnchor="middle"
                        fontSize={10}
                        className="fill-blue-700 dark:fill-blue-300"
                      >
                        s = {round.response.toString()}
                      </text>
                      <text
                        x={380}
                        y={baseY + 105}
                        fontSize={10}
                        className={
                          round.verified
                            ? "fill-green-700 dark:fill-green-300"
                            : "fill-red-700 dark:fill-red-300"
                        }
                      >
                        {round.verified ? "OK" : "FAIL"}
                      </text>
                    </g>
                  );
                })}
                <defs>
                  <marker
                    id="schnorr-arrow"
                    markerWidth="8"
                    markerHeight="6"
                    refX="8"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 8 3, 0 6"
                      className="fill-blue-500 dark:fill-blue-400"
                    />
                  </marker>
                  <marker
                    id="schnorr-arrow-rev"
                    markerWidth="8"
                    markerHeight="6"
                    refX="8"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 8 3, 0 6"
                      className="fill-green-500 dark:fill-green-400"
                    />
                  </marker>
                </defs>
              </svg>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">Protocol Steps</p>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Badge variant="secondary">1</Badge>
                    </TableCell>
                    <TableCell>
                      Prover picks random r, sends R = g^r mod p
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        2
                      </Badge>
                    </TableCell>
                    <TableCell>Verifier sends random challenge e</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                        3
                      </Badge>
                    </TableCell>
                    <TableCell>Prover responds s = (r + e*x) mod q</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        4
                      </Badge>
                    </TableCell>
                    <TableCell>Verifier checks: g^s ≡ R * y^e (mod p)</TableCell>
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
