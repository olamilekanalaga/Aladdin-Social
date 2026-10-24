import { test, expect } from "@playwright/test";
import { spawn, type ChildProcess } from "node:child_process";
import { randomBytes } from "node:crypto";
const children: ChildProcess[] = [];
test.beforeAll(async () => {
  const key = randomBytes(32).toString("hex");
  for (const port of [3401, 3402]) {
    const child = spawn(process.execPath, ["server/index.mjs"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PORT: String(port),
        ALADDIN_SOCIAL_DEMO_SESSION_SECRET: key,
      },
      stdio: "ignore",
    });
    children.push(child);
    let ready = false;
    for (let i = 0; i < 50; i++) {
      try {
        const response = await fetch(`http://127.0.0.1:${port}/api/session`);
        if (response.status === 401) {
          ready = true;
          break;
        }
      } catch {
        // The child may still be starting; retry the readiness request.
      }
      await new Promise((r) => setTimeout(r, 50));
    }
    if (!ready) throw new Error("Test API instance failed to start");
  }
});
test.afterAll(() => children.forEach((child) => child.kill()));
test("sessions, feature permissions and introduction receipts work across independent instances", async ({
  request,
}) => {
  const first = "http://127.0.0.1:3401",
    second = "http://127.0.0.1:3402";
  const session = await (
    await request.post(first + "/api/session", { data: { identity: "wallet" } })
  ).json();
  expect((await request.get(second + "/api/session")).status()).toBe(200);
  const headers = { "X-Demo-CSRF": session.csrf };
  await request.post(second + "/api/demo/access", {
    data: { plan: "intelligence" },
    headers,
  });
  expect(
    (await request.get(first + "/api/creators/u1/intelligence")).status(),
  ).toBe(200);
  await request.post(first + "/api/demo/access", {
    data: { plan: "opportunities" },
    headers,
  });
  const response = await request.post(second + "/api/introductions", {
    data: {
      creatorId: "u1",
      brief: "An introduction brief that meets minimum length.",
      budget: "Exploring options",
    },
    headers,
  });
  expect(response.status()).toBe(201);
  const created = await response.json();
  const receipts = await (
    await request.get(first + "/api/introductions")
  ).json();
  expect(receipts[0].id).toBe(created.id);
  expect(receipts[0]).not.toHaveProperty("brief");
  expect(
    (await request.get(second + "/api/creators/u1/intelligence")).status(),
  ).toBe(403);
});
test("tampered sessions and non-ASCII CSRF headers are rejected without server errors", async ({
  request,
}) => {
  const base = "http://127.0.0.1:3401";
  await request.post(base + "/api/session", { data: { identity: "social" } });
  expect(
    (
      await request.post(base + "/api/demo/access", {
        data: { plan: "intelligence" },
        headers: { "X-Demo-CSRF": "é".repeat(48) },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.get(base + "/api/session", {
        headers: { Cookie: "aladdin_session=invalid.invalid" },
      })
    ).status(),
  ).toBe(401);
});
