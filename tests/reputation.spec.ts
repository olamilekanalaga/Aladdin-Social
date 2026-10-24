import { test, expect } from "@playwright/test";
import { users, calls, trades, wallets, validAddress } from "../src/data";
import {
  purchaseEvidence,
  qualifiedCalls,
  creatorAchievements,
} from "../src/reputation";
import {
  discoveryEligibility,
  summarizeHistory,
} from "../src/onboarding/model";
import {
  historyForWallet,
  demoWalletAddress,
} from "../src/onboarding/fixtures";
test("verified caller eligibility requires matching-token, matching-chain attested purchases", () => {
  const qualified = calls.find((c) => c.userId === "u4" && c.tokenId === "t1")!;
  expect(purchaseEvidence(qualified)).toHaveLength(1);
  expect(
    purchaseEvidence(
      qualified,
      trades.map((t) => ({ ...t, tokenId: "wrong-token" })),
    ),
  ).toHaveLength(0);
  expect(purchaseEvidence(qualified, trades, [], wallets)).toHaveLength(0);
  expect(qualifiedCalls(users.find((u) => u.id === "u6")!)).toHaveLength(0);
  const unbought = calls.find((c) => c.userId === "u4" && c.tokenId === "t2")!;
  expect(purchaseEvidence(unbought)).toHaveLength(0);
});
test("import summaries preserve exact metrics, failed launches and separate wallet/token identity", () => {
  const wallet = {
    id: "first",
    label: "Wallet 1",
    address: demoWalletAddress("Solana", 0),
    chain: "Solana" as const,
    origin: "existing" as const,
    connection: "browser" as const,
    proof: {
      kind: "simulated" as const,
      message: "demo",
      nonce: "demo",
      acceptedAt: "2026-10-24T10:00:00Z",
    },
    createdAt: "2026-10-24T10:00:00Z",
  };
  const data = historyForWallet(wallet, 0);
  const stats = summarizeHistory(data.launches, data.trades);
  expect(stats.launches).toBe(18);
  expect(stats.graduated).toBe(9);
  expect(stats.above1m).toBe(3);
  expect(stats.failed).toBe(6);
  expect(stats.fees.SOL).toBe(145);
  const other = historyForWallet(
    { ...wallet, id: "second", address: demoWalletAddress("Solana", 1) },
    1,
  );
  expect(
    new Set(
      [...data.launches, ...other.launches].map(
        (l) => l.chain + ":" + l.tokenAddress,
      ),
    ).size,
  ).toBe(36);
  expect(data.launches.every((l) => l.walletId === "first")).toBe(true);
  expect(historyForWallet({ ...wallet, proof: null }, 0).launches).toHaveLength(
    0,
  );
  expect(discoveryEligibility([wallet], null).demoEligible).toBe(false);
  const eligibility = discoveryEligibility([wallet], {
    id: "demo",
    name: "Alex",
    username: "alex",
    avatar: "AR",
    status: "simulated",
    linkedAt: "2026-10-24",
  });
  expect(eligibility.demoEligible).toBe(true);
  expect(eligibility.publicEligible).toBe(false);
});
test("creator rankings expose direct achievements and wallet fixture addresses validate", () => {
  const a = creatorAchievements(users[0]);
  expect(a.above1m).toBeLessThanOrEqual(a.above500k);
  expect(a.above500k).toBeLessThanOrEqual(a.above100k);
  expect(a.above100k).toBeLessThanOrEqual(a.launches);
  expect(a).not.toHaveProperty("score");
  for (const w of wallets)
    expect(validAddress(w.chain, w.address), w.id).toBe(true);
});
