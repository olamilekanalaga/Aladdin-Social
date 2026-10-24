import { calls, trades, tokens, wallets, walletRelationships } from "./data";
import type {
  Callout,
  Trade,
  User,
  Wallet,
  WalletRelationship,
} from "./models";
export function purchaseEvidence(
  call: Callout,
  activity: Trade[] = trades,
  links: WalletRelationship[] = walletRelationships,
  knownWallets: Wallet[] = wallets,
) {
  const token = tokens.find((t) => t.id === call.tokenId);
  return activity.filter(
    (t) =>
      t.userId === call.userId &&
      t.tokenId === call.tokenId &&
      t.side === "Buy" &&
      t.evidence === "demo-verified" &&
      Boolean(t.walletId) &&
      links.some(
        (r) =>
          r.userId === call.userId &&
          r.walletId === t.walletId &&
          r.status === "verified",
      ) &&
      knownWallets.some((w) => w.id === t.walletId && w.chain === token?.chain),
  );
}
export function qualifiedCalls(user: User) {
  return calls.filter(
    (c) => c.userId === user.id && purchaseEvidence(c).length > 0,
  );
}
const achievementFixtures: Record<
  string,
  { above100k: number; above500k: number; above1m: number; highest: number }
> = {
  u1: { above100k: 31, above500k: 14, above1m: 8, highest: 12400000 },
  u2: { above100k: 14, above500k: 7, above1m: 3, highest: 2800000 },
  u7: { above100k: 16, above500k: 6, above1m: 2, highest: 1700000 },
  u9: { above100k: 9, above500k: 3, above1m: 1, highest: 1300000 },
};
export function creatorAchievements(user: User) {
  return {
    ...(achievementFixtures[user.id] || {
      above100k: 0,
      above500k: 0,
      above1m: 0,
      highest: 0,
    }),
    launches: user.launches,
    graduated: user.graduated,
    fees: user.fees,
    walletCount: walletRelationships.filter(
      (r) =>
        r.userId === user.id && r.role === "creator" && r.status === "verified",
    ).length,
  };
}
export function tradingEvidence(user: User) {
  const verified = trades.filter(
    (t) =>
      t.userId === user.id &&
      t.evidence === "demo-verified" &&
      walletRelationships.some(
        (r) =>
          r.userId === user.id &&
          r.walletId === t.walletId &&
          r.status === "verified",
      ),
  );
  return {
    trades: verified,
    volume: verified.reduce((sum, t) => sum + t.amount, 0),
    closedPositions: verified.filter((t) => t.closesPosition === true).length,
    walletCount: new Set(verified.map((t) => t.walletId)).size,
  };
}
