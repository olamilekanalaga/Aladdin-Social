import { test, expect } from "@playwright/test";
test("creator discovery, follow, alerts and simulated launch notification", async ({
  page,
}) => {
  await page.goto("/creators");
  await page.getByRole("link", { name: "launchking" }).first().click();
  await expect(page.getByRole("heading", { name: "launchking" })).toBeVisible();
  await page.getByRole("button", { name: "Follow", exact: true }).click();
  await page
    .getByRole("button", { name: "Configure profile notifications" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Save preferences" }).click();
  await page.goto("/notifications");
  await page.getByRole("button", { name: "Trigger simulated event" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Simulated notification delivered.",
  );
  await page.getByRole("link", { name: /Simulated Launch event/ }).click();
  await expect(page).toHaveURL(/token\/t1/);
});
test("publish, immutable post baseline, comment, bookmark, persistence and X intent", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page
    .getByLabel("Your thesis")
    .fill("A thoughtful thesis with both opportunity and downside.");
  await page.getByLabel("Select demo token").selectOption("t1");
  await page.getByRole("button", { name: "Publish on Aladdin" }).click();
  await expect(
    page.getByRole("heading", { name: "Published on Aladdin" }),
  ).toBeVisible();
  await page.context().route("https://twitter.com/intent/**", (r) =>
    r.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<p>X intent test fixture. Publication not performed.</p>",
    }),
  );
  const popupPromise = page.waitForEvent("popup");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Share to X", exact: true })
    .click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(/twitter.com\/intent\/tweet\?text=/);
  expect(new URL(popup.url()).searchParams.get("text")).toContain("$ALADDIN");
  await popup.close();
  await page.getByRole("button", { name: "View post" }).click();
  await expect(page.locator(".post-text")).toContainText("thoughtful thesis");
  await page.getByRole("button", { name: "Bookmark post" }).click();
  await page.getByRole("button", { name: "Comment on post" }).click();
  await page
    .getByRole("textbox", { name: "Comment text" })
    .fill("What are the risks?");
  await page.getByRole("button", { name: "Post", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Bookmark post" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Comment on post" }).click();
  await expect(page.locator(".comments")).toContainText("What are the risks?");
});
test("token discovery and distinct role records", async ({ page }) => {
  await page.goto("/tokens");
  await page
    .getByRole("combobox", { name: "Token chain" })
    .selectOption("Base");
  await expect(page.locator("tbody tr")).toHaveCount(2);
  await page.getByRole("link", { name: /MOONCAT Mooncat/ }).click();
  await page.getByRole("link", { name: "marcellus" }).first().click();
  await page.getByRole("tab", { name: "Launch history" }).click();
  await expect(page.locator(".profile-content")).toContainText(
    "Launch history · sample records",
  );
  await page.goto("/callers");
  await page.getByRole("link", { name: "cryptocalm" }).first().click();
  await page.getByRole("tab", { name: "Call history" }).click();
  await expect(
    page.locator(".call-record").filter({ hasText: "Failed" }).first(),
  ).toBeVisible();
  await expect(
    page.locator(".call-record").filter({ hasText: "Successful" }).first(),
  ).toBeVisible();
  await page.goto("/traders");
  await page.getByRole("link", { name: "etherwhale" }).first().click();
  await page.getByRole("tab", { name: "Trade history" }).click();
  await expect(
    page.getByRole("heading", { name: "Trading history" }),
  ).toBeVisible();
});
test("backend enforces individual features and introductions never return contact", async ({
  request,
}) => {
  expect((await request.get("/api/creators/u1/intelligence")).status()).toBe(
    401,
  );
  const session = await (
    await request.post("/api/session", { data: { identity: "wallet" } })
  ).json();
  expect((await request.get("/api/creators/u1/intelligence")).status()).toBe(
    403,
  );
  expect(
    (
      await request.post("/api/demo/access", { data: { plan: "intelligence" } })
    ).status(),
  ).toBe(403);
  const headers = { "X-Demo-CSRF": session.csrf };
  await request.post("/api/demo/access", {
    data: { plan: "intelligence" },
    headers,
  });
  expect((await request.get("/api/creators/u1/intelligence")).status()).toBe(
    200,
  );
  expect(
    (
      await request.post("/api/introductions", {
        headers,
        data: {
          creatorId: "u1",
          brief: "A real project brief of sufficient length.",
          budget: "Exploring options",
        },
      })
    ).status(),
  ).toBe(403);
  await request.post("/api/demo/access", {
    headers,
    data: { plan: "opportunities" },
  });
  const response = await request.post("/api/introductions", {
    headers,
    data: {
      creatorId: "u1",
      brief: "A real project brief of sufficient length.",
      budget: "Exploring options",
    },
  });
  expect(response.status()).toBe(201);
  expect(await response.json()).not.toHaveProperty("contact");
  expect((await request.get("/api/creators/u1/intelligence")).status()).toBe(
    403,
  );
});
test("hiring flow and announcement reminders", async ({ page }) => {
  await page.goto("/hire");
  await page
    .getByRole("button", { name: "Simulate introduction access" })
    .click();
  await page
    .getByLabel("What do you want to build?")
    .fill(
      "We need an experienced creator to help plan a transparent community launch.",
    );
  await page
    .getByRole("button", { name: "Record demo introduction request" })
    .click();
  await expect(page.getByRole("status")).toContainText("Demo request recorded");
  await page.goto("/launch");
  await page
    .getByLabel("Announcement", { exact: true })
    .fill("A new community experiment");
  await page.getByRole("button", { name: "Publish announcement" }).click();
  await expect(
    page.getByRole("heading", { name: "A new community experiment" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "A new community experiment" }),
  ).toBeVisible();
});
test("all routes render and responsive viewports have no horizontal overflow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const width of [1536, 834, 390]) {
    await page.setViewportSize({ width, height: 1024 });
    for (const route of [
      "/",
      "/creators",
      "/traders",
      "/callers",
      "/hire",
      "/tokens",
      "/launch",
      "/terminal",
      "/notifications",
      "/account",
      "/lists",
      "/narratives",
      "/rewards",
      "/portfolio",
      "/token/t1",
    ]) {
      await page.goto(route);
      await expect(page.locator("h1,h2").first()).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${route} at ${width}`,
      ).toBeTruthy();
    }
    await page.goto("/");
    await expect(page.locator(".post .recharts-surface").first()).toBeVisible();
    if (width === 1536)
      await expect(
        page.locator(".detail-column .recharts-surface").first(),
      ).toBeVisible();
    await page.screenshot({
      path: `artifacts/home-${width}.png`,
      fullPage: true,
    });
    await page.screenshot({ path: `artifacts/home-${width}-viewport.png` });
    if (width === 1536) {
      await page.goto("/hire");
      await page.screenshot({
        path: "artifacts/hire-desktop.png",
        fullPage: true,
      });
    }
  }
  expect(errors).toEqual([]);
});
