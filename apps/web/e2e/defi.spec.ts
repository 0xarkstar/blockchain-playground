import { test, expect } from "@playwright/test";

test.describe("DeFi Track", () => {
  test("displays DeFi track listing with all 11 demos", async ({ page }) => {
    await page.goto("/en/defi");
    await expect(
      page.getByRole("heading", { level: 1, name: "DeFi" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Simple Swap" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Liquidity Pool" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Impermanent Loss" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Lending Protocol" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Interest Rate Explorer" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Staking Rewards" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Flash Loan" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Arbitrage Simulator" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Oracle Price Feed" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Liquidation Simulator" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Yield Calculator" }),
    ).toBeVisible();
  });

  test("navigates to Simple Swap demo", async ({ page }) => {
    await page.goto("/en/defi/demo/simple-swap");
    await expect(
      page.getByRole("heading", { level: 1, name: "Simple Swap" }),
    ).toBeVisible();
    await expect(page.getByText("Pool Reserves")).toBeVisible();
  });

  test("navigates to Flash Loan demo", async ({ page }) => {
    await page.goto("/en/defi/demo/flash-loan");
    await expect(
      page.getByRole("heading", { level: 1, name: "Flash Loan" }),
    ).toBeVisible();
    await expect(page.getByText("Transaction Simulation")).toBeVisible();
  });

  test("displays Korean translations", async ({ page }) => {
    await page.goto("/ko/defi");
    await expect(
      page.getByRole("heading", { level: 1, name: "디파이" }),
    ).toBeVisible();
    await expect(page.getByText("간단한 스왑")).toBeVisible();
    await expect(page.getByText("유동성 풀")).toBeVisible();
    await expect(page.getByText("수익률 계산기")).toBeVisible();
  });

  test("home page shows DeFi as clickable (no Coming Soon)", async ({
    page,
  }) => {
    await page.goto("/en");
    const defiCard = page.getByRole("heading", { name: "DeFi" }).locator("..");
    await expect(defiCard.getByText("Coming Soon")).not.toBeVisible();
  });
});
