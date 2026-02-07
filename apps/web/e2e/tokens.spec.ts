import { test, expect } from "@playwright/test";

test.describe("Tokens Track", () => {
  test("displays Tokens track listing with all 11 demos", async ({ page }) => {
    await page.goto("/en/tokens");
    await expect(page.getByRole("heading", { level: 1, name: "Tokens & NFTs" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "ERC-20 Token Creator" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Token Allowance Flow" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "ERC-721 NFT Minter" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "ERC-1155 Multi-Token" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Token Vesting" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "NFT Metadata" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "NFT Marketplace" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dutch Auction" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "EIP-2981 Royalties" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Token Governance" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Soulbound Tokens" })).toBeVisible();
  });

  test("navigates to ERC-20 Token Creator demo", async ({ page }) => {
    await page.goto("/en/tokens");
    await page.getByRole("heading", { name: "ERC-20 Token Creator" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "ERC-20 Token Creator" })).toBeVisible();
    await expect(page.getByText("Token Configuration")).toBeVisible();
  });

  test("navigates to Token Governance demo", async ({ page }) => {
    await page.goto("/en/tokens/demo/token-governance");
    await expect(page.getByRole("heading", { level: 1, name: "Token Governance" })).toBeVisible();
    await expect(page.getByText("Members")).toBeVisible();
  });

  test("displays Korean translations", async ({ page }) => {
    await page.goto("/ko/tokens");
    await expect(page.getByRole("heading", { level: 1, name: "토큰 & NFT" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "ERC-20 토큰 생성기" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "소울바운드 토큰" })).toBeVisible();
  });

  test("home page shows Tokens as clickable (no Coming Soon)", async ({ page }) => {
    await page.goto("/en");
    const tokensCard = page.getByRole("heading", { name: "Tokens & NFTs" }).locator("..");
    await expect(tokensCard.getByText("Coming Soon")).not.toBeVisible();
  });
});
