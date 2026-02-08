import { test, expect } from "@playwright/test";

test.describe("ZK Proofs Track", () => {
  test("displays ZK track listing with all 11 demos", async ({ page }) => {
    await page.goto("/en/zk");
    await expect(
      page.getByRole("heading", { level: 1, name: "ZK Proofs" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Hash Commitment" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "ZK Proof Concepts" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Schnorr Identification" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Pedersen Commitment" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Range Proof" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "ZK Set Membership" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Arithmetic Circuits" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "R1CS to QAP" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "SNARK Pipeline" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "ZK Rollup Simulator" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Private Transfer" }),
    ).toBeVisible();
  });

  test("navigates to Hash Commitment demo", async ({ page }) => {
    await page.goto("/en/zk");
    await page.getByRole("heading", { name: "Hash Commitment" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Hash Commitment" }),
    ).toBeVisible();
    await expect(page.getByLabel("Secret value").first()).toBeVisible();
  });

  test("displays Korean translations", async ({ page }) => {
    await page.goto("/ko/zk");
    await expect(
      page.getByRole("heading", { level: 1, name: "영지식 증명" }),
    ).toBeVisible();
    await expect(page.getByText("해시 커밋먼트")).toBeVisible();
    await expect(page.getByText("슈노르 식별")).toBeVisible();
    await expect(page.getByText("프라이빗 전송")).toBeVisible();
  });
});
