import type { Chain } from "../models";
export type DemoMethod = "browser" | "walletconnect" | "sdk-preview";
export interface OwnershipProof {
  kind: "simulated";
  message: string;
  nonce: string;
  acceptedAt: string;
}
export interface ConnectedWallet {
  id: string;
  label: string;
  address: string;
  chain: Chain;
  origin: "existing" | "new";
  connection: DemoMethod | "created-demo";
  proof: OwnershipProof | null;
  createdAt: string;
}
export interface ImportedLaunch {
  id: string;
  walletId: string;
  chain: Chain;
  tokenAddress: string;
  tokenName: string;
  ticker: string;
  launchedAt: string;
  outcome: "Graduated" | "Active" | "Failed";
  highestObservedCap: number;
  creatorFees: number;
  feeAsset: string;
  observationAt: string;
  provenance: "fictional-demo-index" | "aladdin-demo-launch";
}
export interface ImportedTrade {
  id: string;
  walletId: string;
  chain: Chain;
  tokenAddress: string;
  tokenId?: string;
  side: "Buy" | "Sell";
  amountUSD: number;
  realisedPnL: number;
  timestamp: string;
  evidence: "simulated";
  closesPosition: boolean;
}
export interface DemoXIdentity {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: "simulated";
  linkedAt: string;
}
export interface HistorySummary {
  launches: number;
  graduated: number;
  failed: number;
  above100k: number;
  above500k: number;
  above1m: number;
  highestCap: number;
  fees: Record<string, number>;
  trades: number;
  volume: number;
  realisedPnL: number;
  closedPositions: number;
}
export function summarizeHistory(
  launches: ImportedLaunch[],
  trades: ImportedTrade[],
): HistorySummary {
  return {
    launches: launches.length,
    graduated: launches.filter((l) => l.outcome === "Graduated").length,
    failed: launches.filter((l) => l.outcome === "Failed").length,
    above100k: launches.filter((l) => l.highestObservedCap >= 100000).length,
    above500k: launches.filter((l) => l.highestObservedCap >= 500000).length,
    above1m: launches.filter((l) => l.highestObservedCap >= 1000000).length,
    highestCap: Math.max(0, ...launches.map((l) => l.highestObservedCap)),
    fees: launches.reduce<Record<string, number>>(
      (acc, l) => ({
        ...acc,
        [l.feeAsset]:
          Math.round(((acc[l.feeAsset] || 0) + l.creatorFees) * 1e6) / 1e6,
      }),
      {},
    ),
    trades: trades.length,
    volume: trades.reduce((n, t) => n + t.amountUSD, 0),
    realisedPnL: trades.reduce((n, t) => n + t.realisedPnL, 0),
    closedPositions: trades.filter((t) => t.closesPosition).length,
  };
}
export function discoveryEligibility(
  wallets: ConnectedWallet[],
  x: DemoXIdentity | null,
) {
  return {
    demoEligible: Boolean(x && wallets.some((w) => w.proof)),
    publicEligible: false as const,
    reason: !x
      ? "Link an X identity to preview social discovery."
      : !wallets.some((w) => w.proof)
        ? "Verify a wallet to attach activity to an identity."
        : "Demo preview enabled. Actual public discovery requires authenticated X OAuth and a real ownership proof.",
  };
}
