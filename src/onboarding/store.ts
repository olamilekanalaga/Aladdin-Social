import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ConnectedWallet,
  DemoXIdentity,
  ImportedLaunch,
  ImportedTrade,
  OwnershipProof,
} from "./model";
import { historyForWallet } from "./fixtures";
interface OnboardingState {
  completed: boolean;
  legacy: boolean;
  wallets: ConnectedWallet[];
  activeWalletId: string | null;
  xIdentity: DemoXIdentity | null;
  launches: ImportedLaunch[];
  trades: ImportedTrade[];
  addWallet: (wallet: ConnectedWallet) => void;
  verify: (id: string, proof: OwnershipProof) => void;
  importHistory: (id: string) => void;
  linkX: () => void;
  unlinkX: () => void;
  complete: () => void;
  setActive: (id: string) => void;
  reset: () => void;
}
const initial = {
  completed: false,
  legacy: false,
  wallets: [] as ConnectedWallet[],
  activeWalletId: null as string | null,
  xIdentity: null as DemoXIdentity | null,
  launches: [] as ImportedLaunch[],
  trades: [] as ImportedTrade[],
};
export const useOnboarding = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initial,
      addWallet: (wallet) =>
        set((s) =>
          s.wallets.some(
            (w) => w.chain === wallet.chain && w.address === wallet.address,
          )
            ? {}
            : {
                wallets: [...s.wallets, wallet],
                activeWalletId: s.activeWalletId || wallet.id,
              },
        ),
      verify: (id, proof) =>
        set((s) => ({
          wallets: s.wallets.map((w) => (w.id === id ? { ...w, proof } : w)),
        })),
      importHistory: (id) => {
        const s = get();
        const wallet = s.wallets.find((w) => w.id === id);
        if (!wallet?.proof) return;
        const data = historyForWallet(wallet, s.wallets.indexOf(wallet));
        set({
          launches: [
            ...s.launches.filter((l) => l.walletId !== id),
            ...data.launches,
          ],
          trades: [
            ...s.trades.filter((t) => t.walletId !== id),
            ...data.trades,
          ],
        });
      },
      linkX: () =>
        set({
          xIdentity: {
            id: "fictional-x-account-demo",
            name: "Alex River",
            username: "alexriver_demo",
            avatar: "AR",
            status: "simulated",
            linkedAt: new Date().toISOString(),
          },
        }),
      unlinkX: () => set({ xIdentity: null }),
      complete: () => set({ completed: true, legacy: false }),
      setActive: (id) => {
        if (get().wallets.some((w) => w.id === id)) set({ activeWalletId: id });
      },
      reset: () => set({ ...initial, wallets: [], launches: [], trades: [] }),
    }),
    { name: "aladdin-onboarding-v1" },
  ),
);
