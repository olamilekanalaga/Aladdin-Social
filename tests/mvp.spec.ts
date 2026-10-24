import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function onboard(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText(/Demo sign-in uses/)).toBeVisible();
  await page
    .getByRole("button", { name: "Continue with existing wallet" })
    .click();
  await page
    .getByRole("button", { name: "Connect demo wallet", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Simulate ownership signature" })
    .click();
  await expect(
    page.getByRole("heading", { name: /Your history has been found/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Simulate X connection" }).click();
  await page.getByRole("button", { name: "Continue to wallet" }).click();
  await expect(page.locator(".total-balance")).toHaveText("$2,485.60");
}
async function buy(page: Page, amount = "100") {
  await page.getByLabel("Amount in USDC").fill(amount);
  await page.getByRole("button", { name: "Review buy" }).click();
  await page.getByRole("button", { name: "Confirm simulation" }).click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
}
test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
});
test("creator launches a reviewed token, updates wallet-level history and retains discovery after reload", async ({
  page,
}) => {
  await onboard(page);
  await page.getByRole("link", { name: "Create token", exact: true }).click();
  await page.getByLabel("Token name", { exact: true }).fill("Blue Lantern");
  await page.getByLabel("Ticker", { exact: true }).fill("LANTERN");
  await page
    .getByLabel("Description", { exact: true })
    .fill(
      "A fictional community token for testing creator history. No promised return.",
    );
  await page.screenshot({ path: "artifacts/mvp-create-details-393.png" });
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Total supply", { exact: true }).fill("1000000");
  await page.getByLabel("Initial market cap", { exact: false }).fill("20000");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Confirm simulated launch" }),
  ).toBeDisabled();
  await page.getByRole("checkbox").check();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "artifacts/mvp-create-review-393.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Confirm simulated launch" }).click();
  await expect(
    page.getByRole("heading", { name: /Blue Lantern is ready/ }),
  ).toBeVisible();
  await page.screenshot({ path: "artifacts/mvp-launch-result-393.png" });
  await page
    .getByText("Test follower launch delivery", { exact: true })
    .click();
  await page
    .getByRole("checkbox", { name: "Demo follower has Launch alerts enabled" })
    .check();
  await page.getByRole("button", { name: "Deliver follower preview" }).click();
  await page.getByRole("link", { name: "Open simulated notification" }).click();
  await page
    .getByRole("link", { name: /Demo follower preview: Blue Lantern/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "Blue Lantern", exact: true }),
  ).toBeVisible();
  const tokenURL = page.url();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Blue Lantern", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Buy", exact: true }).click();
  await buy(page);
  await expect(page.locator(".your-position")).toContainText("$99.50");
  await page.getByRole("link", { name: "View creator history" }).click();
  await expect(page.locator(".imported-record")).toHaveCount(19);
  await page
    .locator(".imported-record")
    .filter({ hasText: "LANTERN" })
    .locator("summary")
    .click();
  await page.getByRole("link", { name: "Open simulated token" }).click();
  await expect(page).toHaveURL(tokenURL);
  await page.goto("/discover");
  await page.getByLabel("Discover search").fill("LANTERN");
  await expect(page.getByRole("link", { name: /Blue Lantern/ })).toBeVisible();
  await page.goto("/");
  await expect(page.locator(".total-balance")).toHaveText("$2,485.10");
  await page.goto("/assets");
  await expect(
    page.locator(".asset-row").filter({ hasText: "Blue Lantern" }),
  ).toContainText("$99.50");
});
test("call precedes buy, qualifies through its recorded purchase and preserves original attribution", async ({
  page,
}) => {
  await onboard(page);
  await page.goto("/create");
  await page.getByRole("button", { name: "Publish a call or thesis" }).click();
  await page.getByRole("tab", { name: "Callout", exact: true }).click();
  await page
    .getByLabel("Your callout")
    .fill(
      "A test call recorded before my purchase. This is fictional activity, with downside risk.",
    );
  await page.getByLabel("Select demo token").selectOption("t1");
  await page.getByRole("button", { name: "Publish on Aladdin" }).click();
  await page.getByRole("button", { name: "View post", exact: true }).click();
  const original = await page
    .locator(".mvp-call-evidence .mvp-facts")
    .innerText();
  await expect(page.locator(".mvp-call-evidence")).toContainText(
    "Unverified call",
  );
  await page.getByRole("button", { name: "Buy from this call" }).click();
  await page.getByLabel("Amount in USDC").fill("100");
  await page.getByRole("button", { name: "Review buy" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Attributed to original caller",
  );
  await page.getByRole("button", { name: "Confirm simulation" }).click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page
    .getByLabel("Associate a qualifying demo purchase")
    .selectOption({ index: 1 });
  await expect(page.locator(".mvp-call-evidence")).toContainText(
    "Demo purchase associated",
  );
  await expect(page.locator(".mvp-call-evidence")).toContainText(
    "$0.30 · fictional, unpaid",
  );
  const postURL = page.url();
  await page.reload();
  await expect(page.locator(".mvp-call-evidence")).toContainText(
    "Demo purchase associated",
  );
  expect(
    await page.locator(".mvp-call-evidence .mvp-facts").innerText(),
  ).toContain(original.split("Observed call return")[0]);
  await page.screenshot({ path: "artifacts/mvp-call-evidence-393.png" });
  await page.getByRole("link", { name: "Open token details" }).click();
  await page.getByRole("button", { name: "Sell", exact: true }).click();
  await page.getByLabel("Amount in ALADDIN").fill("1000");
  await page.getByRole("button", { name: "Review sell" }).click();
  await page.getByRole("button", { name: "Confirm simulation" }).click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.goto(postURL);
  await expect(page.locator(".mvp-call-evidence")).toContainText(
    "active-wallet estimate",
  );
  await page.goto("/activity");
  await expect(page.locator(".wallet-activity")).toContainText("Sold ALADDIN");
});
test("bridge walkthrough never mutates wallet balances", async ({ page }) => {
  await onboard(page);
  const before = await page.locator(".total-balance").textContent();
  await page.getByRole("button", { name: "Bridge", exact: true }).click();
  await page.getByLabel("To network").selectOption("Solana");
  await page.getByRole("button", { name: "Preview bridge" }).click();
  await expect(page.getByRole("alert")).toContainText("different networks");
  await page.getByLabel("To network").selectOption("Base");
  await page.getByRole("button", { name: "Preview bridge" }).click();
  await page.screenshot({ path: "artifacts/mvp-bridge-preview-393.png" });
  await page.getByRole("button", { name: "Confirm demonstration" }).click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect(page.locator(".total-balance")).toHaveText(before!);
});
test("creator achievement filters lead to server-authorised hiring and a local notification receipt", async ({
  page,
}) => {
  await onboard(page);
  await page.goto("/creators");
  await page.getByLabel("Min. launches").fill("999");
  await expect(
    page.getByText(
      "No people match your filters. Try a lower achievement threshold.",
    ),
  ).toBeVisible();
  await page.getByLabel("Min. launches").fill("10");
  await page.getByLabel("Min. graduations").fill("1");
  await page
    .getByRole("link", { name: /launchking/ })
    .first()
    .click();
  await page
    .getByRole("link", { name: "Request hiring contact", exact: true })
    .first()
    .click();
  await page
    .getByLabel("What do you want to build?")
    .fill(
      "We need help planning a fictional community launch with clear milestones and transparent token distribution.",
    );
  await page
    .getByRole("button", { name: "Simulate introduction access" })
    .click();
  await page
    .getByRole("button", { name: "Record demo introduction request" })
    .click();
  await expect(page.getByRole("status")).toContainText("Demo request recorded");
  await page.goto("/alerts");
  await expect(
    page.getByText("Demo hiring request recorded. No contact sent."),
  ).toBeVisible();
});
test("mobile navigation and creation form remain accessible on iPhone and desktop", async ({
  page,
}) => {
  await onboard(page);
  for (const [width, height] of [
    [375, 812],
    [393, 852],
    [1280, 900],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/create/token");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await expect(page.locator(".wallet-tabbar a")).toHaveText([
    "Wallet",
    "Discover",
    "Create",
    "Activity",
    "Profile",
  ]);
  await page.screenshot({ path: "artifacts/mvp-wallet-393.png" });
});
test("a follower buys from an original public call and retains the original caller on the activity receipt", async ({
  page,
}) => {
  await onboard(page);
  await page.goto("/post/c0-0");
  await expect(page.locator(".mvp-call-evidence")).toContainText(
    "Demo purchase associated",
  );
  await expect(page.locator(".mvp-call-evidence")).toContainText(
    "$2,480,000.00",
  );
  await page.getByRole("button", { name: "Buy from this call" }).click();
  await page.getByLabel("Amount in USDC").fill("100");
  await page.getByLabel("Receive asset", { exact: true }).selectOption("sol");
  await page.getByRole("button", { name: "Review buy" }).click();
  await expect(page.getByRole("alert")).toContainText("original call’s token");
  await page.getByLabel("Receive asset", { exact: true }).selectOption("t1");
  await buy(page);
  await expect(page.locator(".mvp-call-evidence")).toContainText(
    "$0.30 · fictional, unpaid",
  );
  await page.goto("/activity");
  await page.getByRole("link", { name: /via @launchking/ }).click();
  await expect(page).toHaveURL(/post\/c0-0/);
  await page.goto("/post/c0-1");
  await expect(page.locator(".mvp-call-evidence")).toContainText(
    "Unverified call",
  );
});
