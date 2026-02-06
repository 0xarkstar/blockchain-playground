import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("displays hero section and track cards", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Blockchain Fundamentals" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "DeFi" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Solidity" })).toBeVisible();
  });

  test("switches language to Korean", async ({ page }) => {
    await page.goto("/ko");
    await expect(
      page.getByText("실습으로 배우는 블록체인")
    ).toBeVisible();
  });

  test("toggles dark mode", async ({ page }) => {
    await page.goto("/en");
    const toggle = page.getByLabel("Toggle color scheme");
    await toggle.click();
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-mantine-color-scheme", "dark");
  });
});
