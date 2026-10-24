import { test, expect } from "./fixtures";
import AxeBuilder from "@axe-core/playwright";
test("wallet opens on money and assets at iPhone dimensions", async ({
  page,
}) => {
  for (const [width, height] of [
    [393, 852],
    [390, 844],
    [375, 812],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(page.locator(".total-balance")).toHaveText("$2,485.60");
    await expect(page.locator(".asset-row")).toHaveCount(3);
    await expect(page.locator(".post")).toHaveCount(0);
    await expect(page.locator(".wallet-tabbar a")).toHaveText([
      "Wallet",
      "Discover",
      "Create",
      "Activity",
      "Profile",
    ]);
    const metrics = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      assetBottom: document
        .querySelectorAll(".asset-row")[2]
        .getBoundingClientRect().bottom,
      navTop: document.querySelector(".wallet-tabbar")!.getBoundingClientRect()
        .top,
      actions: [...document.querySelectorAll(".wallet-actions button")].map(
        (b) => ({
          w: b.getBoundingClientRect().width,
          h: b.getBoundingClientRect().height,
        }),
      ),
    }));
    expect(metrics.overflow).toBe(false);
    expect(metrics.assetBottom).toBeLessThan(metrics.navTop);
    expect(metrics.actions.every((a) => a.w >= 44 && a.h >= 44)).toBe(true);
    await page.locator(".wallet-screen").evaluate(async (el) => {
      await Promise.all(el.getAnimations().map((a) => a.finished));
    });
    await page.screenshot({ path: `artifacts/wallet-home-${width}.png` });
  }
});
test("wallet privacy, receive preview and local funding behave honestly", async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await page.getByRole("button", { name: "Hide balances" }).click();
  await expect(page.locator(".total-balance")).toHaveText("••••••");
  await expect(page.locator(".asset-label").first()).not.toContainText("2.45");
  await page.getByRole("button", { name: "Show balances" }).click();
  await page.getByRole("button", { name: "Receive", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("not a payment address");
  await page.screenshot({ path: "artifacts/wallet-receive-393.png" });
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Add funds", exact: true }).click();
  await page.getByRole("button", { name: "$100", exact: true }).click();
  await page.getByRole("button", { name: "Review add funds" }).click();
  await expect(page.getByRole("dialog")).toContainText("NO REAL FUNDS");
  await page.getByRole("button", { name: "Confirm simulation" }).click();
  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.locator(".total-balance")).toHaveText("$2,585.60");
  await page.reload();
  await expect(page.locator(".total-balance")).toHaveText("$2,585.60");
});
test("wallet home and receive sheet pass automated accessibility checks", async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("button", { name: "Receive", exact: true }).click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});
test("short iPhone browser viewports keep all assets reachable with persistent navigation", async ({
  page,
}) => {
  for (const [width, height] of [
    [390, 664],
    [393, 660],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(page.locator(".wallet-tabbar")).toBeVisible();
    await expect(page.locator(".total-balance")).toBeVisible();
    await page
      .locator(".wallet-screen")
      .evaluate(async (el) =>
        Promise.all(el.getAnimations().map((a) => a.finished)),
      );
    await page.screenshot({
      path: `artifacts/wallet-home-browser-${width}.png`,
    });
    await page.locator(".asset-row").filter({ hasText: "Aladdin" }).click();
    await expect(page).toHaveURL(/asset\/t1/);
    await expect(
      page.getByRole("button", { name: "Buy", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
