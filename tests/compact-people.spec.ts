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
