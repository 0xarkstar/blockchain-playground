"use client";

import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../../components/ui/card";
import { Badge } from "../../../../../../components/ui/badge";
import { TextAnimate } from "../../../../../../components/ui/text-animate";
import { NumberTicker } from "../../../../../../components/ui/number-ticker";
import { CheckCircle, XCircle } from "lucide-react";

const ComparisonChart = dynamic(
  () =>
    import("../../../../../../components/applied-zk/visualization/comparison-chart").then(
      (m) => m.ComparisonChart,
    ),
  { ssr: false },
);

const DetailedComparison = dynamic(
  () =>
    import("../../../../../../components/applied-zk/visualization/comparison-chart").then(
      (m) => m.DetailedComparison,
    ),
  { ssr: false },
);

interface ComparisonRowProps {
  label: string;
  snark: string;
  stark: string;
  winner?: "snark" | "stark" | "none";
}

function ComparisonRow({
  label,
  snark,
  stark,
  winner = "none",
}: ComparisonRowProps) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b last:border-0">
      <div className="font-medium">{label}</div>
      <div
        className={`text-center ${
          winner === "snark"
            ? "text-green-600 dark:text-green-400 font-medium"
            : ""
        }`}
      >
        {snark}
      </div>
      <div
        className={`text-center ${
          winner === "stark"
            ? "text-green-600 dark:text-green-400 font-medium"
            : ""
        }`}
      >
        {stark}
      </div>
    </div>
  );
}

export default function ComparisonPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Badge variant="secondary" className="mb-4">
          Education Module
        </Badge>
        <TextAnimate
          as="h1"
          className="text-3xl font-bold mb-2"
          animation="blurInUp"
          by="word"
        >
          SNARK vs STARK: A Comprehensive Comparison
        </TextAnimate>
        <p className="text-muted-foreground text-lg">
          Understand the key differences between the two dominant zero-knowledge
          proof systems and when to use each.
        </p>
      </div>

      <div className="space-y-8">
        {/* ── Key Statistics ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                ~<NumberTicker value={200} />
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                SNARK Proof Size (bytes)
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                ~<NumberTicker value={45} />K
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                STARK Proof Size (bytes)
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                ~<NumberTicker value={10} />ms
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                SNARK Verification Time
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                ~<NumberTicker value={100} />ms
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                STARK Verification Time
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Quick Overview ── */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border rounded-lg bg-blue-500/5 border-blue-500/20">
                <h3 className="font-bold text-xl text-blue-600 dark:text-blue-400 mb-2">
                  zk-SNARK
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Succinct Non-interactive Argument of Knowledge. Uses elliptic
                  curve pairings for extremely compact proofs.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Tiny proof size (~200 bytes)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Fast verification (~10ms)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Mature ecosystem (circom, snarkjs)
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Requires trusted setup
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Not quantum resistant
                  </li>
                </ul>
              </div>

              <div className="p-6 border rounded-lg bg-purple-500/5 border-purple-500/20">
                <h3 className="font-bold text-xl text-purple-600 dark:text-purple-400 mb-2">
                  zk-STARK
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Scalable Transparent Argument of Knowledge. Uses hash
                  functions for transparent, post-quantum security.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    No trusted setup needed
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Quantum resistant
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Better scaling for large computations
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Larger proof size (~45 KB)
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Slower on-chain verification
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Visual Comparison Chart ── */}
        <ComparisonChart />

        {/* ── Detailed Comparison Table ── */}
        <DetailedComparison />

        {/* ── Quick Reference Table ── */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 py-2 border-b font-semibold">
              <div>Aspect</div>
              <div className="text-center text-blue-600 dark:text-blue-400">
                zk-SNARK
              </div>
              <div className="text-center text-purple-600 dark:text-purple-400">
                zk-STARK
              </div>
            </div>
            <ComparisonRow
              label="Cryptographic Basis"
              snark="Elliptic curve pairings"
              stark="Hash functions"
              winner="stark"
            />
            <ComparisonRow
              label="Trusted Setup"
              snark="Required (per circuit)"
              stark="Not required"
              winner="stark"
            />
            <ComparisonRow
              label="Proof Size"
              snark="~200 bytes"
              stark="~45 KB"
              winner="snark"
            />
            <ComparisonRow
              label="Verification Time"
              snark="~10ms (constant)"
              stark="~100ms (polylogarithmic)"
              winner="snark"
            />
            <ComparisonRow
              label="Prover Complexity"
              snark="O(n log n)"
              stark="O(n polylog n)"
            />
            <ComparisonRow
              label="Verifier Complexity"
              snark="O(1)"
              stark="O(polylog n)"
              winner="snark"
            />
            <ComparisonRow
              label="Quantum Resistance"
              snark="No"
              stark="Yes"
              winner="stark"
            />
            <ComparisonRow
              label="On-chain Gas Cost"
              snark="~200K gas"
              stark="~1M+ gas"
              winner="snark"
            />
          </CardContent>
        </Card>

        {/* ── Use Cases ── */}
        <Card>
          <CardHeader>
            <CardTitle>Best Use Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-blue-500" />
                  Best for SNARKs
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="p-3 bg-muted rounded-lg">
                    <strong className="text-foreground">
                      On-chain Verification
                    </strong>
                    <br />
                    When gas cost is the primary constraint (privacy protocols,
                    credential verification, on-chain games)
                  </li>
                  <li className="p-3 bg-muted rounded-lg">
                    <strong className="text-foreground">
                      Privacy Applications
                    </strong>
                    <br />
                    Zcash, Tornado Cash model &mdash; where small proof size
                    enables efficient private transactions
                  </li>
                  <li className="p-3 bg-muted rounded-lg">
                    <strong className="text-foreground">
                      Identity & Credentials
                    </strong>
                    <br />
                    Prove properties about your identity (age, membership)
                    without revealing the underlying data
                  </li>
                  <li className="p-3 bg-muted rounded-lg">
                    <strong className="text-foreground">
                      Rich Tooling Needed
                    </strong>
                    <br />
                    Projects that need mature developer tools, audited
                    libraries, and community support
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-purple-500" />
                  Best for STARKs
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="p-3 bg-muted rounded-lg">
                    <strong className="text-foreground">
                      L2 Rollups
                    </strong>
                    <br />
                    StarkNet, StarkEx &mdash; batch thousands of transactions
                    into a single proof posted to L1
                  </li>
                  <li className="p-3 bg-muted rounded-lg">
                    <strong className="text-foreground">
                      Large Computations
                    </strong>
                    <br />
                    Complex VM execution, ML inference verification, and
                    computations with millions of constraints
                  </li>
                  <li className="p-3 bg-muted rounded-lg">
                    <strong className="text-foreground">
                      Long-term Security
                    </strong>
                    <br />
                    Systems that need to remain secure for decades, even against
                    future quantum computers
                  </li>
                  <li className="p-3 bg-muted rounded-lg">
                    <strong className="text-foreground">
                      No Trust Required
                    </strong>
                    <br />
                    Environments where any form of trusted setup is unacceptable
                    (government, critical infrastructure)
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Future Convergence ── */}
        <Card>
          <CardHeader>
            <CardTitle>The Future: Convergence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The line between SNARKs and STARKs is blurring as researchers
              develop hybrid approaches that combine the best of both worlds.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">STARK → SNARK Wrapping</h4>
                <p className="text-sm text-muted-foreground">
                  Generate a STARK proof for the computation, then wrap it in a
                  SNARK for cheap on-chain verification. StarkNet already does
                  this with SHARP.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Universal SNARKs</h4>
                <p className="text-sm text-muted-foreground">
                  Systems like PLONK and Halo 2 eliminate circuit-specific setup
                  with a universal SRS, reducing the trusted setup burden.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Recursive Proofs</h4>
                <p className="text-sm text-muted-foreground">
                  A proof that verifies another proof. This enables incremental
                  verification and proof aggregation across both SNARK and STARK
                  systems.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg mt-4">
              <h4 className="font-semibold mb-1">The Bottom Line</h4>
              <p className="text-sm text-muted-foreground">
                Neither SNARKs nor STARKs are universally &ldquo;better.&rdquo;
                The right choice depends on your constraints: proof size, setup
                trust model, quantum resistance, and computation scale. The
                industry is converging toward hybrid solutions that leverage the
                strengths of both systems.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
