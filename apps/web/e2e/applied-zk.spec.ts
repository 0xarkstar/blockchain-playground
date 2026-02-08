import { test, expect } from "@playwright/test";

test.describe("Applied ZK Track", () => {
  test("displays Applied ZK track listing with all 4 demos", async ({
    page,
  }) => {
    await page.goto("/en/applied-zk");
    await expect(
      page.getByRole("heading", { level: 1, name: "Applied ZK Proofs" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Hash Preimage Proof" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Age Verification" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Secret Voting" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Private Airdrop" }),
    ).toBeVisible();
  });

  test("navigates to Hash Preimage demo", async ({ page }) => {
    await page.goto("/en/applied-zk");
    await page.getByRole("heading", { name: "Hash Preimage Proof" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Hash Preimage Proof" }),
    ).toBeVisible();
  });

  test("displays Korean translations", async ({ page }) => {
    await page.goto("/ko/applied-zk");
    await expect(
      page.getByRole("heading", { level: 1, name: "응용 영지식 증명" }),
    ).toBeVisible();
    await expect(page.getByText("해시 프리이미지 증명")).toBeVisible();
    await expect(page.getByText("비밀 투표")).toBeVisible();
    await expect(page.getByText("프라이빗 에어드롭")).toBeVisible();
  });
});
