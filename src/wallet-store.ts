import { isTokenAvailable } from "./services";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { tokens, validAddress } from "./data";
import type { Chain } from "./models";
export interface WalletAsset {
  id: string;
  name: string;
  ticker: string;
  chain: Chain;
  price: number;
  change: number;
  icon: string;
  color: string;
  tokenId?: string;
}
export const walletAssets: WalletAsset[] = [
  {
    id: "sol",
    name: "Solana",
    ticker: "SOL",
    chain: "Solana",
    price: 510.4 / 2.45,
    change: 4.2,
    icon: "◎",
    color: "#b7a4fa",
  },
  {
    id: "usdc",
    name: "USD Coin",
    ticker: "USDC",
    chain: "Solana",
    price: 1,
    change: 0,
    icon: "$",
    color: "#70aaff",
  },
  ...tokens.map((t) => ({
    id: t.id,
    name: t.name,
    ticker: t.ticker,
    chain: t.chain,
    price: t.price,
    change: t.change,
    icon: t.icon,
    color: t.color,
    tokenId: t.id,
  })),
];
export interface WalletTransaction {
  id: string;
  type: "Send" | "Swap" | "Add funds" | "Buy" | "Sell";
  assetId: string;
  quantity: number;
  usd: number;
  timestamp: string;
  toAssetId?: string;
  received?: number;
  recipient?: string;
}
interface Operation {
  id: string;
  type: WalletTransaction["type"];
  assetId: string;
  quantity: number;
  toAssetId?: string;
  recipient?: string;
}
interface WalletState {
  balances: Record<string, number>;
  activeWalletId: string;
  ledgers: Record<
    string,
    { balances: Record<string, number>; transactions: WalletTransaction[] }
  >;
  activateWallet: (id: string, seed?: boolean) => void;
  clearAccount: () => void;
  hidden: boolean;
  transactions: WalletTransaction[];
  toggleHidden: () => void;
  execute: (op: Operation) => { ok: boolean; error?: string };
  reset: () => void;
}
const initialBalances = { sol: 2.45, usdc: 800, t1: 1175.2 / tokens[0].price };
const initialTransactions: WalletTransaction[] = [
  {
    id: "seed-buy",
    type: "Buy",
    assetId: "t1",
    quantity: 1175.2 / tokens[0].price,
    usd: 1175.2,
    timestamp: "2026-10-24T08:15:00Z",
    toAssetId: "t1",
    received: 1175.2 / tokens[0].price,
  },
  {
    id: "seed-deposit",
    type: "Add funds",
    assetId: "usdc",
    quantity: 800,
    usd: 800,
    timestamp: "2026-10-23T12:00:00Z",
  },
];
export const assetById = (id: string | undefined) =>
  walletAssets.find((a) => a.id === id);
export const walletTotal = (balances: Record<string, number>) =>
  walletAssets.reduce((sum, a) => sum + (balances[a.id] || 0) * a.price, 0);
export const formatUSD = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
export const quantity = (n: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: n < 0.01 ? 8 : n < 1 ? 4 : 2,
  }).format(n);
export const DEMO_SPREAD = 0.005;
export const useWallet = create<WalletState>()(
  persist(
    (set, get) => ({
      balances: { ...initialBalances },
      activeWalletId: "legacy",
      ledgers: {},
      clearAccount: () =>
        set({
          balances: {},
          transactions: [],
          ledgers: {},
          activeWalletId: "legacy",
          hidden: false,
        }),
      activateWallet: (id, seed = false) => {
        const s = get();
        if (s.activeWalletId === id) return;
        const ledgers = {
          ...s.ledgers,
          [s.activeWalletId]: {
            balances: s.balances,
            transactions: s.transactions,
          },
        };
        const ledger =
          ledgers[id] ||
          (seed && s.activeWalletId === "legacy"
            ? { balances: s.balances, transactions: s.transactions }
            : {
                balances: seed ? { ...initialBalances } : {},
                transactions: seed ? [...initialTransactions] : [],
              });
        set({
          activeWalletId: id,
          ledgers,
          balances: ledger.balances,
          transactions: ledger.transactions,
        });
      },
      hidden: false,
      transactions: [...initialTransactions],
      toggleHidden: () => set((s) => ({ hidden: !s.hidden })),
      reset: () => {
        const s = get();
        const seeded =
          s.activeWalletId === "legacy" ||
          s.transactions.some((t) => t.id === "seed-buy");
        set({
          balances: seeded ? { ...initialBalances } : {},
          transactions: seeded ? [...initialTransactions] : [],
          hidden: false,
        });
      },
      execute: (op) => {
        const s = get();
        if (s.transactions.some((t) => t.id === op.id))
          return {
            ok: false,
            error: "This simulation has already been recorded.",
          };
        const asset = assetById(op.assetId);
        const target = assetById(op.toAssetId);
        if (!asset || !Number.isFinite(op.quantity) || op.quantity <= 0)
          return {
            ok: false,
            error: "Enter a valid amount greater than zero.",
          };
        if (
          !isTokenAvailable(asset.id) ||
          (target && !isTokenAvailable(target.id))
        )
          return {
            ok: false,
            error: "The demo launch has not been detected yet.",
          };
        const balance = s.balances[asset.id] || 0;
        if (op.type !== "Add funds" && op.quantity > balance + 1e-10)
          return { ok: false, error: "Insufficient demo balance." };
        if (
          op.type === "Add funds" &&
          (asset.id !== "usdc" || op.quantity > 100000)
        )
          return {
            ok: false,
            error: "Demo deposits support up to $100,000 USDC.",
          };
        if (
          ["Swap", "Buy", "Sell"].includes(op.type) &&
          (!target || target.id === asset.id)
        )
          return { ok: false, error: "Choose two different assets." };
        if (
          ["Swap", "Buy", "Sell"].includes(op.type) &&
          target &&
          sourceChainMismatch(asset, target)
        )
          return {
            ok: false,
            error: "Cross-chain swaps are not supported in this demo.",
          };
        if (
          op.type === "Send" &&
          !validAddress(asset.chain, op.recipient || "")
        )
          return {
            ok: false,
            error: "Enter a valid recipient address for the asset network.",
          };
        const next = { ...s.balances };
        const usd = op.quantity * asset.price;
        let received: number | undefined;
        if (op.type === "Add funds") next[asset.id] = balance + op.quantity;
        else {
          next[asset.id] = Math.max(0, balance - op.quantity);
          if (target && op.type !== "Send") {
            received = (usd * (1 - DEMO_SPREAD)) / target.price;
            next[target.id] = (next[target.id] || 0) + received;
          }
        }
        const tx: WalletTransaction = {
          ...op,
          quantity: op.quantity,
          usd,
          timestamp: new Date().toISOString(),
          ...(received !== undefined ? { received } : {}),
        };
        set({ balances: next, transactions: [tx, ...s.transactions] });
        return { ok: true };
      },
    }),
    { name: "aladdin-wallet-demo-v1" },
  ),
);

function sourceChainMismatch(a: WalletAsset, b: WalletAsset) {
  return a.chain !== b.chain;
}
