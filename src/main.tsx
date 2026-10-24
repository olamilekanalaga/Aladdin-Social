import {
  creatorAchievements,
  purchaseEvidence,
  tradingEvidence,
} from "./reputation";
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import {
  Home,
  Compass,
  CircleUserRound,
  ChevronDown,
  Users,
  Bell,
  Search,
  Plus,
  ArrowUpRight,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Check,
  ChevronRight,
  Flame,
  Trophy,
  Zap,
  Globe,
  Copy,
  ExternalLink,
  SlidersHorizontal,
  CheckCheck,
  ArrowLeft,
  ShieldCheck,
  Star,
} from "lucide-react";
const LazySpark = React.lazy(() => import("./Spark"));
function Spark(props: { token: Token; big?: boolean }) {
  return (
    <React.Suspense
      fallback={<div className={props.big ? "spark big" : "spark"} />}
    >
      <LazySpark {...props} />
    </React.Suspense>
  );
}
import {
  users,
  tokens,
  launches,
  calls,
  trades,
  milestones,
  money,
  validAddress,
  demoWalletUser,
  onboardingDemoUser,
  personById,
  wallets,
  walletRelationships,
} from "./data";
import { useStore } from "./store";
import { walletAssets } from "./wallet-store";
import { demoMarket } from "./services";
import type { User, Token, Post, NotificationCategory, Chain } from "./models";
import "./style.css";
import Modal from "./ui/Modal";
import { useOnboarding } from "./onboarding/store";
import { OnboardingFlow, WalletManagementPage } from "./onboarding/Onboarding";
import { HistoricalProfile, IdentityManagement } from "./onboarding/History";
import {
  WalletHome,
  Discover,
  People,
  MyProfile,
  AssetDetail,
  WalletActivity,
  WalletAssets,
} from "./Wallet";
import {
  Opportunities,
  IntelligenceAccess,
  LaunchExperience,
  Terminal,
  AccountAccess,
} from "./Experiences";
const nav = [
  ["Home", "/", Home],
  ["Discover", "/discover", Compass],
  ["People", "/people", Users],
  ["Alerts", "/alerts", Bell],
  ["Profile", "/profile", CircleUserRound],
] as const;
const chains: Chain[] = [
  "Solana",
  "Base",
  "Ethereum",
  "BNB Chain",
  "Robinhood Chain",
];
function Avatar({ user, size = 36 }: { user: User; size?: number }) {
  return (
    <span
      className="avatar"
      style={{
        background: user.color + "28",
        borderColor: user.color + "70",
        width: size,
        height: size,
        fontSize: size * 0.52,
      }}
    >
      {user.avatar}
    </span>
  );
}
function TokenIcon({ token }: { token: Token }) {
  return (
    <span
      className="token-icon"
      style={{
        color: token.color,
        background: token.color + "18",
        borderColor: token.color + "60",
      }}
    >
      {token.icon}
    </span>
  );
}
function Badge({ children }: { children: React.ReactNode }) {
  return <span className="badge">{children}</span>;
}
function Tabs({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (s: string) => void;
}) {
  return (
    <div className="tabs" role="tablist">
      {items.map((i) => (
        <button
          role="tab"
          aria-selected={value === i}
          className={value === i ? "active" : ""}
          key={i}
          onClick={() => onChange(i)}
        >
          {i}
        </button>
      ))}
    </div>
  );
}
function Follow({ user }: { user: User }) {
  const s = useStore();
  return (
    <button
      className={
        s.follows.includes(user.id) ? "button followed" : "button light"
      }
      onClick={() => s.toggle("follows", user.id)}
    >
      {s.follows.includes(user.id) ? (
        <>
          <Check size={13} /> Following
        </>
      ) : (
        <>
          <Plus size={13} /> Follow
        </>
      )}
    </button>
  );
}
function Identity({
  user,
  onNavigate,
}: {
  user: User;
  onNavigate?: () => void;
}) {
  return (
    <Link className="identity" onClick={onNavigate} to={`/profile/${user.id}`}>
      <Avatar user={user} />
      <span>
        <strong>
          {user.name}{" "}
          {user.social.verified && <ShieldCheck size={13} className="blue" />}
        </strong>
        <small>
          {user.participation === "wallet-only"
            ? "Wallet-only · no X identity"
            : `@${user.social.username}`}
        </small>
      </span>
    </Link>
  );
}
function sharePost(post: Post) {
  const t = tokens.find((t) => t.id === post.tokenId)!;
  const text = `${post.text.slice(0, 160)}\n$${t.ticker}\n${t.chain}: ${t.address}\n${location.origin}/post/${post.id}`;
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    "_blank",
    "noopener,noreferrer",
  );
}
function App() {
  const onboarding = useOnboarding();
  const [composer, setComposer] = useState(false);
  const [query, setQuery] = useState("");
  const s = useStore();
  const location = useLocation();
  const section =
    location.pathname === "/" ||
    location.pathname.startsWith("/asset") ||
    location.pathname === "/activity"
      ? "/"
      : location.pathname.startsWith("/profile") ||
          location.pathname === "/account"
        ? "/profile"
        : location.pathname === "/alerts" ||
            location.pathname === "/notifications"
          ? "/alerts"
          : location.pathname === "/people" ||
              ["/creators", "/callers", "/traders", "/hire"].includes(
                location.pathname,
              )
            ? "/people"
            : "/discover";
  React.useEffect(() => {
    const shortcut = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLSelectElement)
      ) {
        e.preventDefault();
        document
          .querySelector<HTMLInputElement>('[aria-label="Global search"]')
          ?.focus();
      }
    };
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, []);
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  const results = useQuery({
    queryKey: ["search", query, s.demoTokenDiscovered],
    queryFn: () => demoMarket.search(query),
    enabled: query.trim().length > 0,
  });
  const nativeMatches = walletAssets.filter(
    (a) =>
      !a.tokenId &&
      query.trim() &&
      `${a.name} ${a.ticker}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const navigation = (className: string) => (
    <nav
      className={className}
      aria-label={
        className === "wallet-tabbar"
          ? "Main mobile navigation"
          : "Main navigation"
      }
    >
      {nav.map(([label, to, Icon]) => (
        <Link
          key={label}
          to={to}
          className={section === to ? "active" : ""}
          aria-current={section === to ? "page" : undefined}
        >
          <span>
            <Icon size={21} strokeWidth={1.65} />
            {label === "Alerts" && s.notifications.some((n) => !n.read) && (
              <i className="wallet-alert-dot" />
            )}
          </span>
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
  if (!onboarding.completed || location.pathname === "/onboarding/add")
    return (
      <OnboardingFlow
        key={location.pathname}
        adding={onboarding.completed && location.pathname === "/onboarding/add"}
      />
    );
  return (
    <div className="wallet-app">
      <header className="wallet-app-header">
        <div className="wallet-header-inner">
          <Link className="wallet-brand" to="/" aria-label="Aladdin home">
            <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
              <path
                d="M6 18h20l-3 7H12zM6 18l-4-5 8 3M25 18c7-5 9 3 1 4M15 26h8v2H13z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <path
                d="M17 15c-5-6 7-5 2-12 10 7-1 10-2 12"
                fill="currentColor"
              />
            </svg>
            <b>Aladdin</b>
          </Link>
          {navigation("wallet-desktop-nav")}{" "}
          <div className="search-wrap">
            <Search size={17} />
            <input
              aria-label="Global search"
              onKeyDown={(e) => {
                if (e.key === "Escape") setQuery("");
              }}
              placeholder="Search people, tokens, or a contract address…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <kbd>/</kbd>
            {query && (
              <div className="search-results">
                {results.isPending ? (
                  <p>Searching…</p>
                ) : (
                  <>
                    {results.data?.users.map((u) => (
                      <div key={u.id}>
                        <Identity user={u} onNavigate={() => setQuery("")} />
                      </div>
                    ))}
                    {nativeMatches.map((a) => (
                      <Link
                        to={`/asset/${a.id}`}
                        key={a.id}
                        onClick={() => setQuery("")}
                      >
                        <span className="token-icon" style={{ color: a.color }}>
                          {a.icon}
                        </span>
                        <span>
                          {a.name}
                          <small>
                            {a.ticker} · {a.chain}
                          </small>
                        </span>
                      </Link>
                    ))}
                    {results.data?.tokens.map((t) => (
                      <Link
                        key={t.id}
                        onClick={() => setQuery("")}
                        to={`/token/${t.id}`}
                      >
                        <TokenIcon token={t} />
                        <span>
                          {t.name}
                          <small>
                            {t.chain} · ${t.ticker}
                          </small>
                        </span>
                      </Link>
                    ))}
                    {!results.data?.users.length &&
                      !results.data?.tokens.length &&
                      !nativeMatches.length && (
                        <p>No matching people or tokens.</p>
                      )}
                  </>
                )}
              </div>
            )}
          </div>
          <div className="wallet-header-actions">
            {["/discover", "/feed", "/people", "/profile", "/account"].includes(
              location.pathname,
            ) && (
              <button
                className="icon-button"
                aria-label="Create"
                onClick={() => setComposer(true)}
              >
                <Plus size={21} />
              </button>
            )}
            <Link
              className="wallet-header-avatar"
              aria-label="Your demo account"
              to="/profile"
            >
              {s.participation === "wallet" ? "◈" : "✦"}
            </Link>
          </div>
        </div>
      </header>
      <main className="wallet-app-main">
        <div className="wallet-screen" key={location.pathname}>
          {" "}
          <Routes>
            <Route
              path="/discover"
              element={<Discover renderPost={(p) => <PostCard post={p} />} />}
            />
            <Route path="/people" element={<People />} />
            <Route path="/alerts" element={<Notifications />} />
            <Route
              path="/profile"
              element={<MyProfile account={<AccountAccess />} />}
            />
            <Route
              path="/feed"
              element={<Dashboard onCreate={() => setComposer(true)} />}
            />

            <Route path="/" element={<WalletHome />} />
            <Route
              path="/creators"
              element={<People key="Creator" initial="Creator" />}
            />
            <Route
              path="/traders"
              element={<People key="Trader" initial="Trader" />}
            />
            <Route
              path="/callers"
              element={<People key="Caller" initial="Caller" />}
            />
            <Route path="/profile/history" element={<HistoricalProfile />} />
            <Route
              path="/profile/account-demo"
              element={<HistoricalProfile />}
            />
            <Route path="/profile/wallets" element={<WalletManagementPage />} />
            <Route path="/profile/identity" element={<IdentityManagement />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/tokens" element={<TokenDirectory />} />
            <Route path="/token/:id" element={<AssetDetail />} />
            <Route path="/asset/:id" element={<AssetDetail />} />
            <Route path="/activity" element={<WalletActivity />} />
            <Route path="/assets" element={<WalletAssets />} />
            <Route path="/hire" element={<Opportunities />} />
            <Route path="/launch" element={<LaunchExperience />} />
            <Route path="/terminal" element={<Terminal />} />
            <Route path="/account" element={<AccountAccess />} />
            <Route path="/lists" element={<Lists />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/narratives" element={<Narratives />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/portfolio" element={<WalletHome />} />
            <Route path="/post/:id" element={<PostPage />} />
            <Route
              path="*"
              element={
                <div className="panel empty">
                  <h1>Page not found</h1>
                  <Link to="/">Return home</Link>
                </div>
              }
            />
          </Routes>
        </div>
      </main>
      <footer className="wallet-app-footer">
        Aladdin Social <span>Demo only · No real funds or execution</span>
      </footer>
      {navigation("wallet-tabbar")}
      {composer && <Composer close={() => setComposer(false)} />}
    </div>
  );
}
function Dashboard({ onCreate }: { onCreate: () => void }) {
  const [filter, setFilter] = useState("For You");
  const [selected, setSelected] = useState("t1");
  const [chain, setChain] = useState("All chains");
  const s = useStore();
  const list = s.posts.filter(
    (p) =>
      (chain === "All chains" ||
        tokens.find((t) => t.id === p.tokenId)?.chain === chain) &&
      (filter === "For You" ||
        (filter === "Following" && s.follows.includes(p.userId)) ||
        (filter === "Creators" &&
          users.find((u) => u.id === p.userId)?.roles.includes("Creator")) ||
        (filter === "Traders" && p.type === "Trade") ||
        (filter === "Callers" && ["Callout", "Thesis"].includes(p.type)) ||
        (filter === "Launches" && p.type === "Launch") ||
        (filter === "Milestones" && p.type === "Milestone")),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>
            Your onchain perspective<span className="gold">.</span>
          </h1>
          <p>The people, the plays, and the proof behind them.</p>
        </div>
        <label className="chain-select">
          <Globe size={14} />
          <select
            aria-label="Feed chain"
            value={chain}
            onChange={(e) => setChain(e.target.value)}
          >
            {["All chains", ...chains].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="dashboard">
        <section className="feed-column">
          <div className="feed-tabs">
            <Tabs
              items={[
                "For You",
                "Following",
                "Creators",
                "Traders",
                "Callers",
                "Launches",
                "Milestones",
              ]}
              value={filter}
              onChange={setFilter}
            />
          </div>
          <button className="quick-compose" onClick={onCreate}>
            <Avatar
              user={
                s.participation === "wallet"
                  ? demoWalletUser
                  : useOnboarding.getState().legacy
                    ? users[0]
                    : onboardingDemoUser
              }
              size={33}
            />
            <span>Share a thesis. Make your conviction count.</span>
            <Plus size={18} />
          </button>
          {list.map((p) => (
            <PostCard key={p.id} post={p} select={setSelected} />
          ))}
          {!list.length && (
            <div className="panel empty">
              No activity yet. Follow people or try another filter.
            </div>
          )}
          <Link className="opportunity-banner" to="/hire">
            <span className="gold">
              <Users size={21} />
            </span>
            <span>
              <b>Good history opens new doors.</b>
              <small>
                Discover experienced creators open to opportunities.
              </small>
            </span>
            <ArrowUpRight size={17} />
          </Link>
          <div className="feed-end">
            <span>✦</span> You’re seeing the bigger picture.
            <small>Explore people to discover your next perspective.</small>
          </div>
        </section>
        <aside className="intelligence">
          <Trending select={setSelected} />
          <TopCreators />
          <Milestones select={setSelected} />
          <div className="insight">
            <ShieldCheck size={20} />
            <h3>Reputation is a history.</h3>
            <p>
              Every launch. Every call. Every outcome.
              <br />
              Look beyond the highlight reel.
            </p>
            <Link to="/creators">
              Explore creator histories <ArrowUpRight size={13} />
            </Link>
          </div>
        </aside>
        <aside className="detail-column">
          <TokenDetail token={tokens.find((t) => t.id === selected)!} />
        </aside>
      </div>
    </>
  );
}
function PostCard({
  post,
  select,
}: {
  post: Post;
  select?: (s: string) => void;
}) {
  const s = useStore();
  const [comments, setComments] = useState(false);
  const [text, setText] = useState("");
  const u = personById(post.userId) || users[0];
  const t = tokens.find((t) => t.id === post.tokenId)!;
  return (
    <article className={`post panel ${post.type.toLowerCase()}`}>
      <div className="post-head">
        <Identity user={u} />
        <Badge>
          {post.type === "Launch"
            ? "Creator"
            : post.type === "Trade"
              ? "Trader"
              : post.type === "Callout"
                ? "Caller"
                : u.roles[0]}
        </Badge>
        <time title={post.timestamp}>
          {new Date(post.timestamp).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC",
          })}
        </time>
      </div>
      {post.type === "Trade" && (
        <div className="trade-line">
          <span className="positive">↗ Bought</span> $2,400 of ${t.ticker}{" "}
          <span>· Simulated trade</span>
        </div>
      )}
      <p className="post-text">{post.text}</p>
      {post.baseline && (
        <div className="baseline-record">
          <ShieldCheck size={12} />
          <span>
            Original baseline {money(post.baseline.marketCap)} ·{" "}
            {new Date(post.baseline.timestamp).toLocaleString("en-GB")} ·
            Simulated
          </span>
        </div>
      )}
      <div className="contract-line">
        <span>CA</span>
        <button
          title="Copy full contract address"
          onClick={() => navigator.clipboard.writeText(t.address)}
        >
          {t.address.slice(0, 9)}…{t.address.slice(-7)} <Copy size={11} />
        </button>
        <Badge>{t.chain}</Badge>
      </div>
      <button
        className="token-preview"
        onClick={() =>
          select ? select(t.id) : location.assign(`/token/${t.id}`)
        }
      >
        <TokenIcon token={t} />
        <span>
          <strong>{t.ticker}</strong>
          <small>
            {t.name} · {t.chain}
          </small>
        </span>
        <span className="preview-cap">
          <small>Market cap</small>
          <b>{money(t.cap)}</b>
        </span>
        <span className={t.change > 0 ? "positive" : "negative"}>
          {t.change > 0 ? "+" : ""}
          {t.change}%
        </span>
        <Spark token={t} />
        <ChevronRight size={14} />
      </button>
      {post.image && (
        <img className="post-image" src={post.image} alt="Post attachment" />
      )}
      {post.chart && <Spark token={t} big />}
      {post.tag && <Badge>#{post.tag}</Badge>}
      <div className="social-actions">
        <button
          aria-label={`Like post · ${post.likes + Number(s.likes.includes(post.id))}`}
          aria-pressed={s.likes.includes(post.id)}
          className={s.likes.includes(post.id) ? "liked" : ""}
          onClick={() => s.toggle("likes", post.id)}
        >
          <Heart size={15} />
          {post.likes + Number(s.likes.includes(post.id))}
        </button>
        <button
          aria-label={`Comment on post · ${s.comments[post.id]?.length || 0}`}
          onClick={() => setComments(!comments)}
        >
          <MessageCircle size={15} />
          {s.comments[post.id]?.length || 0}
        </button>
        <button aria-label="Share to X" onClick={() => sharePost(post)}>
          <Share2 size={15} />
          <span>Share</span>
        </button>
        <span className="post-type">
          {post.type === "Callout"
            ? "Timestamped call"
            : post.type === "Launch"
              ? "New launch"
              : "Public record"}
        </span>
        <button
          aria-label="Bookmark post"
          aria-pressed={s.bookmarks.includes(post.id)}
          className={s.bookmarks.includes(post.id) ? "gold" : ""}
          onClick={() => s.toggle("bookmarks", post.id)}
        >
          <Bookmark size={15} />
        </button>
      </div>
      {comments && (
        <div className="comments">
          {(s.comments[post.id] || []).map((c, i) => (
            <p key={i}>
              <b>You</b> {c}
            </p>
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (text.trim()) {
                s.comment(post.id, text.trim());
                setText("");
              }
            }}
          >
            <input
              aria-label="Comment text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add your perspective…"
              maxLength={1000}
            />
            <button className="button" type="submit">
              Post
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
function Trending({ select }: { select: (id: string) => void }) {
  const [time, setTime] = useState("Now");
  const offset = ["Now", "1h", "6h", "24h"].indexOf(time);
  const list = [...tokens]
    .sort(
      (a, b) =>
        b.change / (tokens.indexOf(b) + offset + 1) -
        a.change / (tokens.indexOf(a) + offset + 1),
    )
    .slice(offset ? 1 : 0, offset ? 6 : 5);
  return (
    <section className="panel compact">
      <div className="panel-title">
        <h2>
          <Flame size={16} className="gold" /> Trending tokens
        </h2>
        <Link to="/tokens" aria-label="All tokens">
          <ArrowUpRight size={15} />
        </Link>
      </div>
      <Tabs
        items={["Now", "1h", "6h", "24h"]}
        value={time}
        onChange={setTime}
      />
      <div className="table-label">
        <span>Token / Market cap</span>
        <span>Change</span>
      </div>
      {list.map((t) => (
        <button
          className="trending-row"
          key={t.id}
          onClick={() => select(t.id)}
        >
          <TokenIcon token={t} />
          <span>
            <strong>{t.ticker}</strong>
            <small>{money(t.cap)}</small>
          </span>
          <Spark token={t} />
          <span className={t.change > 0 ? "positive" : "negative"}>
            {t.change > 0 ? "+" : ""}
            {Math.round(t.change / (offset + 1))}%
          </span>
        </button>
      ))}
      <Link className="panel-bottom" to="/tokens">
        Discover all tokens <ChevronRight size={12} />
      </Link>
    </section>
  );
}
function TopCreators() {
  return (
    <section className="panel compact">
      <div className="panel-title">
        <h2>
          <Trophy size={15} className="gold" /> Top creators
        </h2>
        <Link to="/creators" aria-label="All creators">
          <ArrowUpRight size={15} />
        </Link>
      </div>
      <p className="micro">Demo ranking · graduation rate, min. 10 launches</p>
      {users
        .filter((u) => u.roles.includes("Creator") && u.launches >= 10)
        .sort((a, b) => b.graduated / b.launches - a.graduated / a.launches)
        .slice(0, 4)
        .map((u, i) => (
          <Link className="creator-row" to={`/profile/${u.id}`} key={u.id}>
            <span className={i === 0 ? "rank gold" : "rank"}>{i + 1}</span>
            <Avatar user={u} size={28} />
            <span>
              <strong>{u.name}</strong>
              <small>{u.launches} launches</small>
            </span>
            <span className="positive">
              {Math.round((u.graduated / Math.max(1, u.launches)) * 100)}%
              <small>graduation</small>
            </span>
          </Link>
        ))}
    </section>
  );
}
function Milestones({ select }: { select: (id: string) => void }) {
  const [filter, setFilter] = useState("All");
  return (
    <section className="panel compact">
      <div className="panel-title">
        <h2>
          <Zap size={15} className="gold" /> Recent milestones
        </h2>
        <Badge>Demo</Badge>
      </div>
      <Tabs
        items={["All", "2×", "5×", "10×", "Migration"]}
        value={filter}
        onChange={setFilter}
      />
      {milestones
        .filter((m) => filter === "All" || m.kind === filter)
        .map((m) => {
          const t = tokens.find((t) => t.id === m.tokenId)!;
          return (
            <button
              className="milestone-row"
              onClick={() => select(t.id)}
              key={m.id}
            >
              <TokenIcon token={t} />
              <span>
                <strong>
                  {t.ticker} <em>{m.kind}</em>
                </strong>
                <small>
                  {money(m.startCap)} → {money(m.currentCap)}
                </small>
              </span>
              <small>{m.minutesAgo}m</small>
            </button>
          );
        })}
    </section>
  );
}
function TokenDetail({ token: t }: { token: Token }) {
  const [tab, setTab] = useState("Overview");
  const [trade, setTrade] = useState(false);
  const [copied, setCopied] = useState(false);
  const s = useStore();
  const u = users.find((u) => u.id === t.creatorId)!;
  return (
    <section className="panel token-detail">
      <div className="token-cover">
        <span className="cover-star one">✦</span>
        <span className="cover-star two">✧</span>
        <span className="cover-moon" />
        <span className="cover-dunes" />
        <span className="cover-lamp">🪔</span>
        <span className="cover-caption">
          A little magic. Infinite possibility.
        </span>
        <Badge>{t.chain}</Badge>
      </div>
      <div className="detail-body">
        <div className="token-title">
          <TokenIcon token={t} />
          <div>
            <h2>{t.name}</h2>
            <small>${t.ticker}</small>
          </div>
          <button
            className="icon-button"
            aria-label="Favourite token"
            aria-pressed={s.favorites.includes(t.id)}
            onClick={() => s.toggle("favorites", t.id)}
          >
            <Star
              size={17}
              className={s.favorites.includes(t.id) ? "gold" : ""}
            />
          </button>
        </div>
        <div className="token-contract">
          <button
            onClick={() => {
              navigator.clipboard.writeText(t.address);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
          >
            {t.address.slice(0, 7)}…{t.address.slice(-6)}{" "}
            {copied ? <Check size={11} /> : <Copy size={11} />}
          </button>
          <Link to={`/token/${t.id}`} aria-label="Open token detail">
            <ExternalLink size={13} />
          </Link>
        </div>
        <div className="price-line">
          <strong>${t.price.toFixed(5)}</strong>
          <span className={t.change > 0 ? "positive" : "negative"}>
            ↗ {t.change > 0 ? "+" : ""}
            {t.change}%
          </span>
          <button className="button light" onClick={() => setTrade(true)}>
            Trade <ArrowUpRight size={12} />
          </button>
        </div>
        <div className="token-stats">
          <div>
            <small>Market cap</small>
            <b>{money(t.cap)}</b>
          </div>
          <div>
            <small>24h volume</small>
            <b>{money(t.volume)}</b>
          </div>
          <div>
            <small>Holders</small>
            <b>{t.holders.toLocaleString()}</b>
          </div>
          <div>
            <small>Age</small>
            <b>{t.age}</b>
          </div>
        </div>
        <Tabs
          items={["Overview", "Trades", "Holders", "Contract"]}
          value={tab}
          onChange={setTab}
        />
        {tab === "Overview" ? (
          <>
            <Spark token={t} big />
            <div className="chart-caption">
              <span>Simulated price history</span>
              <span>24h</span>
            </div>
            <div className="section-title">
              THE CREATOR{" "}
              <Link aria-label="View creator profile" to={`/profile/${u.id}`}>
                <ArrowUpRight size={13} />
              </Link>
            </div>
            <div className="creator-detail">
              <Identity user={u} />
              <Follow user={u} />
            </div>
            <div className="creator-stats">
              <span>
                <b>{u.launches}</b>
                <small>Launches</small>
              </span>
              <span>
                <b>{u.graduated}</b>
                <small>Graduated</small>
              </span>
              <span>
                <b>{money(u.fees)}</b>
                <small>Demo fees</small>
              </span>
            </div>
            <Link className="history-link" to={`/profile/${u.id}`}>
              <ShieldCheck size={13} /> Explore creator history{" "}
              <ChevronRight size={12} />
            </Link>
            <div className="section-title">LATEST CREATOR POST</div>
            <div className="latest-post">
              <Identity user={u} />
              <p>
                A community is built one conversation at a time. Let’s create
                something that lasts. ✦
              </p>
              <small>24 Oct · Demo post</small>
              <button
                onClick={() =>
                  sharePost({
                    ...useStore.getState().posts[0],
                    userId: u.id,
                    tokenId: t.id,
                  })
                }
              >
                Share to X <ArrowUpRight size={11} />
              </button>
            </div>
            <div className="section-title">ABOUT {t.ticker}</div>
            <p className="about-copy">{t.description}</p>
            <div className="tags">
              <Link to={`/narratives?tag=${t.narrative}`}>{t.narrative}</Link>
              <Badge>{t.chain}</Badge>
              <Badge>Community</Badge>
            </div>
            <Link className="panel-bottom" to={`/token/${t.id}`}>
              Open token intelligence <ArrowUpRight size={12} />
            </Link>
          </>
        ) : tab === "Trades" ? (
          <div className="detail-list">
            {trades
              .filter((x) => x.tokenId === t.id)
              .slice(0, 7)
              .map((x) => (
                <div key={x.id}>
                  <Link to={`/profile/${x.userId}`}>
                    {users.find((u) => u.id === x.userId)?.name}
                  </Link>
                  <span className={x.side === "Buy" ? "positive" : "negative"}>
                    {x.side} {money(x.amount)}
                  </span>
                </div>
              ))}
          </div>
        ) : tab === "Holders" ? (
          <div className="detail-list">
            <p>Simulated distribution · {t.holders.toLocaleString()} holders</p>
            {[18.4, 12.1, 8.7, 5.2, 3.1].map((n, i) => (
              <div key={n}>
                <span>Demo wallet {i + 1}</span>
                <b>{n}%</b>
              </div>
            ))}
          </div>
        ) : (
          <div className="contract-info">
            <p>
              <b>Chain</b> {t.chain}
            </p>
            <p>
              <b>Contract address</b>
            </p>
            <code>{t.address}</code>
            <p>
              Contract audit unavailable. Demo identity records do not establish
              token safety.
            </p>
            <p>
              Creator relationship: demo verified
              <br />
              Deployer / fee recipient: not established
            </p>
          </div>
        )}
      </div>
      {trade && (
        <Modal title="Trading preview" close={() => setTrade(false)}>
          <p>
            Real-money execution is disabled. This prototype does not connect a
            wallet, move funds, or submit transactions.
          </p>
          <div className="panel stat">
            <small>Simulated balance</small>
            <h2>$1,240.32</h2>
          </div>
          <button className="button light" onClick={() => setTrade(false)}>
            Back to research
          </button>
        </Modal>
      )}
    </section>
  );
}
function Empty() {
  return (
    <div className="panel empty">
      No matching record. <Link to="/">Return home</Link>
    </div>
  );
}
function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="page-heading">
      <div>
        <h1>
          {title}
          <span className="gold">.</span>
        </h1>
        <p>{subtitle}</p>
      </div>
      <Badge>Demonstration data</Badge>
    </div>
  );
}
function Profile() {
  const { id } = useParams();
  const u = personById(id);
  const [tab, setTab] = useState("Overview");
  const [contactStatus, setContactStatus] = useState("");
  const [alerts, setAlerts] = useState(false);
  const s = useStore();
  if (!u) return <Empty />;
  const history = launches.filter((l) => l.userId === id);
  return (
    <>
      <div className="profile-cover">
        <span>THE PERSON BEHIND THE PERSPECTIVE</span>
        <span className="profile-art">✦</span>
      </div>
      <section className="panel profile-header">
        <Avatar user={u} size={78} />
        <div>
          <h1>
            {u.name} <ShieldCheck size={20} className="blue" />
          </h1>
          <p>
            {u.participation === "wallet-only"
              ? "Wallet-only account"
              : `@${u.social.username}`}{" "}
            · {u.followers.toLocaleString()} followers
          </p>
          <div className="tags">
            {u.roles.map((r) => (
              <Badge key={r}>{r}</Badge>
            ))}
            <Badge>
              {u.participation === "wallet-only"
                ? "Wallet-only demo · unverified"
                : "Demo verified wallet"}
            </Badge>
          </div>
        </div>
        <div className="profile-actions">
          <Follow user={u} />
          <button
            className="button"
            aria-label="Configure profile notifications"
            onClick={() => setAlerts(true)}
          >
            <Bell size={15} /> Alerts
          </button>
        </div>
        <p className="bio">{u.bio}</p>
      </section>
      <div className="stats-grid">
        {[
          ["Total launches", u.launches],
          [
            "Graduation rate",
            `${Math.round((u.graduated / Math.max(1, u.launches)) * 100)}%`,
          ],
          ["Realised PnL", money(u.pnl)],
          ["Creator fees", money(u.fees)],
        ].map(([label, v]) => (
          <div key={label} className="panel stat">
            <small>{label}</small>
            <h2>{v}</h2>
            <span>Simulated historical record</span>
          </div>
        ))}
      </div>
      <Tabs
        items={[
          "Overview",
          "Launch history",
          "Trade history",
          "Call history",
          "Posts",
          "Wallets",
          "Intelligence",
        ]}
        value={tab}
        onChange={setTab}
      />
      <div className="profile-content">
        {u.roles.includes("Creator") &&
          ["Overview", "Launch history"].includes(tab) && (
            <section className="panel padded creator-direct-history">
              <h2>
                Creator achievements <Badge>Demo data</Badge>
              </h2>
              <div className="direct-achievements">
                <span>
                  <b>{creatorAchievements(u).above100k}</b>
                  <small>Reached $100K</small>
                </span>
                <span>
                  <b>{creatorAchievements(u).above500k}</b>
                  <small>Reached $500K</small>
                </span>
                <span>
                  <b>{creatorAchievements(u).above1m}</b>
                  <small>Reached $1M+</small>
                </span>
              </div>
              <p className="muted">
                Highest observed cap: {money(creatorAchievements(u).highest)} ·{" "}
                {creatorAchievements(u).walletCount} demo-attested creator
                wallets. These are direct historical achievements, not a trust
                score.
              </p>
              <div className="creator-public-contact">
                <small>Public demonstration contact · non-deliverable</small>
                <code>creator+{u.social.username}@example.invalid</code>
                <button
                  className="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        `creator+${u.social.username}@example.invalid`,
                      );
                      setContactStatus("Demo contact copied");
                    } catch {
                      setContactStatus("Select the displayed address to copy");
                    }
                  }}
                >
                  Copy demo public contact
                </button>
                <p role="status" className="onboarding-caption">
                  {contactStatus}
                </p>
              </div>
            </section>
          )}
        {["Overview", "Launch history"].includes(tab) && (
          <section className="panel padded">
            <h2>Launch history · sample records</h2>
            <p className="muted">
              Successful and unsuccessful outcomes are shown together. These
              rows are a representative sample of the simulated all-time totals.
            </p>
            {history.map((l) => {
              const t = tokens.find((t) => t.id === l.tokenId)!;
              return (
                <Link className="history-row" key={l.id} to={`/token/${t.id}`}>
                  <TokenIcon token={t} />
                  <span>
                    <b>{t.ticker}</b>
                    <small>
                      {new Date(l.timestamp).toLocaleDateString("en-GB")}
                    </small>
                  </span>
                  <Badge>{l.outcome}</Badge>
                  <span className={t.change > 0 ? "positive" : "negative"}>
                    {t.change}%
                  </span>
                  <ChevronRight size={15} />
                </Link>
              );
            })}
            {!history.length && (
              <p className="empty">
                No attributed launches. Creator and trader identities are
                separate relationships.
              </p>
            )}
            <div className="evidence-note">
              <ShieldCheck size={16} />
              <p>
                Wallet links are verified only within the fictional dataset.
                Deployer, promoter and fee-recipient relationships are not
                inferred. High returns do not establish trustworthiness.
              </p>
            </div>
          </section>
        )}
        {["Overview", "Trade history"].includes(tab) && (
          <section className="panel padded">
            <h2>
              Trading history <Badge>Simulated</Badge>
            </h2>
            <div className="mini-stats">
              <span>
                Win rate <b>{u.winRate}%</b>
              </span>
              <span>
                Unrealised PnL <b className="positive">{money(u.pnl * 0.12)}</b>
              </span>
              <span>
                Total demo trades{" "}
                <b>{trades.filter((t) => t.userId === id).length}</b>
              </span>
              <span>
                Trading volume <b>{money(tradingEvidence(u).volume)}</b>
              </span>
              <span>
                Closed positions <b>{tradingEvidence(u).closedPositions}</b>
              </span>
            </div>
            {trades
              .filter((x) => x.userId === id)
              .map((x) => (
                <Link
                  className="history-row"
                  key={x.id}
                  to={`/token/${x.tokenId}`}
                >
                  <TokenIcon token={tokens.find((t) => t.id === x.tokenId)!} />
                  <b>{tokens.find((t) => t.id === x.tokenId)?.ticker}</b>
                  <span className={x.side === "Buy" ? "positive" : "negative"}>
                    {x.side}
                  </span>
                  <b>{money(x.amount)}</b>
                  <small>{x.timestamp.slice(11, 16)}</small>
                </Link>
              ))}
          </section>
        )}
        {["Overview", "Call history"].includes(tab) && (
          <section className="panel padded">
            <h2>Original calls & outcomes</h2>
            <p className="muted">
              Immutable baselines · average time to demo milestone: 6h 18m
            </p>
            {calls
              .filter((c) => c.userId === id)
              .map((c) => (
                <div key={c.id} className="call-record">
                  <div className="row-between">
                    <Link to={`/token/${c.tokenId}`}>
                      <b>{tokens.find((t) => t.id === c.tokenId)?.ticker}</b>
                    </Link>
                    <span className={c.outcome >= 1 ? "positive" : "negative"}>
                      {c.outcome.toFixed(1)}× ·{" "}
                      {c.outcome >= 1 ? "Successful" : "Failed"}
                    </span>
                  </div>
                  <p>{c.text}</p>
                  <small
                    className={
                      purchaseEvidence(c).length ? "positive" : "muted"
                    }
                  >
                    {purchaseEvidence(c).length
                      ? "Demo qualified call · same-token buy from an attested wallet"
                      : "Recorded call only · no qualifying purchase evidence"}
                  </small>
                  <small>
                    Original: {new Date(c.timestamp).toLocaleString("en-GB")} ·
                    Baseline {money(c.baselineCap)} · {c.revisions.length}{" "}
                    revisions
                  </small>
                </div>
              ))}
            {s.posts
              .filter(
                (p) => p.userId === id && p.type === "Callout" && p.baseline,
              )
              .map((p) => (
                <div key={p.id} className="call-record">
                  <Link to={`/post/${p.id}`}>
                    <b>{tokens.find((t) => t.id === p.tokenId)?.ticker}</b>
                  </Link>
                  <p>{p.text}</p>
                  <small>
                    Original: {p.timestamp} · Baseline{" "}
                    {money(p.baseline!.marketCap)} · Outcome pending
                  </small>
                </div>
              ))}
            {!calls.some((c) => c.userId === id) &&
              !s.posts.some(
                (p) => p.userId === id && p.type === "Callout" && p.baseline,
              ) && (
                <p className="empty">
                  No timestamped callouts for this account.
                </p>
              )}
          </section>
        )}
        {tab === "Posts" &&
          s.posts
            .filter((p) => p.userId === id)
            .map((p) => <PostCard key={p.id} post={p} />)}
        {tab === "Intelligence" && <IntelligenceAccess userId={u.id} />}
        {tab === "Wallets" && (
          <section className="panel padded">
            <h2>Connected wallet relationships</h2>
            <p className="muted">
              {u.participation === "wallet-only"
                ? "No X identity linked. Wallet signatures are not connected in this demonstration."
                : `Fictional social identity: ${u.social.externalId}`}
            </p>
            {walletRelationships
              .filter((r) => r.userId === u.id)
              .map((r) => {
                const wallet = wallets.find((w) => w.id === r.walletId)!;
                return (
                  <div className="call-record" key={r.walletId}>
                    <Badge>{wallet.chain}</Badge>
                    <p>
                      <code>{wallet.address}</code>
                    </p>
                    <Badge>
                      {r.role} · demo {r.status}
                    </Badge>
                    <p className="micro">
                      Fictional seed attestation. No live signature
                      verification. This relationship does not establish
                      deployer, promoter or fee-recipient ownership.
                    </p>
                  </div>
                );
              })}
            {!walletRelationships.some((r) => r.userId === u.id) && (
              <p className="empty">No attributed wallet record available.</p>
            )}
            <p className="muted">
              Attributable creator fees: {money(u.fees)} simulated aggregate.
              Detailed fee provenance requires a live integration.
            </p>
          </section>
        )}
      </div>
      {alerts && <AlertSettings user={u} close={() => setAlerts(false)} />}
    </>
  );
}
function AlertSettings({ user, close }: { user: User; close: () => void }) {
  const s = useStore();
  const [selected, setSelected] = useState<NotificationCategory[]>(
    s.preferences[user.id] || ["Launch", "Post", "2×", "5×", "10×"],
  );
  const categories: NotificationCategory[] = [
    "Launch",
    "Post",
    "Graduation",
    "Migration",
    "Buy",
    "Sell",
    "Thesis",
    "Callout",
    "2×",
    "5×",
    "10×",
    "Price movement",
    "Announcement",
    "Announcement reminder",
  ];
  return (
    <Modal title={`Alerts for ${user.name}`} close={close}>
      <p>
        Choose simulated events to receive. Follow this person to enable
        delivery.
      </p>
      <div className="checkbox-grid">
        {categories.map((c) => (
          <label key={c}>
            <input
              type="checkbox"
              checked={selected.includes(c)}
              onChange={() =>
                setSelected(
                  selected.includes(c)
                    ? selected.filter((v) => v !== c)
                    : [...selected, c],
                )
              }
            />
            {c}
          </label>
        ))}
      </div>
      <button
        className="button light"
        onClick={() => {
          s.configure(user.id, selected);
          close();
        }}
      >
        Save preferences
      </button>
    </Modal>
  );
}
function TokenDirectory() {
  const [q, setQ] = useState("");
  const [chain, setChain] = useState("All chains");
  const [tab, setTab] = useState("Trending");
  const [period, setPeriod] = useState("24h");
  const { data, isPending } = useQuery({
    queryKey: ["tokens", useStore((state) => state.demoTokenDiscovered)],
    queryFn: demoMarket.listTokens,
  });
  const offset = ["1h", "6h", "24h"].indexOf(period) + 1;
  const list = (data || [])
    .filter(
      (t) =>
        (chain === "All chains" || t.chain === chain) &&
        `${t.ticker} ${t.name} ${t.address}`
          .toLowerCase()
          .includes(q.toLowerCase()),
    )
    .sort((a, b) =>
      tab === "New launches"
        ? a.age.localeCompare(b.age)
        : tab === "Top gainers"
          ? b.change - a.change
          : b.cap - a.cap,
    );
  return (
    <>
      <PageTitle
        title="Tokens"
        subtitle="Discover the activity. Understand the people behind it."
      />
      <div className="toolbar">
        <Tabs
          items={["Trending", "New launches", "Top gainers"]}
          value={tab}
          onChange={setTab}
        />
        <Tabs items={["1h", "6h", "24h"]} value={period} onChange={setPeriod} />
      </div>
      <div className="panel directory">
        <div className="toolbar">
          <label className="inline-search">
            <Search size={15} />
            <input
              aria-label="Search tokens"
              placeholder="Search token or contract"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <select
            aria-label="Token chain"
            value={chain}
            onChange={(e) => setChain(e.target.value)}
          >
            {["All chains", ...chains].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Token</th>
                <th>Chain</th>
                <th>Price</th>
                <th>Market cap</th>
                <th>24h volume</th>
                <th>Holders</th>
                <th>{period} trend</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {list.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link className="token-name" to={`/token/${t.id}`}>
                      <TokenIcon token={t} />
                      <span>
                        <b>{t.ticker}</b>
                        <small>{t.name}</small>
                      </span>
                    </Link>
                  </td>
                  <td>
                    <Badge>{t.chain}</Badge>
                  </td>
                  <td>${t.price.toFixed(5)}</td>
                  <td>{money(t.cap)}</td>
                  <td>{money(t.volume)}</td>
                  <td>{t.holders.toLocaleString()}</td>
                  <td>
                    <Spark token={t} />
                  </td>
                  <td className={t.change > 0 ? "positive" : "negative"}>
                    {t.change > 0 ? "+" : ""}
                    {Math.round((t.change * offset) / 3)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isPending ? (
            <p className="empty">Loading demonstration tokens…</p>
          ) : (
            !list.length && <Empty />
          )}
        </div>
      </div>
    </>
  );
}
function Lists() {
  const [tab, setTab] = useState("My watchlist");
  const [name, setName] = useState("");
  const [custom, setCustom] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("aladdin-lists") || "[]");
    } catch {
      return [];
    }
  });
  const s = useStore();
  return (
    <>
      <PageTitle
        title="Lists"
        subtitle="Your people. Your tokens. Your corner of the market."
      />
      <div className="panel padded">
        <Tabs
          items={["My watchlist", "Saved posts", "Following", ...custom]}
          value={tab}
          onChange={setTab}
        />
        <form
          className="list-create"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim() && !custom.includes(name.trim())) {
              const next = [...custom, name.trim()];
              setCustom(next);
              localStorage.setItem("aladdin-lists", JSON.stringify(next));
              setTab(name.trim());
              setName("");
            }
          }}
        >
          <input
            aria-label="New list name"
            placeholder="New list name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
          />
          <button className="button" type="submit">
            <Plus size={14} /> Create list
          </button>
        </form>
        {tab === "Saved posts" ? (
          s.posts
            .filter((p) => s.bookmarks.includes(p.id))
            .map((p) => <PostCard key={p.id} post={p} />)
        ) : tab === "Following" ? (
          users
            .filter((u) => s.follows.includes(u.id))
            .map((u) => (
              <div className="history-row" key={u.id}>
                <Identity user={u} />
                <Follow user={u} />
              </div>
            ))
        ) : (
          <Watchlist listName={tab} />
        )}
      </div>
    </>
  );
}
function Watchlist({ listName }: { listName: string }) {
  const s = useStore();
  const [local, setLocal] = useState<Record<string, string[]>>(() => {
    try {
      return JSON.parse(localStorage.getItem("aladdin-custom-tokens") || "{}");
    } catch {
      return {};
    }
  });
  const ids = listName === "My watchlist" ? s.favorites : local[listName] || [];
  return (
    <>
      <p className="muted">
        Select tokens to add or remove them from this list.
      </p>
      {tokens.map((t) => (
        <div className="history-row" key={t.id}>
          <TokenIcon token={t} />
          <Link to={`/token/${t.id}`}>
            <b>{t.ticker}</b>
            <small>{t.chain}</small>
          </Link>
          <span className="positive">{money(t.cap)}</span>
          <button
            className="icon-button"
            aria-label={`${ids.includes(t.id) ? "Remove" : "Add"} ${t.ticker}`}
            aria-pressed={ids.includes(t.id)}
            onClick={() => {
              if (listName === "My watchlist") s.toggle("favorites", t.id);
              else {
                const next = {
                  ...local,
                  [listName]: ids.includes(t.id)
                    ? ids.filter((id) => id !== t.id)
                    : [...ids, t.id],
                };
                setLocal(next);
                localStorage.setItem(
                  "aladdin-custom-tokens",
                  JSON.stringify(next),
                );
              }
            }}
          >
            <Star size={17} className={ids.includes(t.id) ? "gold" : ""} />
          </button>
        </div>
      ))}
    </>
  );
}
function Notifications() {
  const s = useStore();
  const [tab, setTab] = useState("All");
  const [user, setUser] = useState("u1");
  const [category, setCategory] = useState<NotificationCategory>("Launch");
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState(false);
  const list = s.notifications.filter(
    (n) => tab === "All" || (tab === "Unread" ? !n.read : n.category === tab),
  );
  return (
    <>
      <PageTitle
        title="Alerts"
        subtitle="Stay close to the people and activity that matter."
      />
      <div className="toolbar">
        <Tabs
          items={["All", "Unread", "Launch", "2×", "5×", "Migration"]}
          value={tab}
          onChange={setTab}
        />
        <button className="button" onClick={s.read}>
          <CheckCheck size={14} /> Mark all read
        </button>
      </div>
      <div className="notification-layout">
        <section className="panel">
          {list.map((n) => (
            <Link
              key={n.id}
              className={`notification-row ${!n.read ? "unread" : ""}`}
              to={`/token/${n.tokenId}`}
            >
              <Avatar user={users.find((u) => u.id === n.userId)!} />
              <span>
                <b>{n.text}</b>
                <small>
                  {n.category} · {new Date(n.timestamp).toLocaleString("en-GB")}{" "}
                  · Simulated
                </small>
              </span>
              <ChevronRight size={16} />
            </Link>
          ))}
          {!list.length && (
            <p className="empty">
              You’re all caught up. Try a simulated event.
            </p>
          )}
        </section>
        <details className="alert-demo-tools">
          <summary>
            Demo event tools <ChevronDown size={15} />
          </summary>
          <section className="panel padded">
            <h2>
              <Zap size={17} className="gold" /> Event simulator
            </h2>
            <p className="muted">
              Events are delivered only for followed accounts and enabled
              categories.
            </p>
            <label>
              Person
              <select value={user} onChange={(e) => setUser(e.target.value)}>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </label>
            <Follow user={users.find((u) => u.id === user)!} />
            <button className="button" onClick={() => setSettings(true)}>
              <SlidersHorizontal size={14} /> Configure alerts
            </button>
            <label>
              Event
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as NotificationCategory)
                }
              >
                {[
                  "Launch",
                  "Post",
                  "Graduation",
                  "Migration",
                  "Buy",
                  "Sell",
                  "Thesis",
                  "Callout",
                  "2×",
                  "5×",
                  "10×",
                  "Price movement",
                  "Announcement",
                  "Announcement reminder",
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <button
              className="button light"
              onClick={() => {
                const before = useStore.getState().notifications.length;
                s.simulate(
                  user,
                  tokens.find((t) => t.creatorId === user)?.id || "t1",
                  category,
                );
                setMessage(
                  useStore.getState().notifications.length > before
                    ? "Simulated notification delivered."
                    : "No delivery: follow this account and enable this event category.",
                );
              }}
            >
              Trigger simulated event <Zap size={13} />
            </button>
            <p role="status">{message}</p>
          </section>
        </details>
      </div>
      {settings && (
        <AlertSettings
          user={users.find((u) => u.id === user)!}
          close={() => setSettings(false)}
        />
      )}
    </>
  );
}
function Narratives() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tag") || "All";
  const setTab = (tag: string) => setParams(tag === "All" ? {} : { tag });
  return (
    <>
      <PageTitle
        title="Narratives"
        subtitle="Explore the ideas connecting people and tokens."
      />
      <Tabs
        items={["All", "AI", "Memecoins", "DeFi", "DePIN"]}
        value={tab}
        onChange={setTab}
      />
      <div className="narrative-grid">
        {["AI", "Memecoins", "DeFi", "DePIN"]
          .filter((n) => tab === "All" || tab === n)
          .map((n, i) => (
            <section className="panel padded" key={n}>
              <div className="narrative-icon">{["◈", "♛", "◎", "⬡"][i]}</div>
              <h2>{n}</h2>
              <p className="muted">
                Fictional ecosystem ·{" "}
                {tokens.filter((t) => t.narrative === n).length} tokens
              </p>
              {tokens
                .filter((t) => t.narrative === n)
                .map((t) => (
                  <Link
                    className="history-row"
                    to={`/token/${t.id}`}
                    key={t.id}
                  >
                    <TokenIcon token={t} />
                    <b>{t.ticker}</b>
                    <span className={t.change > 0 ? "positive" : "negative"}>
                      {t.change}%
                    </span>
                  </Link>
                ))}
            </section>
          ))}
      </div>
    </>
  );
}
function Rewards() {
  const [selected, setSelected] = useState("");
  return (
    <>
      <PageTitle
        title="Airdrops & Rewards"
        subtitle="Explore fictional community campaigns and creator rewards."
      />
      <div className="narrative-grid">
        {["Aladdin Early Supporters", "NOVA Community", "Satori Builders"].map(
          (n, i) => (
            <section className="panel padded" key={n}>
              <Badge>Demo campaign</Badge>
              <h2>{n}</h2>
              <p className="muted">
                Explore creator histories and build your research watchlist. No
                real token allocation or claim.
              </p>
              <button className="button" onClick={() => setSelected(n)}>
                Campaign details <ArrowUpRight size={13} />
              </button>
              <small>{i === 2 ? "Upcoming" : "Open for exploration"}</small>
            </section>
          ),
        )}
      </div>
      {selected && (
        <Modal title={selected} close={() => setSelected("")}>
          <p>
            This fictional campaign demonstrates a future discovery flow. There
            is no real airdrop, eligibility check, token claim, or wallet
            connection.
          </p>
          <Link
            className="button light"
            to="/creators"
            onClick={() => setSelected("")}
          >
            Explore creators
          </Link>
        </Modal>
      )}
    </>
  );
}
function PostPage() {
  const { id } = useParams();
  const p = useStore((s) => s.posts.find((p) => p.id === id));
  return (
    <div className="single-post">
      <Link className="back" to="/">
        <ArrowLeft size={15} /> Back to feed
      </Link>
      {p ? <PostCard post={p} /> : <Empty />}
      <p className="muted">
        Demo posts are stored in this browser. Locally created posts are not
        synced to other devices.
      </p>
    </div>
  );
}
function Composer({ close }: { close: () => void }) {
  const [type, setType] = useState("Thesis");
  const [text, setText] = useState("");
  const [chain, setChain] = useState<Chain>("Solana");
  const [address, setAddress] = useState("");
  const [tag, setTag] = useState("");
  const [chart, setChart] = useState(false);
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [published, setPublished] = useState<Post | null>(null);
  const s = useStore();
  const navigate = useNavigate();
  const token = tokens.find(
    (t) =>
      t.chain === chain &&
      (chain === "Solana"
        ? t.address === address
        : t.address.toLowerCase() === address.toLowerCase()),
  );
  return (
    <Modal
      title={
        published
          ? "Your perspective is on the record"
          : "Share your perspective"
      }
      close={close}
    >
      {published ? (
        <>
          <div className="publish-success">
            <Check size={30} />
            <h2>Published on Aladdin</h2>
            <p>
              Saved locally in this browser. X publication requires your
              confirmation in X.
            </p>
          </div>
          <button className="button light" onClick={() => sharePost(published)}>
            Share to X <ArrowUpRight size={14} />
          </button>
          <button
            className="button"
            onClick={() => {
              navigate(`/post/${published.id}`);
              close();
            }}
          >
            View post
          </button>
        </>
      ) : (
        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim())
              return setError("Write your thesis or callout first.");
            if (!validAddress(chain, address))
              return setError(
                "Enter a valid contract address for the selected chain.",
              );
            if (!token)
              return setError(
                "Valid address, but market data is unavailable. Select a seeded demo token to attach its baseline.",
              );
            const p: Post = {
              id: crypto.randomUUID(),
              userId:
                s.participation === "wallet"
                  ? demoWalletUser.id
                  : useOnboarding.getState().legacy
                    ? "u1"
                    : onboardingDemoUser.id,
              type: type as "Thesis" | "Callout",
              text: text.trim(),
              tokenId: token.id,
              timestamp: new Date().toISOString(),
              likes: 0,
              image,
              chart,
              tag,
              baseline: {
                chain: token.chain,
                address: token.address,
                marketCap: token.cap,
                price: token.price,
                timestamp: new Date().toISOString(),
              },
            };
            s.publish(p);
            setPublished(p);
          }}
        >
          <Tabs
            items={["Thesis", "Callout"]}
            value={type}
            onChange={(v) => {
              setType(v);
              if (v === "Callout") setText(text.slice(0, 500));
            }}
          />
          <Identity
            user={
              s.participation === "wallet"
                ? demoWalletUser
                : useOnboarding.getState().legacy
                  ? users[0]
                  : onboardingDemoUser
            }
          />
          <label>
            Your {type.toLowerCase()}
            <textarea
              placeholder="What do you see that others don’t? Share the reasoning, and the risks."
              maxLength={type === "Callout" ? 500 : 5000}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <small>
            {text.length}/{type === "Callout" ? 500 : 5000} characters
          </small>
          <div className="form-row">
            <label>
              Chain
              <select
                value={chain}
                onChange={(e) => {
                  setChain(e.target.value as Chain);
                  setAddress("");
                }}
              >
                {chains.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Demo token
              <select
                aria-label="Select demo token"
                value={token?.id || ""}
                onChange={(e) =>
                  setAddress(
                    tokens.find((t) => t.id === e.target.value)?.address || "",
                  )
                }
              >
                <option value="">Select a token</option>
                {tokens
                  .filter((t) => t.chain === chain)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.ticker}
                    </option>
                  ))}
              </select>
            </label>
          </div>
          <label>
            Contract address
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value.trim())}
              placeholder={chain === "Solana" ? "Solana base58 address" : "0x…"}
            />
          </label>
          {token && (
            <div className="token-preview">
              <TokenIcon token={token} />
              <b>{token.ticker}</b>
              <span>{money(token.cap)} cap</span>
              <Badge>Simulated baseline</Badge>
            </div>
          )}
          <label>
            Narrative tag
            <select value={tag} onChange={(e) => setTag(e.target.value)}>
              <option value="">None</option>
              {["AI", "Memecoins", "DeFi", "DePIN"].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label className="check-label">
            <input
              type="checkbox"
              checked={chart}
              onChange={(e) => setChart(e.target.checked)}
            />{" "}
            Attach simulated chart
          </label>
          <label>
            Optional image (max 1 MB)
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (
                    !["image/png", "image/jpeg", "image/webp"].includes(
                      file.type,
                    )
                  )
                    return setError("Choose a PNG, JPEG or WebP image.");
                  if (file.size > 1_000_000)
                    return setError("Image must be less than 1 MB.");
                  const reader = new FileReader();
                  reader.onload = () => setImage(String(reader.result));
                  reader.readAsDataURL(file);
                }
              }}
            />
          </label>
          {image && (
            <img className="post-image" src={image} alt="Attachment preview" />
          )}
          {error && (
            <p className="negative" role="alert">
              {error}
            </p>
          )}
          <p className="micro">
            Original timestamp and market baseline are preserved. Posts are
            local demo records.
          </p>
          <button type="submit" className="button light">
            Publish on Aladdin <ArrowUpRight size={13} />
          </button>
        </form>
      )}
    </Modal>
  );
}
const client = new QueryClient();
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
