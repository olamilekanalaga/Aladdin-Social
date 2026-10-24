import { useStore } from "./store";
import { tokens, users } from "./data";
import type { Chain, Token, Wallet, Post, AppNotification } from "./models";
export const demoMarket = {
  async listTokens() {
    return tokens.filter((t) => isTokenAvailable(t.id));
  },
  async search(query: string) {
    const q = query.toLowerCase();
    return {
      tokens: tokens
        .filter((t) => isTokenAvailable(t.id))
        .filter((t) =>
          `${t.name} ${t.ticker} ${t.chain} ${t.address}`
            .toLowerCase()
            .includes(q),
        ),
      users: users.filter((u) => u.name.includes(q)),
    };
  },
};
export interface XOAuthAdapter {
  signIn(): Promise<{ externalId: string }>;
}
export interface HistoricalSearchAdapter {
  search(query: string): Promise<Post[]>;
}
export interface MarketDataAdapter {
  getToken(chain: Chain, address: string): Promise<Token | null>;
}
export interface RpcAdapter {
  getWallet(address: string, chain: Chain): Promise<Wallet>;
}
export interface AnalyticsAdapter {
  query(queryId: string): Promise<unknown[]>;
}
export interface NotificationDeliveryAdapter {
  deliver(notification: AppNotification): Promise<void>;
}
export interface WalletConnectionAdapter {
  connect(chain: Chain): Promise<Wallet>;
}
export interface TradingExecutionAdapter {
  quote(token: Token, amount: number): Promise<never>;
}
// Future adapters: SocialData → HistoricalSearchAdapter; SolanaTracker → MarketDataAdapter;
// Dune → AnalyticsAdapter; Solana/EVM RPC → RpcAdapter. No paid or production calls.
export const tradingExecution: TradingExecutionAdapter = {
  async quote() {
    throw new Error("Real-money trading is disabled in this prototype.");
  },
};

export function isTokenAvailable(id: string) {
  return id !== "t-announced-demo" || useStore.getState().demoTokenDiscovered;
}

// Future execution boundaries. Demo screens never submit real transactions.
export interface LaunchExecutionAdapter {
  review(input: {
    chain: Chain;
    name: string;
    ticker: string;
    supply: number;
  }): Promise<{ fee: number; expiresAt: string }>;
  submit(
    confirmedIntent: string,
  ): Promise<{ chain: Chain; address: string; transactionId: string }>;
}
export interface BridgeExecutionAdapter {
  preview(input: {
    from: Chain;
    to: Chain;
    asset: string;
    amount: number;
  }): Promise<{ received: number; fee: number }>;
  submit(confirmedIntent: string): Promise<{ transactionId: string }>;
}
