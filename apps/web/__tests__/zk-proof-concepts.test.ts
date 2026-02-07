import { describe, it, expect } from "vitest";
import {
  simulateAliBabaCave,
  calculateSoundness,
  getZKProperties,
} from "../lib/zk/proof-concepts";

describe("ZK Proof Concepts", () => {
  describe("simulateAliBabaCave", () => {
    it("prover with secret always passes", () => {
      const sim = simulateAliBabaCave(true, 20);
      expect(sim.allPassed).toBe(true);
      expect(sim.rounds).toHaveLength(20);
      expect(sim.hasSecret).toBe(true);
    });

    it("prover without secret sometimes fails", () => {
      let anyFailed = false;
      for (let i = 0; i < 50; i++) {
        const sim = simulateAliBabaCave(false, 10);
        if (!sim.allPassed) {
          anyFailed = true;
          break;
        }
      }
      expect(anyFailed).toBe(true);
    });

    it("rounds have correct structure", () => {
      const sim = simulateAliBabaCave(true, 3);
      for (const round of sim.rounds) {
        expect(["A", "B"]).toContain(round.pathChosen);
        expect(["A", "B"]).toContain(round.verifierAsks);
        expect(typeof round.success).toBe("boolean");
      }
    });

    it("returns soundness value", () => {
      const sim = simulateAliBabaCave(false, 5);
      expect(sim.soundness).toBeCloseTo(1 / 32, 5);
    });
  });

  describe("calculateSoundness", () => {
    it("1 round = 50%", () => {
      expect(calculateSoundness(1)).toBeCloseTo(0.5);
    });
    it("10 rounds ≈ 0.098%", () => {
      expect(calculateSoundness(10)).toBeCloseTo(1 / 1024, 5);
    });
    it("20 rounds is negligible", () => {
      expect(calculateSoundness(20)).toBeLessThan(0.000001);
    });
  });

  describe("getZKProperties", () => {
    it("returns three properties", () => {
      const props = getZKProperties();
      expect(props).toHaveLength(3);
    });
    it("includes completeness, soundness, zero-knowledge", () => {
      const names = getZKProperties().map((p) => p.name);
      expect(names).toContain("Completeness");
      expect(names).toContain("Soundness");
      expect(names).toContain("Zero-Knowledge");
    });
    it("each property has description and example", () => {
      for (const prop of getZKProperties()) {
        expect(prop.description.length).toBeGreaterThan(0);
        expect(prop.example.length).toBeGreaterThan(0);
      }
    });
  });
});
