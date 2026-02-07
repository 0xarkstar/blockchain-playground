/**
 * ZK Proof Concepts — Ali Baba Cave analogy.
 *
 * The classic "cave with a magic door" thought experiment that explains
 * zero-knowledge proofs without any math.
 */

// ── Types ──────────────────────────────────────────────────────────────

export interface CaveRound {
  readonly round: number;
  readonly pathChosen: "A" | "B";
  readonly verifierAsks: "A" | "B";
  readonly success: boolean;
}

export interface CaveSimulation {
  readonly hasSecret: boolean;
  readonly rounds: readonly CaveRound[];
  readonly allPassed: boolean;
  readonly soundness: number;
}

export interface ZKProperty {
  readonly name: string;
  readonly description: string;
  readonly example: string;
}

// ── Simulation ─────────────────────────────────────────────────────────

function randomPath(): "A" | "B" {
  return Math.random() < 0.5 ? "A" : "B";
}

/**
 * Simulate the Ali Baba Cave protocol for numRounds.
 *
 * If the prover knows the secret (can open the magic door), they always
 * emerge from the path the verifier requests.
 *
 * If the prover does NOT know the secret, they can only succeed when they
 * happened to enter from the side the verifier asks (50 % chance).
 */
export function simulateAliBabaCave(
  hasSecret: boolean,
  numRounds: number,
): CaveSimulation {
  const rounds: CaveRound[] = [];
  for (let i = 0; i < numRounds; i++) {
    const pathChosen = randomPath();
    const verifierAsks = randomPath();
    const success = hasSecret ? true : pathChosen === verifierAsks;
    rounds.push({ round: i + 1, pathChosen, verifierAsks, success });
  }
  return {
    hasSecret,
    rounds,
    allPassed: rounds.every((r) => r.success),
    soundness: calculateSoundness(numRounds),
  };
}

/** Probability that a cheating prover passes all rounds: (1/2)^n. */
export function calculateSoundness(rounds: number): number {
  return Math.pow(0.5, rounds);
}

/** The three fundamental properties of a ZK proof. */
export function getZKProperties(): readonly ZKProperty[] {
  return [
    {
      name: "Completeness",
      description:
        "If the prover knows the secret, the verifier always accepts.",
      example:
        "A prover who can open the magic door will always emerge from the requested side.",
    },
    {
      name: "Soundness",
      description:
        "If the prover does NOT know the secret, the verifier rejects with high probability.",
      example:
        "A cheating prover has only a 1/2^n chance of fooling the verifier after n rounds.",
    },
    {
      name: "Zero-Knowledge",
      description:
        "The verifier learns nothing beyond the validity of the statement.",
      example:
        "The verifier sees the prover emerge correctly but never sees the magic door open.",
    },
  ] as const;
}
