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
import { SimpleProofDemo } from "../../../../../../components/applied-zk/education/interactive-demo";
import {
  Lock,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  Code,
  Calculator,
} from "lucide-react";

export default function SnarkEducationPage() {
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
          zk-SNARKs: Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge
        </TextAnimate>
        <p className="text-muted-foreground text-lg">
          The most widely deployed zero-knowledge proof system in blockchain,
          powering Zcash, Tornado Cash, and numerous L2 solutions.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
          <TabsTrigger value="trusted-setup">Trusted Setup</TabsTrigger>
          <TabsTrigger value="try-it">Try It</TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ── */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>What is a zk-SNARK?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                A <strong>zk-SNARK</strong> (Zero-Knowledge Succinct
                Non-Interactive Argument of Knowledge) is a cryptographic proof
                that lets a prover convince a verifier that a statement is true
                without revealing any information beyond the validity of the
                statement itself. The acronym captures its key properties:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Lock className="h-4 w-4" />
                    Zero-Knowledge
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    The verifier learns nothing about the secret witness &mdash;
                    only that it exists and satisfies the given constraints.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4" />
                    Succinct
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Proofs are tiny (~200 bytes for Groth16) and can be verified
                    in milliseconds regardless of the complexity of the original
                    computation.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4" />
                    Non-Interactive
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    A single message from prover to verifier &mdash; no
                    back-and-forth needed. This makes on-chain verification
                    practical.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    Argument of Knowledge
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    The prover must actually &ldquo;know&rdquo; the secret
                    witness. Computationally, it is infeasible to forge a valid
                    proof without the real witness.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ConceptCard
              title="Advantages"
              description="Why SNARKs are widely adopted in blockchain"
              icon={CheckCircle}
              highlight
              neonColors={{ firstColor: "#22c55e", secondColor: "#3b82f6" }}
            >
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">+</span>
                  <span>Extremely small proof size (~200 bytes with Groth16)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">+</span>
                  <span>Constant-time verification (~10ms) regardless of circuit complexity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">+</span>
                  <span>Mature ecosystem: circom, snarkjs, Zcash, Ethereum support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">+</span>
                  <span>Gas-efficient on-chain verification (~200k gas on Ethereum)</span>
                </li>
              </ul>
            </ConceptCard>

            <ConceptCard
              title="Limitations"
              description="Trade-offs to consider when choosing SNARKs"
              icon={AlertTriangle}
            >
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">!</span>
                  <span>Requires a trusted setup ceremony per circuit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">!</span>
                  <span>Not quantum-resistant &mdash; relies on elliptic curve pairings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">!</span>
                  <span>Circuit-specific: new setup needed for each different program</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">!</span>
                  <span>Toxic waste from setup must be securely destroyed</span>
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
                SNARK Pipeline: From Statement to Proof
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-muted-foreground">
                A SNARK proof goes through several mathematical transformations.
                Each step converts the computation into a form that is easier to
                prove and verify using elliptic curve cryptography.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <StepCard
              stepNumber={1}
              title="Write the Circuit (DSL)"
              description="Express the computation as an arithmetic circuit using a domain-specific language like circom."
              details={[
                "Define private inputs (witness) and public inputs/outputs",
                "Build constraints using addition and multiplication gates",
                "The circuit is a DAG of arithmetic operations over a finite field",
              ]}
            />
            <StepCard
              stepNumber={2}
              title="Compile to R1CS"
              description="The compiler converts the circuit into a Rank-1 Constraint System &mdash; a set of equations of the form A * B = C."
              details={[
                "Each constraint involves linear combinations of variables",
                "R1CS encodes the circuit as three matrices (A, B, C)",
                "A valid witness satisfies all constraints simultaneously",
              ]}
            />
            <StepCard
              stepNumber={3}
              title="Transform to QAP"
              description="The R1CS is interpolated into polynomials via a Quadratic Arithmetic Program."
              details={[
                "Lagrange interpolation converts matrix rows into polynomials",
                "Checking all constraints reduces to checking a polynomial identity",
                "The key insight: polynomial identity testing is efficient via random evaluation",
              ]}
            />
            <StepCard
              stepNumber={4}
              title="Generate the Proof"
              description="Using the proving key and the witness, compute elliptic curve points that encode the polynomial evaluations."
              details={[
                "The prover evaluates polynomials at a secret point from the setup",
                "Elliptic curve pairings enable verification without knowing the secret",
                "The final proof consists of just 3 group elements (~200 bytes in Groth16)",
              ]}
              isLast
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Concrete Example
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 font-mono text-sm">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-muted-foreground mb-2">
                    1. Circuit (circom)
                  </div>
                  <pre className="overflow-x-auto">{`signal private input x;
signal output y;
y <== x * x;`}</pre>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-muted-foreground mb-2">
                    2. R1CS Constraint
                  </div>
                  <pre className="overflow-x-auto">{`x * x = y
// With x=3, y=9: 3 * 3 = 9 ✓`}</pre>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-muted-foreground mb-2">
                    3. What Gets Proven
                  </div>
                  <pre className="overflow-x-auto">{`"I know a secret x such that x*x = 9"
// Verifier only sees: y=9, proof π
// Verifier does NOT see: x=3`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Trusted Setup Tab ── */}
        <TabsContent value="trusted-setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                The Trusted Setup Ceremony
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The trusted setup is the most controversial aspect of zk-SNARKs.
                It generates the proving key and verification key that the
                system needs, but the process produces &ldquo;toxic waste&rdquo;
                that, if not destroyed, could be used to forge proofs.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">What Happens</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>- A random secret &tau; (tau) is generated</li>
                    <li>- Powers of tau (&tau;, &tau;&sup2;, &tau;&sup3;, ...) are computed</li>
                    <li>- These are encoded as elliptic curve points</li>
                    <li>- The result is the Structured Reference String (SRS)</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg border-yellow-500/50 bg-yellow-500/5">
                  <h4 className="font-semibold mb-2 text-yellow-600 dark:text-yellow-400">
                    Toxic Waste
                  </h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>- The raw value of &tau; must be destroyed</li>
                    <li>- If anyone retains &tau;, they can forge proofs</li>
                    <li>- Multi-party ceremonies mitigate this risk</li>
                    <li>- Only ONE honest participant is needed for security</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Powers of Tau Ceremony</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Modern trusted setups use multi-party computation (MPC) to
                distribute trust. The Zcash Sapling ceremony had 87
                participants; Ethereum&apos;s KZG ceremony had over 140,000.
              </p>
              <div className="space-y-4">
                <StepCard
                  stepNumber={1}
                  title="Phase 1: Universal Powers of Tau"
                  description="Multiple participants each contribute randomness. Each one multiplies the previous result by their secret, then destroys it."
                />
                <StepCard
                  stepNumber={2}
                  title="Secure Destruction"
                  description="Each participant securely deletes their random contribution. They may physically destroy the hardware used."
                />
                <StepCard
                  stepNumber={3}
                  title="Phase 2: Circuit-Specific Setup"
                  description="The universal parameters are specialized for a particular circuit. This phase can also be a multi-party ceremony."
                  isLast
                />
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg mt-4">
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-1">
                  1-of-N Security Guarantee
                </h4>
                <p className="text-sm text-muted-foreground">
                  The ceremony is secure as long as at least one participant
                  honestly destroys their secret contribution. With thousands of
                  participants across the world, it is extremely unlikely that
                  every single one is colluding.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Try It Tab ── */}
        <TabsContent value="try-it" className="space-y-6">
          <SimpleProofDemo title="Interactive zk-SNARK Demo" />

          <Card>
            <CardHeader>
              <CardTitle>What Just Happened?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                This simplified demo illustrates the core concept of
                zero-knowledge proofs. In a real SNARK:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>
                    The proof is generated using elliptic curve cryptography,
                    not simple arithmetic
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>
                    The verifier cannot extract the secret from the proof &mdash;
                    even with unlimited computing power (computational soundness)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>
                    Proofs can express far more complex statements (e.g.,
                    Sudoku solutions, credential checks, private transfers)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>
                    On-chain verification costs ~200k gas and runs in constant
                    time via the EVM precompile for pairing checks
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
