export type Chain =
  "Solana" | "Base" | "Ethereum" | "BNB Chain" | "Robinhood Chain";
export type Role = "Creator" | "Trader" | "Caller";
export interface SocialIdentity {
  provider: "x";
  externalId: string;
  username: string;
  verified: boolean;
}
export interface Wallet {
  id: string;
  chain: Chain;
  address: string;
}
export interface WalletRelationship {
  userId: string;
  walletId: string;
  status: "verified" | "inferred";
  role:
    "creator" | "deployer" | "fee-recipient" | "promoter" | "caller" | "trader";
}
export interface User {
  participation?: "social-linked" | "wallet-only";
  id: string;
  name: string;
  social: SocialIdentity;
  roles: Role[];
  avatar: string;
  color: string;
  followers: number;
  launches: number;
  graduated: number;
  winRate: number;
  pnl: number;
  fees: number;
  bio: string;
}
export interface Token {
  id: string;
  chain: Chain;
  address: string;
  name: string;
  ticker: string;
  icon: string;
  color: string;
  price: number;
  cap: number;
  change: number;
  volume: number;
  holders: number;
  age: string;
  creatorId: string;
  narrative: string;
  description: string;
  history: number[];
}
export interface LaunchRecord {
  id: string;
  userId: string;
  tokenId: string;
  outcome: "Graduated" | "Failed" | "Active";
  timestamp: string;
}
export interface FeeRecord {
  userId: string;
  tokenId: string;
  amount: number;
  attribution: "demo verified";
}
export interface Trade {
  walletId?: string;
  evidence?: "demo-verified" | "unverified";
  closesPosition?: boolean;
  id: string;
  userId: string;
  tokenId: string;
  side: "Buy" | "Sell";
  amount: number;
  timestamp: string;
}
export interface Position {
  userId: string;
  tokenId: string;
  realised: number;
  unrealised: number;
}
export interface Callout {
  id: string;
  userId: string;
  tokenId: string;
  timestamp: string;
  baselineCap: number;
  outcome: number;
  text: string;
  revisions: { text: string; timestamp: string }[];
}
export interface Thesis {
  id: string;
  text: string;
  originalTimestamp: string;
  revisions: { text: string; timestamp: string }[];
}
export interface Post {
  id: string;
  userId: string;
  type: "Launch" | "Trade" | "Thesis" | "Callout" | "Milestone";
  tokenId: string;
  text: string;
  timestamp: string;
  likes: number;
  image?: string;
  chart?: boolean;
  tag?: string;
  baseline?: {
    chain: Chain;
    address: string;
    marketCap: number;
    price: number;
    timestamp: string;
  };
  revisions?: { text: string; timestamp: string }[];
}
export interface Follow {
  userId: string;
  targetId: string;
}
export type NotificationCategory =
  | "Launch"
  | "Post"
  | "Graduation"
  | "Migration"
  | "Buy"
  | "Sell"
  | "Thesis"
  | "Callout"
  | "2×"
  | "5×"
  | "10×"
  | "Price movement"
  | "Announcement"
  | "Announcement reminder";
export interface AppNotification {
  id: string;
  userId: string;
  tokenId: string;
  category: NotificationCategory;
  text: string;
  timestamp: string;
  read: boolean;
}
export interface Milestone {
  id: string;
  tokenId: string;
  kind: "2×" | "5×" | "10×" | "Migration";
  startCap: number;
  currentCap: number;
  minutesAgo: number;
}
export interface ReputationMetric {
  userId: string;
  label: string;
  value: number;
  methodology: string;
}

export type FeaturePermission =
  | "creator.identity"
  | "wallet.relationships"
  | "intelligence.export"
  | "hiring.introduction"
  | "subscription.research";
export interface Account {
  id: string;
  userId?: string;
  participation: "social-linked" | "wallet-only";
  features: FeaturePermission[];
}
export interface CreatorSubscription {
  id: string;
  creatorId: string;
  subscriberAccountId: string;
  status: "demo" | "inactive";
  benefits: ("research" | "community" | "custom-alerts")[];
  platformFeeBps: number;
}
export interface LaunchAnnouncement {
  id: string;
  creatorId: string;
  text: string;
  scheduledAt: string;
  timezone: "Europe/London";
  status: "scheduled" | "confirmed" | "cancelled";
  tokenId?: string;
}
