import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function existing(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Continue with existing wallet" })
    .click();
  await page.getByRole("radio", { name: /Browser wallet/ }).click();
  await page
    .getByRole("button", { name: "Connect demo wallet", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /Make your history yours/ }),
  ).toBeVisible();
  await expect(page.locator(".ownership-message")).toContainText("Nonce:");
  await page
    .getByRole("button", { name: "Simulate ownership signature" })
    .click();
  await expect(
    page.getByRole("progressbar", { name: "Import demo history" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Your history has been found/ }),
  ).toBeVisible();
}
async function enterExisting(page: Page) {
  await existing(page);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Simulate X connection" }).click();
  await page.getByRole("button", { name: "Continue to wallet" }).click();
  await expect(page.locator(".total-balance")).toHaveText("$2,485.60");
}
test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
});
test("existing wallet verifies, imports 18 original records, links demo X and opens inherited profile", async ({
  page,
}) => {
  await existing(page);
  await expect(page.locator(".inherited-totals")).toContainText("18");
  await expect(page.locator(".inherited-totals")).toContainText("145 SOL");
  await page.screenshot({ path: "artifacts/onboarding-history-found-393.png" });
  await page
    .getByRole("button", { name: "Inspect 18 imported records" })
    .click();
  await expect(page.locator(".imported-record")).toHaveCount(18);
  await page.getByRole("tab", { name: "Failed", exact: true }).click();
  await expect(page.locator(".imported-record")).toHaveCount(6);
  await page.locator(".imported-record summary").first().click();
  await expect(page.getByRole("dialog")).toContainText("Original wallet");
  await page.screenshot({ path: "artifacts/onboarding-records-393.png" });
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator(".x-identity-card")).toContainText(
    "Not authenticated",
  );
  await page.getByRole("button", { name: "Simulate X connection" }).click();
  await page.getByRole("button", { name: "Continue to wallet" }).click();
  await expect(page.locator(".total-balance")).toHaveText("$2,485.60");
  await page
    .getByRole("navigation", { name: "Main mobile navigation" })
    .getByRole("link", { name: "Profile", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "Alex River" })).toBeVisible();
  await page.getByRole("link", { name: "Your reputation" }).click();
  await expect(page.locator(".inherited-totals")).toContainText("145 SOL");
  await expect(page.locator(".imported-record")).toHaveCount(18);
  await expect(page.locator(".history-discovery-status")).toContainText(
    "public discovery requires",
  );
  await page.reload();
  await expect(page.locator(".imported-record")).toHaveCount(18);
});
test("new wallet creates no keys, starts with empty history, skips X and can restart onboarding", async ({
  page,
}) => {
  await page.goto("/");
  await page.screenshot({ path: "artifacts/onboarding-welcome-393.png" });
  await page.getByRole("button", { name: /Create new wallet/ }).click();
  await page.getByRole("button", { name: "Create demo wallet" }).click();
  await expect(
    page.getByRole("heading", { name: /Your demo wallet is ready/ }),
  ).toBeVisible();
  await expect(page.locator(".setup-wallet-identity code")).toHaveText(/^Demo/);
  await expect(page.locator(".empty-history")).toContainText("0 launches");
  await page.screenshot({ path: "artifacts/onboarding-new-wallet-393.png" });
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Skip for now" }).click();
  await expect(page.locator(".total-balance")).toHaveText("$0.00");
  await expect(page.locator(".asset-row")).toHaveCount(0);
  await expect(page.locator(".wallet-main .wallet-empty")).toBeVisible();
  await page.reload();
  await expect(page.locator(".total-balance")).toHaveText("$0.00");
  await page
    .getByRole("navigation", { name: "Main mobile navigation" })
    .getByRole("link", { name: "Profile", exact: true })
    .click();
  await page.getByRole("button", { name: "Restart onboarding demo" }).click();
  await page
    .getByRole("button", { name: "Reset onboarding demo", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /Welcome to Aladdin/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      Object.keys(
        JSON.parse(localStorage.getItem("aladdin-onboarding-v1")!).state,
      ).some((key) => /privatekey|seedphrase/i.test(key)),
    ),
  ).toBe(false);
});
test("optional X linking enables only a demo discovery preview while retaining wallet-only access", async ({
  page,
}) => {
  await existing(page);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.goto("/profile/identity");
  await expect(page.locator(".x-identity-card")).toContainText(
    "Not linked yet",
  );
  await page.getByRole("button", { name: "Simulate X connection" }).click();
  await expect(page.locator(".x-demo-state")).toContainText("Linked in demo");
  await expect(page.locator(".x-identity-card")).toContainText(
    "Not authenticated",
  );
  await page.screenshot({ path: "artifacts/onboarding-x-linked-393.png" });
  await page.getByRole("link", { name: "View discovery preview" }).click();
  await expect(page.locator(".own-discovery-preview")).toContainText(
    "18 launches",
  );
  await expect(page.locator(".own-discovery-preview")).toContainText(
    "Real public access requires authenticated X",
  );
  await page.goto("/profile/identity");
  await page.getByRole("button", { name: "Unlink demo X identity" }).click();
  await page.goto("/profile/history");
  await expect(page.locator(".imported-record")).toHaveCount(18);
});
test("multiple wallets aggregate history without overwriting original attribution or balances", async ({
  page,
}) => {
  await enterExisting(page);
  await page.getByRole("button", { name: "Wallet selector" }).click();
  await page.getByRole("button", { name: "Link another wallet" }).click();
  await page
    .getByRole("button", { name: "Continue with existing wallet" })
    .click();
  await page.getByRole("radio", { name: /WalletConnect/ }).click();
  await page
    .getByRole("button", { name: "Connect demo wallet", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Simulate ownership signature" })
    .click();
  await expect(
    page.getByRole("heading", { name: /Your history has been found/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add wallet to profile" }).click();
  await expect(page.locator(".managed-wallet")).toHaveCount(2);
  await page.getByRole("link", { name: "Aggregated history" }).click();
  await expect(page.locator(".inherited-totals")).toContainText("36");
  await expect(page.locator(".inherited-totals")).toContainText("290 SOL");
  await page
    .getByRole("combobox", { name: "History wallet" })
    .selectOption({ label: "Wallet 1 · Solana" });
  await expect(page.locator(".imported-record")).toHaveCount(18);
  await expect(page.locator(".inherited-totals")).toContainText("145 SOL");
  const state = await page.evaluate(
    () => JSON.parse(localStorage.getItem("aladdin-onboarding-v1")!).state,
  );
  expect(
    new Set(
      state.launches.map(
        (l: { chain: string; tokenAddress: string }) =>
          `${l.chain}:${l.tokenAddress}`,
      ),
    ).size,
  ).toBe(36);
  expect(
    new Set(state.launches.map((l: { walletId: string }) => l.walletId)).size,
  ).toBe(2);
  await page.goto("/");
  await expect(page.locator(".total-balance")).toHaveText("$2,485.60");
  await page.getByRole("button", { name: /Wallet selector/ }).click();
  await page.locator(".managed-wallet>button").nth(1).click();
  await expect(page.locator(".total-balance")).toHaveText("$0.00");
  await page.getByRole("button", { name: /Wallet selector/ }).click();
  await page.locator(".managed-wallet>button").first().click();
  await expect(page.locator(".total-balance")).toHaveText("$2,485.60");
});
test("onboarded follower receives creator announcement, launch and milestone events", async ({
  page,
}) => {
  await enterExisting(page);
  await page.goto("/profile/u1");
  await page.getByRole("button", { name: "Follow", exact: true }).click();
  await page
    .getByRole("button", { name: "Configure profile notifications" })
    .click();
  for (const name of ["Announcement", "Announcement reminder"])
    await page.getByRole("checkbox", { name, exact: true }).check();
  await page.getByRole("button", { name: "Save preferences" }).click();
  await page.goto("/launch");
  await expect(page.locator(".call-record").first()).toContainText(
    "26/10/2026",
  );
  await page
    .locator(".call-record")
    .first()
    .getByRole("button", { name: "Remind me", exact: true })
    .click();
  await page
    .locator(".call-record")
    .first()
    .getByRole("button", { name: "Simulate reminder" })
    .click();
  await expect(
    page.locator(".notification-layout").getByRole("status"),
  ).toContainText("reminder delivered");
  await page
    .locator(".call-record")
    .first()
    .getByRole("button", { name: "Simulate confirmed launch" })
    .click();
  await page.goto("/alerts");
  await expect(
    page
      .locator(".notification-row")
      .filter({ hasText: "Simulated Launch event" }),
  ).toHaveCount(1);
  await page
    .locator(".notification-row")
    .filter({ hasText: "Simulated Launch event" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Aladdin", exact: true }),
  ).toBeVisible();
  await page.goto("/alerts");
  await page.getByText("Demo event tools", { exact: true }).click();
  await page.locator(".alert-demo-tools select").last().selectOption("5×");
  await page.getByRole("button", { name: "Trigger simulated event" }).click();
  await expect(
    page.locator(".notification-row").filter({ hasText: "Simulated 5× event" }),
  ).toHaveCount(1);
});
test("onboarding mobile screens have no overflow and pass automated accessibility checks", async ({
  page,
}) => {
  for (const [width, height] of [
    [393, 852],
    [390, 664],
    [375, 812],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Welcome to Aladdin/ }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  const welcome = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(welcome.violations).toEqual([]);
  await page
    .getByRole("button", { name: "Continue with existing wallet" })
    .click();
  const connect = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(connect.violations).toEqual([]);
  await page
    .getByRole("button", { name: "Connect demo wallet", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Simulate ownership signature" }),
  ).toBeVisible();
  await page.screenshot({ path: "artifacts/onboarding-verify-375.png" });
  const verify = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(verify.violations).toEqual([]);
});
test("announcement detection unlocks a new token and delivers opt-in follower alerts", async ({
  page,
}) => {
  await enterExisting(page);
  await page.goto("/token/t-announced-demo");
  await expect(
    page.getByRole("heading", { name: "Launch not detected yet" }),
  ).toBeVisible();
  await page.goto("/launch");
  const flow = page.locator(".launch-journey-demo");
  await flow
    .getByRole("button", { name: "Follow creator", exact: true })
    .click();
  await flow.getByRole("button", { name: "Enable demo launch alerts" }).click();
  await flow
    .getByRole("button", { name: "Simulate announcement", exact: true })
    .click();
  await expect(flow.getByRole("status")).toContainText(
    "Announcement notification delivered",
  );
  await flow.getByRole("button", { name: "Simulate launch detection" }).click();
  await expect(flow.getByRole("status")).toContainText(
    "Launch notification delivered",
  );
  await flow.getByRole("button", { name: "Simulate 10×", exact: true }).click();
  await page.goto("/alerts");
  await page
    .locator(".notification-row")
    .filter({ hasText: "Simulated Launch event" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Aladdin Next", exact: true }),
  ).toBeVisible();
  await page.goto("/discover");
  await page.getByRole("textbox", { name: "Discover search" }).fill("ANXT");
  await expect(page.locator(".discover-token-row")).toHaveCount(1);
});

test("existing browser wallet balances survive the onboarding upgrade", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "aladdin-wallet-demo-v1",
      JSON.stringify({
        state: {
          balances: { usdc: 923.45 },
          transactions: [
            {
              id: "previous-browser-funds",
              type: "Add funds",
              assetId: "usdc",
              quantity: 923.45,
              usd: 923.45,
              timestamp: "2026-10-23T10:00:00Z",
            },
          ],
          hidden: false,
        },
        version: 0,
      }),
    ),
  );
  await existing(page);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Skip for now" }).click();
  await expect(page.locator(".total-balance")).toHaveText("$923.45");
  await page.getByRole("tab", { name: "Activity", exact: true }).click();
  await expect(page.locator(".wallet-main .wallet-activity")).toContainText(
    "$923.45",
  );
});
