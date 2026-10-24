import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("key screens pass automated WCAG A/AA checks", async ({ page }) => {
  for (const route of [
    "/",
    "/discover",
    "/people",
    "/alerts",
    "/profile",
    "/asset/t1",
    "/hire",
    "/launch",
    "/account",
  ]) {
    await page.goto(route);
    await page.locator(".wallet-screen").evaluate(async (el) => {
      await Promise.all(el.getAnimations().map((a) => a.finished));
    });
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(scan.violations, route).toEqual([]);
  }
});
test("mobile navigation and keyboard composer work", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main mobile navigation" })
    .getByRole("link", { name: "Discover", exact: true })
    .click();
  await expect(page).toHaveURL(/discover/);
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.keyboard.press("/");
  await expect(
    page.getByRole("textbox", { name: "Global search" }),
  ).toBeFocused();
});
test("wallet-only participation publishes without an X identity", async ({
  page,
}) => {
  await page.goto("/account");
  await page.getByRole("button", { name: "Wallet-only demo" }).click();
  await expect(page.getByText("Current session: wallet")).toBeVisible();
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Wallet-only · no X identity",
  );
  await page
    .getByLabel("Your thesis")
    .fill("An independent wallet-only research observation.");
  await page.getByLabel("Select demo token").selectOption("t1");
  await page.getByRole("button", { name: "Publish on Aladdin" }).click();
  await page.getByRole("button", { name: "View post" }).click();
  await expect(page.locator(".post")).toContainText("Wallet 8a2…f91");
  await page.goto("/traders");
  await expect(page.locator("tbody")).not.toContainText("Wallet 8a2…f91");
});
