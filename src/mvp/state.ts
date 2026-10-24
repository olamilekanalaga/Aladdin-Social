import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useStore } from "../store";
import { tokens } from "../data";
import { walletAssets } from "../wallet-store";
import type { Token } from "../models";
export interface CreatedLaunch {
  token: Token;
  walletId: string;
  supply: number;
  launchpad: string;
  image: string;
  timestamp: string;
}
interface MVPState {
  launches: CreatedLaunch[];
  callPurchases: Record<string, string>;
  saveLaunch: (launch: CreatedLaunch) => void;
  associate: (postId: string, transactionId: string) => void;
}
export function registerToken(t: Token) {
  if (!tokens.some((v) => v.id === t.id)) tokens.push(t);
  if (!walletAssets.some((v) => v.id === t.id))
    walletAssets.push({ ...t, tokenId: t.id });
}
export const useMVP = create<MVPState>()(
  persist(
    (set) => ({
      launches: [],
      callPurchases: {},
      saveLaunch: (launch) => {
        registerToken(launch.token);
        set((s) => ({ launches: [...s.launches, launch] }));
      },
      associate: (postId, transactionId) =>
        set((s) => ({
          callPurchases: { ...s.callPurchases, [postId]: transactionId },
        })),
    }),
    { name: "aladdin-mvp-v1" },
  ),
);
export function restoreLaunchedTokens() {
  useMVP.getState().launches.forEach((l) => registerToken(l.token));
}

export function resetMVP() {
  const ids = new Set(useMVP.getState().launches.map((l) => l.token.id));
  for (let i = tokens.length - 1; i >= 0; i--)
    if (ids.has(tokens[i].id)) tokens.splice(i, 1);
  for (let i = walletAssets.length - 1; i >= 0; i--)
    if (ids.has(walletAssets[i].id)) walletAssets.splice(i, 1);
  useStore.setState((s) => ({
    posts: s.posts.filter(
      (p) =>
        !ids.has(p.tokenId) &&
        !["account-demo", "wallet-demo"].includes(p.userId),
    ),
  }));
  useMVP.setState({ launches: [], callPurchases: {} });
}
