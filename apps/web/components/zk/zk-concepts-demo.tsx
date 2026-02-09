"use client";

import { useState } from "react";
import { Info, Check, X } from "lucide-react";
import {
  simulateAliBabaCave,
  calculateSoundness,
  getZKProperties,
  type CaveSimulation,
} from "../../lib/zk/proof-concepts";
import { EducationPanel } from "../shared";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export function ZKConceptsDemo() {
  const [numRounds, setNumRounds] = useState(5);
  const [hasSecret, setHasSecret] = useState(true);
  const [simulation, setSimulation] = useState<CaveSimulation | null>(null);

  const properties = getZKProperties();

  const soundness = calculateSoundness(numRounds);
  const cheatingProb = (soundness * 100).toFixed(soundness < 0.01 ? 4 : 2);

  return (
    <div className="flex flex-col gap-6">
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <Info className="h-4 w-4" />
        <AlertDescription>
          The Ali Baba Cave analogy explains ZK proofs without math. A cave has
          two paths (A and B) connected by a magic door. The prover enters one
          side; the verifier asks them to exit from a specific side.
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Three Properties of ZK Proofs
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Example</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((prop) => (
                <TableRow key={prop.name}>
                  <TableCell>
                    <Badge variant="secondary">{prop.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{prop.description}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-muted-foreground">
                      {prop.example}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            Ali Baba Cave Simulation
          </p>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Rounds</Label>
              <Input
                type="number"
                value={numRounds}
                onChange={(e) => setNumRounds(Number(e.target.value) || 1)}
                min={1}
                max={20}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => {
                setHasSecret(true);
                setSimulation(simulateAliBabaCave(true, numRounds));
              }}
              variant={hasSecret ? "default" : "secondary"}
              className={hasSecret ? "bg-green-600 hover:bg-green-700 text-white" : ""}
            >
              Prover Knows Secret
            </Button>
            <Button
              onClick={() => {
                setHasSecret(false);
                setSimulation(simulateAliBabaCave(false, numRounds));
              }}
              variant={!hasSecret ? "default" : "secondary"}
              className={!hasSecret ? "bg-red-600 hover:bg-red-700 text-white" : ""}
            >
              Prover is Cheating
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Cheating probability after {numRounds} round(s): {cheatingProb}%
          </p>
          <Progress value={100 - soundness * 100} className="h-3" />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold">
            SNARK vs STARK Comparison
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>SNARK</TableHead>
                <TableHead>STARK</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Trusted Setup</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                    Required
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Not needed
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Proof Size</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    ~200 bytes
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                    ~50 KB
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Verification Time</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    ~10ms
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                    ~50ms
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Quantum Resistant</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                    No
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Yes
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Prover Time</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                    Moderate
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Fast
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Used In</TableCell>
                <TableCell>Zcash, zkSync, Tornado Cash</TableCell>
                <TableCell>StarkNet, Cairo, dYdX</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <EducationPanel
        howItWorks={[
          {
            title: "Interactive Proof System",
            description:
              "A prover convinces a verifier of a statement through a series of rounds without revealing the secret.",
          },
          {
            title: "Soundness via Repetition",
            description:
              "Each round halves the chance of cheating. After n rounds, cheating probability is (1/2)^n.",
          },
          {
            title: "Non-Interactive Proofs",
            description:
              "Fiat-Shamir heuristic converts interactive proofs into non-interactive ones using hash functions.",
          },
        ]}
        whyItMatters="Zero-knowledge proofs enable privacy-preserving verification on public blockchains. They power private transactions (Zcash), scalable computation (zkRollups), and anonymous credentials."
        tips={[
          "SNARKs offer small proofs but need trusted setup",
          "STARKs are quantum-resistant with no trusted setup",
          "More rounds = higher confidence = lower cheating probability",
        ]}
      />

      {simulation && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Results</p>
              <Badge
                variant="secondary"
                className={
                  simulation.allPassed
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                }
              >
                {simulation.allPassed ? "All Passed" : "Failed"}
              </Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Round</TableHead>
                  <TableHead>Path Entered</TableHead>
                  <TableHead>Verifier Asks</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {simulation.rounds.map((round) => (
                  <TableRow key={round.round}>
                    <TableCell>{round.round}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        Path {round.pathChosen}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        Exit {round.verifierAsks}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {round.success ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
