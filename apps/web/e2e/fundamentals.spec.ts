import { test, expect } from "@playwright/test";

test.describe("Fundamentals Track", () => {
  test("displays Fundamentals track listing with all 11 demos", async ({
    page,
  }) => {
    await page.goto("/en/fundamentals");
    await expect(
      page.getByRole("heading", { level: 1, name: "Blockchain Fundamentals" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Hash Explorer" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Digital Signature Studio" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Block Builder" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Chain Integrity" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Merkle Proof Verifier" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Mining Simulator" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Transaction Builder" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Wallet Workshop" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Consensus Playground" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "State Explorer" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Gas Estimator" }),
    ).toBeVisible();
  });

  test("navigates to Hash Explorer demo", async ({ page }) => {
    await page.goto("/en/fundamentals");
    await page.getByRole("heading", { name: "Hash Explorer" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Hash Explorer" }),
    ).toBeVisible();
    await expect(page.getByText("Input Text")).toBeVisible();
  });

  test("displays Korean translations", async ({ page }) => {
    await page.goto("/ko/fundamentals");
    await expect(
      page.getByRole("heading", { level: 1, name: "블록체인 기초" }),
    ).toBeVisible();
    await expect(page.getByText("해시 탐색기")).toBeVisible();
    await expect(page.getByText("디지털 서명 스튜디오")).toBeVisible();
    await expect(page.getByText("가스 추정기")).toBeVisible();
  });
});
