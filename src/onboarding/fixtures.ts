import { tokens } from "../data";
import type { ConnectedWallet, ImportedLaunch, ImportedTrade } from "./model";
import type { Chain } from "../models";
const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
export function demoWalletAddress(chain: Chain, index: number) {
  return chain === "Solana"
    ? `Demo${"2".repeat(37)}${alphabet[index % 58]}${alphabet[Math.floor(index / 58) % 58]}${alphabet[(index + 3) % 58]}`
    : `0x${(index + 4096).toString(16).padStart(40, "0")}`;
}
export function historyForWallet(
  wallet: ConnectedWallet,
  ordinal: number,
): { launches: ImportedLaunch[]; trades: ImportedTrade[] } {
  if (wallet.origin === "new" || !wallet.proof)
    return { launches: [], trades: [] };
  const caps = [
    3200000, 1800000, 1200000, 800000, 650000, 510000, 420000, 230000, 180000,
    150000, 120000, 95000, 70000, 40000, 30000, 15000, 9000, 3000,
  ];
  const fees = [
    24, 20, 18, 15, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0.5, 0.3, 0.2,
  ];
  const names = [
    "Lumen",
    "Orbit",
    "Tide",
    "Ember",
    "Mosaic",
    "Arc",
    "Dawn",
    "Echo",
    "Halo",
    "Nori",
    "Pebble",
    "Pixel",
    "Reef",
    "Sable",
    "Wave",
    "Fern",
    "Kite",
    "Nova",
  ];
  const launches: ImportedLaunch[] = caps.map((cap, i) => ({
    id: `${wallet.id}:launch:${i}`,
    walletId: wallet.id,
    chain: wallet.chain,
    tokenAddress: demoWalletAddress(wallet.chain, 100 + ordinal * 20 + i),
    tokenName: names[i],
    ticker: names[i].toUpperCase(),
    launchedAt: new Date(Date.UTC(2026, 4, i * 7 + 2, 12)).toISOString(),
    outcome: i < 9 ? "Graduated" : i < 12 ? "Active" : "Failed",
    highestObservedCap: cap,
    creatorFees:
      Math.round(fees[i] * (wallet.chain === "Solana" ? 1 : 0.03) * 1e6) / 1e6,
    feeAsset:
      wallet.chain === "Solana"
        ? "SOL"
        : wallet.chain === "BNB Chain"
          ? "BNB"
          : "ETH",
    observationAt: new Date(Date.UTC(2026, 4, i * 7 + 5, 18)).toISOString(),
    provenance: "fictional-demo-index",
  }));
  const trades: ImportedTrade[] = Array.from({ length: 12 }, (_, i) => ({
    id: `${wallet.id}:trade:${i}`,
    walletId: wallet.id,
    chain: wallet.chain,
    tokenAddress:
      Math.floor(i / 2) === 0
        ? tokens.find((t) => t.chain === wallet.chain)?.address ||
          launches[0].tokenAddress
        : launches[Math.floor(i / 2)].tokenAddress,
    ...(Math.floor(i / 2) === 0
      ? { tokenId: tokens.find((t) => t.chain === wallet.chain)?.id }
      : {}),
    side: i % 2 ? "Sell" : "Buy",
    amountUSD: 1200 + i * 145,
    realisedPnL: i % 2 ? (i % 3 === 0 ? -180 : 420) : 0,
    timestamp: new Date(Date.UTC(2026, 9, 5 + i, 10)).toISOString(),
    evidence: "simulated",
    closesPosition: Boolean(i % 2),
  }));
  return { launches, trades };
}
