import { test, expect } from "@playwright/test";

test.describe("Solidity Track", () => {
  test("displays Solidity track listing with all 11 demos", async ({ page }) => {
    await page.goto("/en/solidity");
    await expect(page.getByRole("heading", { level: 1, name: "Solidity Deep Dive" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Storage Layout" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "ABI Encoder" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Data Types" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Access Control" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Gas Optimizer" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Event Log Inspector" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Data Locations" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Contract Interactions" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Reentrancy Attack" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Proxy Patterns" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Assembly Playground" })).toBeVisible();
  });

  test("navigates to Storage Layout demo", async ({ page }) => {
    await page.goto("/en/solidity");
    await page.getByRole("heading", { name: "Storage Layout" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Storage Layout" })).toBeVisible();
    await expect(page.getByText("Add Variable")).toBeVisible();
  });

  test("navigates to Assembly Playground demo", async ({ page }) => {
    await page.goto("/en/solidity/demo/assembly-playground");
    await expect(page.getByRole("heading", { level: 1, name: "Assembly Playground" })).toBeVisible();
    await expect(page.getByText("Templates")).toBeVisible();
  });

  test("displays Korean translations", async ({ page }) => {
    await page.goto("/ko/solidity");
    await expect(page.getByRole("heading", { level: 1, name: "솔리디티 심화" })).toBeVisible();
    await expect(page.getByText("스토리지 레이아웃")).toBeVisible();
    await expect(page.getByText("어셈블리 플레이그라운드")).toBeVisible();
  });

  test("home page shows Solidity as clickable (no Coming Soon)", async ({ page }) => {
    await page.goto("/en");
    const solidityCard = page.getByRole("heading", { name: "Solidity" }).locator("..");
    await expect(solidityCard.getByText("Coming Soon")).not.toBeVisible();
  });
});
