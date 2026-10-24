import type {
  User,
  Token,
  Post,
  Callout,
  Trade,
  LaunchRecord,
  Milestone,
  Wallet,
  WalletRelationship,
} from "./models";
export const users: User[] = [
  ["u1", "launchking", "🧙", "Creator", "#be9a54", 42, 28, 72, 134000, 12900],
  ["u2", "marcellus", "🦊", "Creator", "#759b82", 19, 14, 64, 98000, 8200],
  ["u3", "etherwhale", "🐋", "Trader", "#6678bd", 32, 8, 68, 342000, 6100],
  ["u4", "cryptocalm", "🔮", "Caller", "#a77ec5", 12, 5, 79, 29000, 1200],
  ["u5", "solhunter", "🦁", "Trader", "#c19a66", 17, 9, 57, 101000, 3800],
  ["u6", "narrativegod", "🌸", "Caller", "#c97b9a", 6, 2, 46, -12000, 640],
  ["u7", "satori", "🐼", "Creator", "#91a9b7", 23, 11, 61, 76000, 5200],
  ["u8", "degenzero", "👾", "Trader", "#a384bc", 8, 2, 42, -8400, 290],
  ["u9", "moonweaver", "🌙", "Creator", "#7979ad", 16, 7, 53, 23000, 3100],
  ["u10", "chainreader", "🦉", "Caller", "#7bafab", 4, 1, 44, -4300, 190],
].map((r, i) => ({
  id: r[0] as string,
  name: r[1] as string,
  social: {
    provider: "x",
    externalId: `fictional-x-${i}`,
    username: r[1] as string,
    verified: i < 7,
  },
  roles:
    i === 0 ? ["Creator", "Caller"] : [r[3] as "Creator" | "Trader" | "Caller"],
  avatar: r[2] as string,
  color: r[4] as string,
  followers: 24800 - i * 1730,
  launches: r[5] as number,
  graduated: r[6] as number,
  winRate: r[7] as number,
  pnl: r[8] as number,
  fees: r[9] as number,
  bio: "Building in the open. Sharing the process, the conviction, and the lessons. Every outcome stays on the record.",
}));
const seed = [
  [
    "ALADDIN",
    "Aladdin",
    "✦",
    "#d5b866",
    12400000,
    234,
    "Solana",
    "u1",
    "Memecoins",
  ],
  [
    "MOONCAT",
    "Mooncat",
    "☾",
    "#9b93ff",
    1800000,
    45,
    "Base",
    "u2",
    "Memecoins",
  ],
  ["HYPER", "Hyper", "◈", "#5a8dff", 1200000, 142, "Solana", "u7", "AI"],
  ["SCYAI", "ScyAI", "✧", "#b68afb", 340000, -72, "Ethereum", "u1", "AI"],
  ["ROBOT", "Robot", "▣", "#daaa59", 280000, 76, "BNB Chain", "u2", "DePIN"],
  ["NOVA", "Nova", "✺", "#8495f4", 720000, 68, "Base", "u7", "DeFi"],
  ["KITTY", "Kitty", "♧", "#e880b6", 198000, -34, "Solana", "u9", "Memecoins"],
  ["ORP", "Orbit", "◎", "#8dd3bb", 120000, 38, "Robinhood Chain", "u9", "DeFi"],
];
export const tokens: Token[] = seed.map((r, i) => ({
  id: `t${i + 1}`,
  ticker: r[0] as string,
  name: r[1] as string,
  icon: r[2] as string,
  color: r[3] as string,
  cap: r[4] as number,
  change: r[5] as number,
  chain: r[6] as Token["chain"],
  creatorId: r[7] as string,
  narrative: r[8] as string,
  address:
    r[6] === "Solana"
      ? `Demo${"1".repeat(39)}${i + 1}`
      : `0x${String(i + 1).repeat(40)}`,
  price: (r[4] as number) / 1e9,
  volume: 2100000 / (i + 1),
  holders: 12432 - i * 1283,
  age: `${i + 3}d`,
  description:
    "A community-led experiment at the intersection of culture and onchain discovery. Fictional token for the Aladdin Social prototype.",
  history: Array.from({ length: 32 }, (_, j) =>
    Math.max(
      3,
      15 +
        j * (Number(r[5]) > 0 ? 1.8 : -0.25) +
        Math.sin(j * 2.3 + i) * 7 +
        Math.cos(j * 0.8) * 6,
    ),
  ),
}));
export const posts: Post[] = [
  {
    id: "p1",
    userId: "u1",
    type: "Launch",
    tokenId: "t1",
    text: "A little magic. A lot of conviction. 🪔\n\nAfter months of building, $ALADDIN is here. A community for the curious, the early, and the ones who see what’s next.\n\nThe next chapter starts with us.",
    timestamp: "2026-10-24T08:42:00Z",
    likes: 248,
  },
  {
    id: "p2",
    userId: "u3",
    type: "Trade",
    tokenId: "t2",
    text: "Added to my $MOONCAT position.\n\nSteady accumulation, growing holder distribution, and a community that keeps showing up. Watching this one closely.",
    timestamp: "2026-10-24T08:31:00Z",
    likes: 186,
  },
  {
    id: "p3",
    userId: "u4",
    type: "Callout",
    tokenId: "t3",
    text: "Beyond the AI noise — a closer look at $HYPER.\n\n• Real developer activity\n• Early community, organic growth\n• Clear roadmap and an interesting risk/reward\n\nMy thesis is public. So is the outcome.",
    timestamp: "2026-10-24T08:18:00Z",
    likes: 324,
  },
  {
    id: "p4",
    userId: "u2",
    type: "Thesis",
    tokenId: "t5",
    text: "A good launch is a beginning, not a reputation. Look at the complete history. The failed experiments matter as much as the wins.",
    timestamp: "2026-10-24T07:20:00Z",
    likes: 92,
  },
  {
    id: "p5",
    userId: "u1",
    type: "Milestone",
    tokenId: "t1",
    text: "$ALADDIN reached its 5× demonstration milestone. Original baseline stays on the record.",
    timestamp: "2026-10-24T07:10:00Z",
    likes: 141,
  },
];
export const calls: Callout[] = users
  .filter((u) => u.roles.includes("Caller"))
  .flatMap((u, j) =>
    tokens.slice(0, 5).map((t, i) => ({
      id: `c${j}-${i}`,
      userId: u.id,
      tokenId: t.id,
      timestamp: `2026-10-${15 + i}T10:00:00Z`,
      baselineCap:
        t.cap / (i % 3 === 0 ? 5 : i === 1 ? 0.45 : i === 2 ? 0.8 : 2.6),
      outcome: i % 3 === 0 ? 5 : i === 1 ? 0.45 : i === 2 ? 0.8 : 2.6,
      text: `${t.ticker}: watching community growth and liquidity. High uncertainty; this is a fictional public thesis.`,
      revisions: [],
    })),
  );
export const trades: Trade[] = users.flatMap((u, j) =>
  tokens.slice(0, 4).map((t, i) => ({
    id: `tr${j}-${i}`,
    userId: u.id,
    tokenId: t.id,
    side: i % 2 ? "Sell" : "Buy",
    amount: 1200 + i * 740,
    timestamp: `2026-10-24T0${8 - i}:15:00Z`,
  })),
);
export const launches: LaunchRecord[] = tokens.map((t, i) => ({
  id: `l${i}`,
  userId: t.creatorId,
  tokenId: t.id,
  outcome: t.change < 0 ? "Failed" : i % 2 ? "Active" : "Graduated",
  timestamp: `2026-10-${17 + i}T10:00:00Z`,
}));
export const milestones: Milestone[] = tokens.slice(0, 5).map((t, i) => ({
  id: `m${i}`,
  tokenId: t.id,
  kind: (["5×", "2×", "Migration", "10×", "2×"] as const)[i],
  startCap: t.cap / (i + 2),
  currentCap: t.cap,
  minutesAgo: i * 18 + 2,
}));
export const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: Math.abs(n) >= 1000 ? "compact" : "standard",
    maximumFractionDigits: Math.abs(n) < 1 ? 5 : 1,
  }).format(n);
export const tokenKey = (chain: string, address: string) =>
  `${chain}:${chain === "Solana" ? address : address.toLowerCase()}`;
export function validAddress(chain: string, address: string) {
  if (chain !== "Solana") return /^0x[a-fA-F0-9]{40}$/.test(address);
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return false;
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let value = 0n;
  for (const char of address)
    value = value * 58n + BigInt(alphabet.indexOf(char));
  let bytes = 0;
  for (let n = value; n > 0n; n >>= 8n) bytes++;
  const leading = address.match(/^1*/)?.[0].length || 0;
  return bytes + leading === 32;
}

export const demoWalletUser: User = {
  id: "wallet-demo",
  name: "Wallet 8a2…f91",
  participation: "wallet-only",
  social: { provider: "x", externalId: "", username: "", verified: false },
  roles: ["Trader"],
  avatar: "◈",
  color: "#7b9dc2",
  followers: 0,
  launches: 0,
  graduated: 0,
  winRate: 0,
  pnl: 0,
  fees: 0,
  bio: "Wallet-only demonstration account. No X identity linked; wallet ownership is not verified.",
};
export const personById = (id: string | undefined) =>
  id === demoWalletUser.id ? demoWalletUser : users.find((u) => u.id === id);

export const wallets: Wallet[] = users.map((u, i) => ({
  id: `w${i + 1}`,
  chain: "Base",
  address: `0x${String(i + 1)
    .padStart(2, "0")
    .repeat(20)}`,
}));
export const walletRelationships: WalletRelationship[] = users.map((u, i) => ({
  userId: u.id,
  walletId: `w${i + 1}`,
  status: "verified",
  role: u.roles.includes("Creator")
    ? "creator"
    : u.roles.includes("Trader")
      ? "trader"
      : "caller",
}));
