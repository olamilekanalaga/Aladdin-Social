import { test, expect } from "./fixtures";
import AxeBuilder from "@axe-core/playwright";
test("compact creator and caller rows show only requested outcomes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 852 });
  for (const role of ["creators", "callers"]) {
    await page.goto("/" + role);
    await expect(page.locator(".compact-person").first()).toBeVisible();
    await expect(
      page.locator(".leader-context,.own-discovery-preview,.reputation-link"),
    ).toHaveCount(0);
    await expect(
      page.locator(".compact-person").first().locator("strong"),
    ).toHaveCount(role === "creators" ? 2 : 3);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({ path: `artifacts/compact-${role}-393.png` });
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".compact-person").first()).toHaveCSS(
    "animation-name",
    "none",
  );
});
test("trader periods change PnL and win rate without an activity dump", async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/traders");
  const row = page.locator(".compact-person").filter({ hasText: "etherwhale" });
  await expect(row.locator("strong").first()).toContainText("$910");
  await page.getByRole("button", { name: "7D", exact: true }).click();
  await expect(row.locator("strong").first()).toContainText("$3.3K");
  await expect(row.locator("strong").last()).toHaveText("83%");
  await page.getByRole("button", { name: "30D", exact: true }).click();
  await expect(row.locator("strong").first()).toContainText("$6.5K");
  await expect(
    page.locator(".table-note,.table-scroll,.leader-context"),
  ).toHaveCount(0);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.screenshot({ path: "artifacts/compact-traders-393.png" });
});
test("creator profile contains Created and Traded histories without placeholder contact", async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/profile/u1");
  await expect(page.getByRole("tab")).toHaveText(["Created", "Traded"]);
  await expect(
    page.locator(
      ".creator-public-contact,.creator-direct-history,.stats-grid,.evidence-note",
    ),
  ).toHaveCount(0);
  await expect(
    page
      .getByRole("region", { name: "Created tokens" })
      .locator(".history-row"),
  ).not.toHaveCount(0);
  await page.screenshot({ path: "artifacts/creator-created-393.png" });
  await page.getByRole("tab", { name: "Traded", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Trades" }).locator(".history-row"),
  ).toHaveCount(4);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "artifacts/creator-traded-393.png" });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Add funds", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Buy crypto", exact: true }),
  ).toHaveCount(0);
});
