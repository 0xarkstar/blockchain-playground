"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../../components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../../components/ui/card";
import { Badge } from "../../../../../../components/ui/badge";
import { TextAnimate } from "../../../../../../components/ui/text-animate";
import { StepCard } from "../../../../../../components/shared/step-card";
import { ConceptCard } from "../../../../../../components/applied-zk/education/concept-card";
import {
  Shield,
  Zap,
  Eye,
  CheckCircle,
  AlertTriangle,
  Code,
  Layers,
} from "lucide-react";

export default function StarkEducationPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
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
          zk-STARKs: Scalable Transparent Arguments of Knowledge
        </TextAnimate>
        <p className="text-muted-foreground text-lg">
          The next generation of zero-knowledge proofs &mdash; no trusted setup,
          quantum-resistant security, and better scaling for large computations.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
          <TabsTrigger value="fri">FRI Protocol</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ── */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>What is a zk-STARK?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                A <strong>zk-STARK</strong> (Zero-Knowledge Scalable Transparent
                Argument of Knowledge) is a proof system invented by Eli
                Ben-Sasson and collaborators at StarkWare. STARKs solve two
                fundamental limitations of SNARKs: the need for a trusted setup
                and vulnerability to quantum computers.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4" />
                    Scalable
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Proof generation time scales quasi-linearly with computation
                    size, while verification time scales polylogarithmically.
                    This means STARKs get relatively faster for larger programs.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4" />
                    Transparent
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    No trusted setup ceremony required. All randomness used in
                    the proof is publicly verifiable, eliminating the
                    &ldquo;toxic waste&rdquo; problem entirely.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4" />
                    Quantum Resistant
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    STARKs rely only on collision-resistant hash functions (not
                    elliptic curves), which are believed to resist quantum
                    computer attacks.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    Minimal Assumptions
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Security rests on the existence of collision-resistant hash
                    functions &mdash; one of the weakest and most well-studied
                    cryptographic assumptions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ConceptCard
              title="Advantages"
              description="Why STARKs are the future of proof systems"
              icon={CheckCircle}
              highlight
              neonColors={{ firstColor: "#8b5cf6", secondColor: "#d946ef" }}
            >
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">+</span>
                  <span>No trusted setup &mdash; fully transparent verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">+</span>
                  <span>Post-quantum secure (hash-based, no elliptic curves)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">+</span>
                  <span>Better asymptotic scaling for very large computations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">+</span>
                  <span>Prover time scales quasi-linearly: O(n log n)</span>
                </li>
              </ul>
            </ConceptCard>

            <ConceptCard
              title="Trade-offs"
              description="Where STARKs currently lag behind SNARKs"
              icon={AlertTriangle}
            >
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">!</span>
                  <span>Larger proof size (~45 KB vs ~200 bytes for Groth16)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">!</span>
                  <span>Slower on-chain verification (~100ms vs ~10ms)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">!</span>
                  <span>Higher gas cost for Ethereum L1 verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">!</span>
                  <span>Ecosystem is younger with fewer developer tools</span>
                </li>
              </ul>
            </ConceptCard>
          </div>
        </TabsContent>

        {/* ── How It Works Tab ── */}
        <TabsContent value="how-it-works" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                STARK Pipeline: From Execution Trace to Proof
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-muted-foreground">
                Instead of arithmetic circuits and R1CS, STARKs work with
                execution traces and algebraic constraints. The prover
                demonstrates that a sequence of computation steps satisfies
                given transition rules.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <StepCard
              stepNumber={1}
              title="Algebraic Intermediate Representation (AIR)"
              description="Express the computation as an execution trace with polynomial transition constraints."
              details={[
                "An execution trace is a table where each row is a computation step",
                "Transition constraints define rules between consecutive rows",
                "Boundary constraints fix values at specific positions (e.g., initial state)",
              ]}
            />
            <StepCard
              stepNumber={2}
              title="Polynomial Commitment"
              description="Interpolate the execution trace columns into polynomials and commit to them."
              details={[
                "Each column of the trace becomes a polynomial over a finite field",
                "Transition constraints become polynomial identity checks",
                "The composition polynomial combines all constraints into one check",
              ]}
            />
            <StepCard
              stepNumber={3}
              title="FRI Protocol"
              description="Use the Fast Reed-Solomon Interactive Oracle Proof to verify polynomial degree bounds."
              details={[
                "FRI iteratively reduces the polynomial degree by half",
                "Each round uses random challenges (via Fiat-Shamir in practice)",
                "At the end, the polynomial should be a constant (degree 0)",
              ]}
            />
            <StepCard
              stepNumber={4}
              title="Fiat-Shamir Transform"
              description="Convert the interactive protocol into a non-interactive proof by deriving challenges from a hash function."
              details={[
                "All verifier challenges are replaced by hash outputs",
                "The prover computes the hash of the transcript so far",
                "This makes the proof a single message (non-interactive)",
              ]}
              isLast
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Example: Fibonacci Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Suppose we want to prove we know the 100th Fibonacci number
                  without revealing the full trace:
                </p>
                <div className="p-4 bg-muted rounded-lg font-mono text-sm">
                  <div className="text-muted-foreground mb-2">
                    Execution Trace
                  </div>
                  <pre className="overflow-x-auto">{`Step | a    | b
-----|------|------
  0  |  1   |  1
  1  |  1   |  2
  2  |  2   |  3
  3  |  3   |  5
 ... | ...  | ...
 99  | F_99 | F_100`}</pre>
                </div>
                <div className="p-4 bg-muted rounded-lg font-mono text-sm">
                  <div className="text-muted-foreground mb-2">
                    Transition Constraints
                  </div>
                  <pre className="overflow-x-auto">{`// For each row i (except last):
a[i+1] = b[i]
b[i+1] = a[i] + b[i]

// Boundary constraints:
a[0] = 1
b[0] = 1`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── FRI Protocol Tab ── */}
        <TabsContent value="fri" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-500" />
                FRI: Fast Reed-Solomon IOP of Proximity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                FRI is the core cryptographic protocol that makes STARKs work.
                It proves that a committed function is &ldquo;close to&rdquo; a
                low-degree polynomial, which is the mathematical backbone for
                verifying computation integrity.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 border rounded-lg border-purple-500/50 bg-purple-500/5">
                  <h4 className="font-semibold mb-2 text-purple-600 dark:text-purple-400">
                    How FRI Works
                  </h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>- Start with a polynomial of degree d</li>
                    <li>- Split into even and odd coefficients</li>
                    <li>- Combine using a random challenge &alpha;</li>
                    <li>- The result has degree d/2 &mdash; repeat until degree 0</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">
                    Why It&apos;s Transparent
                  </h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>- All challenges derived from public hash functions</li>
                    <li>- No secret parameters or trusted setup needed</li>
                    <li>- Anyone can verify the proof independently</li>
                    <li>- Security reduces to collision resistance of the hash</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Post-Quantum Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                STARKs derive their security entirely from hash functions, which
                are believed to be resistant to quantum attacks. This is a
                significant advantage over SNARKs as quantum computing advances.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">STARK Security Basis</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>- Collision-resistant hash functions (SHA-256, Poseidon)</li>
                    <li>- No elliptic curve assumptions</li>
                    <li>- Grover&apos;s algorithm only halves hash security (128-bit → 64-bit effective)</li>
                  </ul>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">SNARK Vulnerability</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>- Relies on elliptic curve discrete log problem</li>
                    <li>- Shor&apos;s algorithm can break EC crypto in polynomial time</li>
                    <li>- Would require migration to new proof systems</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 rounded-lg mt-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-1">
                  Future-Proofing
                </h4>
                <p className="text-sm text-muted-foreground">
                  While practical quantum computers capable of breaking
                  elliptic curves are still years away, choosing STARKs now
                  provides a safety margin. Systems built on STARKs will not
                  need to be migrated when quantum computing arrives.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FRI Reduction Walkthrough</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <StepCard
                  stepNumber={1}
                  title="Initial Polynomial (degree d)"
                  description="Commit to evaluations of polynomial P(x) of degree d over a large evaluation domain."
                />
                <StepCard
                  stepNumber={2}
                  title="Split & Fold (degree d/2)"
                  description="Decompose P(x) = P_even(x²) + x·P_odd(x²). Combine: P'(x) = P_even(x) + α·P_odd(x) using random challenge α."
                />
                <StepCard
                  stepNumber={3}
                  title="Repeat (degree d/4, d/8, ...)"
                  description="Each round halves the degree. After log(d) rounds, the polynomial should be a constant."
                />
                <StepCard
                  stepNumber={4}
                  title="Final Check"
                  description="Verify that the final claimed polynomial is indeed constant. The verifier spot-checks consistency between layers."
                  isLast
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Applications Tab ── */}
        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-World STARK Applications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                STARKs power some of the most ambitious projects in the
                blockchain space, particularly in L2 scaling and verifiable
                computation.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ConceptCard
              title="StarkNet"
              description="A permissionless decentralized ZK-Rollup on Ethereum using STARK proofs."
              badges={["L2 Scaling", "Cairo", "Ethereum"]}
            >
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>- General-purpose smart contracts via Cairo language</li>
                <li>- Validity proofs posted to Ethereum L1</li>
                <li>- Account abstraction built-in from day one</li>
              </ul>
            </ConceptCard>

            <ConceptCard
              title="StarkEx"
              description="A SaaS scaling engine used by dYdX, Immutable X, and Sorare."
              badges={["dYdX", "Immutable X", "Sorare"]}
            >
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>- Processes 600K+ trades per day on dYdX</li>
                <li>- Immutable X: gas-free NFT trading</li>
                <li>- Batch proofs aggregate thousands of transactions</li>
              </ul>
            </ConceptCard>

            <ConceptCard
              title="Polygon Miden"
              description="A STARK-based rollup by Polygon focused on privacy and programmability."
              badges={["Polygon", "Privacy", "Rollup"]}
            >
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>- Client-side proof generation for privacy</li>
                <li>- Miden VM: a STARK-friendly virtual machine</li>
                <li>- Concurrent transaction execution</li>
              </ul>
            </ConceptCard>

            <ConceptCard
              title="RISC Zero"
              description="A general-purpose zkVM that proves RISC-V execution using STARKs."
              badges={["zkVM", "RISC-V", "Bonsai"]}
            >
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>- Write ZK programs in Rust, C, or any RISC-V language</li>
                <li>- Bonsai network for remote proof generation</li>
                <li>- No circuit writing required &mdash; prove any program</li>
              </ul>
            </ConceptCard>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>When to Use Each System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Choose STARKs when:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>- Large-scale computation (L2 rollups, VM execution)</li>
                    <li>- Post-quantum security is a requirement</li>
                    <li>- No trusted setup ceremony is acceptable</li>
                    <li>- Prover scalability matters more than proof size</li>
                  </ul>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Choose SNARKs when:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>- On-chain verification cost must be minimized</li>
                    <li>- Small proof size is critical (e.g., on-chain storage)</li>
                    <li>- Mature tooling is needed (circom, snarkjs, Hardhat)</li>
                    <li>- Privacy applications (Zcash, Tornado Cash model)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
