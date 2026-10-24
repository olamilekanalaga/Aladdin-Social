import { test, expect } from "@playwright/test";
import { tokens, calls, validAddress, tokenKey } from "../src/data";
test("chain address pairs are unique and every seeded address validates", () => {
  expect(new Set(tokens.map((t) => tokenKey(t.chain, t.address))).size).toBe(
    tokens.length,
  );
  for (const t of tokens)
    expect(
      validAddress(t.chain, t.address),
      `${t.ticker} ${t.chain}`,
    ).toBeTruthy();
  expect(
    validAddress("Solana", "11111111111111111111111111111111"),
  ).toBeTruthy();
  expect(
    validAddress("Solana", "111111111111111111111111111111111"),
  ).toBeFalsy();
  expect(validAddress("Base", "0xshort")).toBeFalsy();
  expect(validAddress("Solana", "0x" + "a".repeat(40))).toBeFalsy();
  expect(tokenKey("Base", "0xABCD")).toBe(tokenKey("Base", "0xabcd"));
  expect(tokenKey("Base", "0x123")).not.toBe(tokenKey("Ethereum", "0x123"));
});
test("caller records include failed outcomes and original baselines", () => {
  expect(calls.some((c) => c.outcome < 1)).toBeTruthy();
  expect(calls.some((c) => c.outcome >= 2)).toBeTruthy();
  for (const c of calls) {
    expect(Date.parse(c.timestamp)).toBeGreaterThan(0);
    expect(c.baselineCap).toBeGreaterThan(0);
    expect(c.revisions).toEqual([]);
  }
});
import { londonLocalToISO } from "../src/time";
test("London launch scheduling respects summer and winter time", () => {
  expect(londonLocalToISO("2026-10-26T17:00")).toBe("2026-10-26T17:00:00.000Z");
  expect(londonLocalToISO("2026-07-01T17:00")).toBe("2026-07-01T16:00:00.000Z");
  expect(() => londonLocalToISO("2026-03-29T01:30")).toThrow();
});
