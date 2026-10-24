import { test, expect } from "@playwright/test";
import { tokens } from "../src/data";
test("send validates network address and amount before changing a persisted holding", async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await page.getByRole("combobox", { name: "Pay asset" }).selectOption("usdc");
  await page.getByLabel("Amount in USDC").fill("10");
  await page.getByLabel("Recipient address").fill("invalid-recipient");
  await page.getByRole("button", { name: "Review send" }).click();
  await expect(page.getByRole("alert")).toContainText("valid Solana");
  await page.getByLabel("Recipient address").fill(tokens[0].address);
  await page.getByRole("button", { name: "Review send" }).click();
  await page.getByRole("button", { name: "Confirm simulation" }).click();
  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.locator(".total-balance")).toHaveText("$2,475.60");
  await page.getByRole("tab", { name: "Activity", exact: true }).click();
  await expect(page.locator(".wallet-main .wallet-activity")).toContainText(
    "Sent USDC",
  );
  await page.reload();
  await expect(page.locator(".total-balance")).toHaveText("$2,475.60");
});
test("buy and sell use review steps, update the wallet, and retain creator research", async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await page.locator(".asset-row").filter({ hasText: "Aladdin" }).click();
  await expect(page).toHaveURL(/asset\/t1/);
  await page.getByRole("button", { name: "Buy", exact: true }).click();
  await page.getByLabel("Amount in USDC").fill("100");
  await page.getByRole("button", { name: "Review buy" }).click();
  await expect(page.getByRole("dialog")).toContainText("0.5%");
  await page.getByRole("button", { name: "Confirm simulation" }).click();
  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.locator(".your-position")).toContainText("$1,274.70");
  await page.getByRole("button", { name: "Sell", exact: true }).click();
  await page.getByLabel("Amount in ALADDIN").fill("1000");
  await page.getByRole("button", { name: "Review sell" }).click();
  await page.getByRole("button", { name: "Confirm simulation" }).click();
  await page.getByRole("button", { name: "Done" }).click();
  await page.getByRole("tab", { name: "Transactions", exact: true }).click();
  await expect(page.locator(".asset-detail-grid")).toContainText(
    "Sold ALADDIN",
  );
  await page.getByRole("link", { name: "Explore track record" }).click();
  await expect(
    page.getByRole("heading", { name: "launchking", exact: true }),
  ).toBeVisible();
  await page.goto("/");
  await expect(page.locator(".total-balance")).toHaveText("$2,485.04");
});
test("swap rejects overspending; unsupported networks never simulate a bridge", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Swap", exact: true }).click();
  await page.getByLabel("Amount in SOL").fill("99");
  await page.getByRole("button", { name: "Review swap" }).click();
  await expect(page.getByRole("alert")).toContainText("Insufficient");
  await page.getByLabel("Amount in SOL").fill("1");
  await page.getByRole("button", { name: "Review swap" }).click();
  await page.getByRole("button", { name: "Confirm simulation" }).click();
  await page.getByRole("button", { name: "Done" }).click();
  await expect(
    page.locator(".asset-row").filter({ hasText: "Solana" }).first(),
  ).toContainText("1.45 SOL");
  await page.goto("/token/t2");
  await page.getByRole("button", { name: "Buy", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Cross-chain bridging and settlement are not implemented",
  );
  await expect(
    page.getByRole("button", { name: "Confirm simulation" }),
  ).toHaveCount(0);
});
