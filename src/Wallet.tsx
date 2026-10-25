import { useMVP } from "./mvp/state";
import { isTokenAvailable } from "./services";
import React, { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowDownUp,
  Plus,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Copy,
  Check,
  ArrowLeft,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  Wallet,
  Users,
  CalendarDays,
  Bell,
  Star,
  CheckCircle2,
  Settings,
  Bookmark,
  FileText,
  LogOut,
  Clock3,
  TrendingUp,
  Link2,
  RotateCcw,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { tokens, users, calls, validAddress, money, personById } from "./data";
import { useStore } from "./store";
import Modal from "./ui/Modal";
import { useOnboarding } from "./onboarding/store";
import { WalletManager, ResetOnboarding } from "./onboarding/Onboarding";
import { DiscoveryPreview } from "./onboarding/History";
import Directory from "./Leaderboards";
import {
  useWallet,
  walletAssets,
  assetById,
  walletTotal,
  formatUSD,
  quantity,
  DEMO_SPREAD,
  type WalletAsset,
  type WalletTransaction,
} from "./wallet-store";
import type { Post, Role } from "./models";
import "./wallet.css";
const LazySpark = React.lazy(() => import("./Spark"));
export function AssetIcon({ asset }: { asset: WalletAsset }) {
  return (
    <span
      className={`asset-icon ${asset.id}`}
      style={{ color: asset.color, background: asset.color + "18" }}
      aria-hidden="true"
    >
      {asset.icon}
    </span>
  );
}
function ValueChart({ period, total }: { period: string; total: number }) {
  const salt = ["1D", "1W", "1M", "1Y"].indexOf(period);
  const values = Array.from(
    { length: 48 },
    (_, i) =>
      42 -
      i * 0.6 -
      Math.sin(i * 0.81 + salt) * 3 -
      Math.cos(i * 0.27 + salt) * 4,
  );
  const points = values.map((v, i) => `${(i / 47) * 500},${v + 20}`).join(" ");
  return (
    <svg
      className="balance-chart"
      viewBox="0 0 500 90"
      preserveAspectRatio="none"
      role="img"
      aria-label={`${period} illustrative portfolio value chart, current demo value ${formatUSD(total)}`}
    >
      <defs>
        <linearGradient id="wallet-line-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#dabd83" stopOpacity=".13" />
          <stop offset="1" stopColor="#dabd83" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M0,90 L${points.replaceAll(" ", " L")} L500,90 Z`}
        fill="url(#wallet-line-fill)"
      />
      <polyline
        points={points}
        fill="none"
        stroke="#d7be89"
        strokeWidth="1.9"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx="500" cy={values[47] + 20} r="2.8" fill="#e2c993" />
    </svg>
  );
}
function WalletHint() {
  return (
    <span className="wallet-demo-label">
      <span /> Demo wallet · simulated assets
    </span>
  );
}
export function WalletHome() {
  const s = useWallet();
  const account = useOnboarding();
  const active = account.wallets.find((w) => w.id === account.activeWalletId);
  const [manage, setManage] = useState(false);
  const [action, setAction] = useState<
    "Receive" | "Send" | "Swap" | "Add funds" | null
  >(null);
  const [tab, setTab] = useState("Tokens");
  const held = walletAssets.filter(
    (a) => (s.balances[a.id] || 0) > 0.000000001,
  );
  const total = walletTotal(s.balances);
  return (
    <div className="wallet-home">
      <div className="wallet-context">
        <button
          className="wallet-account-chip"
          aria-label={`Wallet selector: ${active?.label || "Wallet 1"}`}
          onClick={() => setManage(true)}
        >
          <span className="wallet-mini-icon">✦</span>{" "}
          {active?.label || "Wallet 1"} <ChevronDown size={13} />
        </button>
        <WalletHint />
      </div>
      <div className="wallet-home-grid">
        <section className="wallet-main">
          <div className="balance-heading">
            <h1>Total balance</h1>
            <button
              className="icon-button"
              aria-label={s.hidden ? "Show balances" : "Hide balances"}
              onClick={s.toggleHidden}
            >
              {s.hidden ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="total-balance" aria-live="polite">
            {s.hidden ? "••••••" : formatUSD(total)}
          </div>
          <p className="daily-gain">
            <TrendingUp size={15} aria-hidden="true" />{" "}
            {s.hidden
              ? "••••"
              : s.transactions.some((t) => t.id === "seed-buy")
                ? "+$125.40 (5.31%)"
                : "+$0.00 (0.00%)"}{" "}
            <span>today · illustrative</span>
          </p>
          <div className="wallet-actions">
            {(
              [
                ["Receive", ArrowDownLeft],
                ["Send", ArrowUpRight],
                ["Swap", ArrowDownUp],
                ["Add funds", Plus],
              ] as const
            ).map(([label, Icon]) => (
              <button key={label} onClick={() => setAction(label)}>
                <span>
                  <Icon size={22} strokeWidth={1.7} />
                </span>
                {label}
              </button>
            ))}
          </div>
          <div className="wallet-extra-actions">
            <button onClick={() => setAction("Add funds")}>
              Buy crypto <Plus size={15} />
            </button>
            <Link to="/create/token">
              Create token <ChevronRight size={15} />
            </Link>
          </div>
          <div className="assets-heading">
            <div className="wallet-segment" role="tablist">
              {["Tokens", "Activity"].map((t) => (
                <button
                  role="tab"
                  aria-selected={t === tab}
                  key={t}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            {tab === "Tokens" && (
              <Link className="quiet-button" to="/assets">
                See all <ChevronRight size={13} />
              </Link>
            )}
          </div>
          {tab === "Tokens" ? (
            <div className="asset-list">
              {held.slice(0, 3).map((a) => (
                <Link className="asset-row" to={`/asset/${a.id}`} key={a.id}>
                  <AssetIcon asset={a} />
                  <span className="asset-label">
                    <b>{a.name}</b>
                    <small>
                      {s.hidden ? "••••" : quantity(s.balances[a.id] || 0)}{" "}
                      {a.ticker} <span>· {a.chain}</span>
                    </small>
                  </span>
                  <span className="asset-value">
                    <b>
                      {s.hidden
                        ? "••••"
                        : formatUSD((s.balances[a.id] || 0) * a.price)}
                    </b>
                    <small className={a.change >= 0 ? "positive" : "negative"}>
                      {a.change >= 0 ? "+" : ""}
                      {a.change}%
                    </small>
                  </span>
                </Link>
              ))}
              {!held.length && (
                <div className="wallet-empty">
                  No demo assets yet. Add simulated funds to explore the wallet.
                </div>
              )}
            </div>
          ) : (
            <ActivityList transactions={s.transactions} />
          )}
          <div className="wallet-safety">
            <ShieldCheck size={14} />
            <p>
              Demo balances only. No wallet is connected and no funds can move.
            </p>
          </div>
        </section>
        <aside className="wallet-side">
          <div className="section-heading">
            <h2>Recent activity</h2>
            <Link to="/activity">
              See all <ChevronRight size={15} />
            </Link>
          </div>
          <ActivityList transactions={s.transactions.slice(0, 3)} />
        </aside>
      </div>
      {manage && (
        <Modal title="Your wallets" close={() => setManage(false)}>
          <WalletManager close={() => setManage(false)} />
        </Modal>
      )}
      {action && <WalletAction action={action} close={() => setAction(null)} />}
    </div>
  );
}
export function ActivityList({
  transactions,
}: {
  transactions: WalletTransaction[];
}) {
  const hidden = useWallet((s) => s.hidden);
  return (
    <div className="wallet-activity">
      {transactions.map((tx) => {
        const asset = assetById(tx.assetId)!;
        return (
          <Link
            className="wallet-activity-row"
            key={tx.id}
            to={
              tx.attribution
                ? `/post/${tx.attribution.postId}`
                : `/asset/${tx.toAssetId || tx.assetId}`
            }
          >
            <span className="activity-symbol">
              {tx.type === "Send" ? (
                <ArrowUpRight size={19} />
              ) : tx.type === "Add funds" ? (
                <ArrowDownLeft size={19} />
              ) : (
                <ArrowDownUp size={19} />
              )}
            </span>
            <span>
              <b>
                {tx.type === "Add funds"
                  ? "Added demo funds"
                  : tx.type === "Buy"
                    ? `Bought ${assetById(tx.toAssetId)?.ticker || asset.ticker}`
                    : tx.type === "Sell"
                      ? `Sold ${asset.ticker}`
                      : tx.type === "Swap"
                        ? `${asset.ticker} → ${assetById(tx.toAssetId)?.ticker}`
                        : `Sent ${asset.ticker}`}
              </b>
              <small>
                {new Date(tx.timestamp).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}{" "}
                · Simulated
              </small>
              {tx.attribution && (
                <small>
                  via @
                  {personById(tx.attribution.callerId)?.social.username ||
                    "original caller"}{" "}
                  · Call receipt
                </small>
              )}
            </span>
            <span>
              <b>{hidden ? "••••" : formatUSD(tx.usd)}</b>
              <small>Demo complete</small>
            </span>
          </Link>
        );
      })}
      {!transactions.length && (
        <div className="wallet-empty">
          <Clock3 size={22} />
          <p>Your activity will appear here.</p>
        </div>
      )}
    </div>
  );
}
export function WalletActivity() {
  const tx = useWallet((s) => s.transactions);
  return (
    <div className="wallet-page">
      <Link className="back" to="/">
        <ArrowLeft size={16} /> Wallet
      </Link>
      <h1>Wallet activity</h1>
      <p className="wallet-subtitle">
        Your simulated sends, swaps and funding history.
      </p>
      <ActivityList transactions={tx} />
    </div>
  );
}
export function WalletAction({
  action,
  initialAssetId,
  attribution,
  close,
}: {
  action: "Receive" | "Send" | "Swap" | "Add funds" | "Buy" | "Sell";
  initialAssetId?: string;
  attribution?: { postId: string; callerId: string };
  close: () => void;
}) {
  const s = useWallet();
  const [from, setFrom] = useState(
    action === "Buy"
      ? initialAssetId === "usdc"
        ? "sol"
        : "usdc"
      : initialAssetId || "sol",
  );
  const [to, setTo] = useState(
    action === "Buy"
      ? initialAssetId || "t1"
      : action === "Sell"
        ? initialAssetId === "usdc"
          ? "sol"
          : "usdc"
        : "usdc",
  );
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const account = useOnboarding();
  const activeWallet = account.wallets.find(
    (w) => w.id === account.activeWalletId,
  );
  const [chain, setChain] = useState<string>(
    ["Solana", "Base", "TON", "Robinhood Chain"].includes(
      activeWallet?.chain || "",
    )
      ? activeWallet!.chain
      : "Solana",
  );
  const [step, setStep] = useState<"form" | "review" | "done">("form");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [intent] = useState(() => crypto.randomUUID());
  const source = assetById(action === "Add funds" ? "usdc" : from)!;
  const target = assetById(to)!;
  const n = Number(amount);
  const usd = n * source.price;
  const received = (usd * (1 - DEMO_SPREAD)) / target.price;
  const isTrade = ["Swap", "Buy", "Sell"].includes(action);
  function review(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!Number.isFinite(n) || n <= 0)
      return setError("Enter an amount greater than zero.");
    if (action !== "Add funds" && n > (s.balances[source.id] || 0))
      return setError("Insufficient demo balance.");
    if (action === "Add funds" && n > 100000)
      return setError("Demo deposits support up to $100,000.");
    if (action === "Send" && !validAddress(source.chain, address))
      return setError(`Enter a valid ${source.chain} recipient address.`);
    if (attribution && to !== initialAssetId)
      return setError("Buy the original call’s token to preserve attribution.");
    if (isTrade && from === to) return setError("Choose two different assets.");
    if (isTrade && source.chain !== target.chain)
      return setError(
        "Cross-chain swaps are not supported. Choose assets on the same chain.",
      );
    setStep("review");
  }
  function confirm() {
    const result = s.execute({
      id: intent,
      type: action === "Receive" ? "Add funds" : action,
      assetId: source.id,
      quantity: n,
      ...(isTrade ? { toAssetId: to } : {}),
      ...(action === "Buy" && attribution ? { attribution } : {}),
      ...(action === "Send" ? { recipient: address } : {}),
    });
    if (!result.ok) {
      setError(result.error || "Unable to record simulation.");
      return;
    }
    setStep("done");
  }
  const demoURI = `aladdin-demo://receive/${encodeURIComponent(chain)}/not-a-real-wallet`;
  return (
    <Modal
      title={
        step === "done"
          ? "Simulation complete"
          : step === "review"
            ? `Review ${action.toLowerCase()}`
            : action
      }
      close={close}
    >
      {action === "Buy" &&
      initialAssetId &&
      assetById(initialAssetId)?.chain !== "Solana" ? (
        <div className="wallet-unfunded">
          <Wallet size={30} />
          <h3>Funding on {assetById(initialAssetId)?.chain} needed</h3>
          <p>
            The demo wallet has no spendable funding assets on this network.
            Cross-chain bridging and settlement are not implemented.
          </p>
          <p>
            You can inspect this token’s history, or simulate a trade using a
            Solana asset.
          </p>
          <button className="wallet-primary" onClick={close}>
            Back to token
          </button>
        </div>
      ) : action === "Receive" ? (
        <div className="receive-content">
          <span className="simulation-pill">
            Receive preview · no real address
          </span>
          <label>
            Network
            <select
              value={chain}
              onChange={(e) => {
                setChain(e.target.value as typeof chain);
                setCopied(false);
              }}
            >
              {["Solana", "Base", "TON", "Robinhood Chain"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <div className="qr-frame">
            <QRCodeSVG
              value={demoURI}
              aria-label="Demo receive URI QR code, not a payment address"
              size={184}
              bgColor="#fff"
              fgColor="#141921"
              marginSize={2}
            />
          </div>
          <h3>
            {activeWallet?.label || "Wallet 1"} · {chain}
          </h3>
          <p>
            This QR encodes a demo URI, not a payment address. Do not send
            cryptocurrency.
          </p>
          <button
            className="wallet-secondary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(demoURI);
                setCopied(true);
              } catch {
                setError("Clipboard unavailable. The demo URI is shown below.");
              }
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}{" "}
            {copied ? "Demo URI copied" : "Copy demo URI"}
          </button>
          <code>{demoURI}</code>
          {error && <p role="alert">{error}</p>}
        </div>
      ) : step === "done" ? (
        <div className="wallet-success">
          <CheckCircle2 size={48} />
          <h3>
            {action === "Add funds"
              ? "Demo funds added"
              : `${action} simulated`}
          </h3>
          <p>
            {action === "Add funds"
              ? formatUSD(n)
              : `${quantity(n)} ${source.ticker}`}
            {isTrade && ` → ${quantity(received)} ${target.ticker}`}
          </p>
          <p className="wallet-subtitle">
            Only local demo balances changed. No payment or blockchain
            transaction occurred.
          </p>
          <button className="wallet-primary" onClick={close}>
            Done
          </button>
        </div>
      ) : step === "review" ? (
        <div className="wallet-review">
          <span className="simulation-pill">SIMULATED · NO REAL FUNDS</span>
          <div className="review-amount">
            {action === "Add funds"
              ? formatUSD(n)
              : `${quantity(n)} ${source.ticker}`}
          </div>
          {attribution && (
            <p className="mvp-note">
              Attributed to original caller · post{" "}
              {attribution.postId.slice(0, 8)}. A fictional 0.3% caller fee is
              modelled within the 0.5% spread, with no payout.
            </p>
          )}
          <dl>
            <div>
              <dt>Action</dt>
              <dd>{action} simulation</dd>
            </div>
            <div>
              <dt>Network</dt>
              <dd>{source.chain}</dd>
            </div>
            {action === "Send" && (
              <div>
                <dt>Recipient</dt>
                <dd className="recipient-address">{address}</dd>
              </div>
            )}
            {isTrade && (
              <>
                <div>
                  <dt>You receive</dt>
                  <dd>
                    {quantity(received)} {target.ticker}
                  </dd>
                </div>
                <div>
                  <dt>Illustrative spread</dt>
                  <dd>0.5% · {formatUSD(usd * DEMO_SPREAD)}</dd>
                </div>
              </>
            )}
            <div>
              <dt>Network fee</dt>
              <dd>None charged in demo</dd>
            </div>
          </dl>
          <p>
            Amounts use fixed fictional prices. This is not a live quote,
            transfer, or trade.
          </p>
          {error && (
            <p className="negative" role="alert">
              {error}
            </p>
          )}
          <button className="wallet-primary" onClick={confirm}>
            Confirm simulation <Check size={17} />
          </button>
          <button className="quiet-button" onClick={() => setStep("form")}>
            Edit details
          </button>
        </div>
      ) : (
        <form className="wallet-action-form" onSubmit={review}>
          <span className="simulation-pill">
            Demo {action.toLowerCase()} · no real funds
          </span>
          {action === "Add funds" ? (
            <>
              <p>
                Add simulated USDC to explore Aladdin. No card details, bank
                account or payment required.
              </p>
              <div className="deposit-presets">
                {[100, 250, 500].map((v) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => setAmount(String(v))}
                    aria-pressed={amount === String(v)}
                  >
                    ${v}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <label>
              {isTrade ? "Pay with" : "Asset"}
              <select
                aria-label="Pay asset"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  const changed = assetById(e.target.value)!;
                  const nextTarget = walletAssets.find(
                    (a) => a.chain === changed.chain && a.id !== changed.id,
                  );
                  if (nextTarget) setTo(nextTarget.id);
                  setAmount("");
                  setError("");
                }}
              >
                {walletAssets
                  .filter((a) => isTokenAvailable(a.id))
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.ticker} · {a.chain}
                    </option>
                  ))}
              </select>
            </label>
          )}
          <div className="amount-input-card">
            <label htmlFor="wallet-amount">
              {action === "Add funds"
                ? "Amount in USD"
                : `Amount in ${source.ticker}`}
            </label>
            <input
              id="wallet-amount"
              inputMode="decimal"
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <div>
              <small>
                {action === "Add funds"
                  ? "USDC · Solana"
                  : `Available: ${quantity(s.balances[source.id] || 0)} ${source.ticker}`}
              </small>
              {action !== "Add funds" && (
                <button
                  type="button"
                  onClick={() => setAmount(String(s.balances[source.id] || 0))}
                >
                  Max
                </button>
              )}
            </div>
          </div>
          {isTrade && (
            <>
              <div className="swap-arrow">
                <ArrowDownUp size={19} />
              </div>
              <label>
                Receive asset
                <select
                  aria-label="Receive asset"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                >
                  {walletAssets
                    .filter(
                      (a) => a.chain === source.chain && isTokenAvailable(a.id),
                    )
                    .map((a) => (
                      <option value={a.id} key={a.id}>
                        {a.ticker} · {a.chain}
                      </option>
                    ))}
                </select>
              </label>
              <div className="quote-preview">
                <span>Estimated receive</span>
                <b>
                  {n > 0 && Number.isFinite(received)
                    ? quantity(received)
                    : "0"}{" "}
                  {target.ticker}
                </b>
                <small>Fixed demo prices · illustrative spread 0.5%</small>
              </div>
            </>
          )}
          {action === "Send" && (
            <label>
              Recipient address
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value.trim())}
                placeholder={`${source.chain} address`}
                required
              />
            </label>
          )}
          {error && (
            <p className="negative" role="alert">
              {error}
            </p>
          )}
          <button className="wallet-primary" type="submit">
            Review {action.toLowerCase()} <ChevronRight size={17} />
          </button>
          <p className="wallet-form-note">
            <ShieldCheck size={13} /> All actions change only this browser’s
            demo ledger.
          </p>
        </form>
      )}
    </Modal>
  );
}
export function AssetDetail() {
  const { id } = useParams();
  const asset = assetById(id);
  const s = useWallet();
  const social = useStore();
  const ownLaunch = useMVP((v) => v.launches.find((l) => l.token.id === id));
  const [period, setPeriod] = useState("1D");
  const [action, setAction] = useState<"Buy" | "Sell" | null>(null);
  const [tab, setTab] = useState("Overview");
  if (!asset)
    return (
      <div className="wallet-empty">
        <h1>Asset not found</h1>
        <Link to="/discover">Discover assets</Link>
      </div>
    );
  if (!isTokenAvailable(asset.id))
    return (
      <div className="wallet-page">
        <Link className="back" to="/launch">
          <ArrowLeft size={16} /> Launch announcements
        </Link>
        <h1>Launch not detected yet</h1>
        <p className="wallet-subtitle">
          This demonstration token becomes available after simulated launch
          detection. No real deployment is performed.
        </p>
        <Link className="wallet-primary" to="/launch">
          Open launch demonstration
        </Link>
      </div>
    );
  const token = tokens.find((t) => t.id === asset.tokenId);
  const creator = users.find((u) => u.id === token?.creatorId);
  const balance = s.balances[asset.id] || 0;
  return (
    <div className="asset-detail-page">
      <div className="asset-detail-toolbar">
        <Link className="icon-button" aria-label="Back to wallet" to="/">
          <ArrowLeft size={22} />
        </Link>
        <span>
          {asset.chain} <span className="chain-status" />
        </span>
        <button
          className="icon-button"
          aria-label="Favourite token"
          aria-pressed={social.favorites.includes(asset.id)}
          onClick={() => social.toggle("favorites", asset.id)}
        >
          <Star
            size={20}
            className={social.favorites.includes(asset.id) ? "gold" : ""}
          />
        </button>
      </div>
      <div className="asset-detail-identity">
        <AssetIcon asset={asset} />
        <span>
          <h1>{asset.name}</h1>
          <small>{asset.ticker}</small>
        </span>
        <span className="simulation-pill">Demo asset</span>
      </div>
      <div className="asset-detail-grid">
        <section>
          <div className="asset-price">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 2,
              maximumFractionDigits: asset.price < 1 ? 6 : 2,
            }).format(asset.price)}
          </div>
          <p
            className={asset.change >= 0 ? "daily-gain" : "daily-gain negative"}
          >
            {asset.change >= 0 ? "+" : ""}
            {asset.change}% <span>· {period} illustrative</span>
          </p>
          {token ? (
            <React.Suspense fallback={<div className="spark big" />}>
              <LazySpark
                token={{
                  ...token,
                  history: token.history.map(
                    (v, i) =>
                      v +
                      Math.sin(i + period.length) *
                        (["1D", "1W", "1M", "1Y"].indexOf(period) + 1) *
                        3,
                  ),
                }}
                big
              />
            </React.Suspense>
          ) : (
            <ValueChart period={period} total={asset.price} />
          )}
          <div
            className="wallet-periods"
            role="group"
            aria-label="Asset chart period"
          >
            {["1D", "1W", "1M", "1Y"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={p === period ? "selected" : ""}
                aria-pressed={p === period}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="asset-trade-actions">
            <button className="wallet-primary" onClick={() => setAction("Buy")}>
              <Plus size={18} /> Buy
            </button>
            <button
              className="wallet-secondary"
              onClick={() => setAction("Sell")}
            >
              <ArrowUpRight size={18} /> Sell
            </button>
          </div>
          <div className="your-position">
            <span>
              <small>Your balance</small>
              <b>{s.hidden ? "••••" : formatUSD(balance * asset.price)}</b>
            </span>
            <span>
              <small>{asset.ticker} held</small>
              <b>{s.hidden ? "••••" : quantity(balance)}</b>
            </span>
          </div>
          <div className="wallet-segment detail-tabs" role="tablist">
            {["Overview", "Transactions", "About"].map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === "Overview" ? (
            <>
              <div className="market-facts">
                <span>
                  <small>Market cap</small>
                  <b>
                    {token
                      ? money(token.cap)
                      : asset.id === "usdc"
                        ? "$42.8B"
                        : "$98.2B"}
                  </b>
                </span>
                <span>
                  <small>24h volume</small>
                  <b>{token ? money(token.volume) : "$1.2B"}</b>
                </span>
                <span>
                  <small>Holders</small>
                  <b>
                    {token ? token.holders.toLocaleString() : "Illustrative"}
                  </b>
                </span>
                <span>
                  <small>Network</small>
                  <b>{asset.chain}</b>
                </span>
              </div>
              <p className="wallet-subtitle">
                Market figures and chart samples are fictional. Price ranges do
                not represent live performance.
              </p>
            </>
          ) : tab === "Transactions" ? (
            <ActivityList
              transactions={s.transactions.filter(
                (tx) => tx.assetId === asset.id || tx.toAssetId === asset.id,
              )}
            />
          ) : (
            <div className="asset-about">
              <p>
                {token?.description ||
                  `${asset.name} is shown here as a simulated wallet holding. No live balance or market feed is connected.`}
              </p>
              {token && (
                <>
                  <small>Contract address · {token.chain}</small>
                  <code>{token.address}</code>
                </>
              )}
              <p>Research is context, not a guarantee of performance.</p>
            </div>
          )}
        </section>
        <aside className="asset-reputation">
          {ownLaunch && (
            <section className="mvp-own-token">
              {ownLaunch.image && (
                <img
                  className="launch-image"
                  src={ownLaunch.image}
                  alt={ownLaunch.token.name}
                />
              )}
              <h2>Created by you</h2>
              <p>Simulated launch · {ownLaunch.launchpad}</p>
              <Link className="wallet-secondary" to="/profile/history">
                View creator history <ChevronRight size={16} />
              </Link>
              <small>No real token, fees or liquidity. Fixed demo price.</small>
            </section>
          )}
          {creator ? (
            <>
              <div className="section-heading">
                <h2>Behind the token</h2>
                <ShieldCheck size={16} />
              </div>
              <Link
                className="creator-wallet-card"
                to={`/profile/${creator.id}`}
              >
                <span className="creator-wallet-avatar">{creator.avatar}</span>
                <span>
                  <b>
                    {creator.name} <ShieldCheck size={13} />
                  </b>
                  <small>Creator · demo verified relationship</small>
                </span>
                <ChevronRight size={16} />
              </Link>
              <div className="creator-wallet-metrics">
                <span>
                  <b>{creator.launches}</b>
                  <small>Launches</small>
                </span>
                <span>
                  <b>{creator.graduated}</b>
                  <small>Graduated</small>
                </span>
                <span>
                  <b>{creator.launches - creator.graduated}</b>
                  <small>Not graduated</small>
                </span>
              </div>
              <p>
                Inspect the complete context, including active and failed
                launches, before your next move.
              </p>
              <div className="creator-wallet-links">
                <Link to={`/profile/${creator.id}`}>
                  Explore track record <ArrowUpRight size={14} />
                </Link>
                <button onClick={() => social.toggle("follows", creator.id)}>
                  {social.follows.includes(creator.id) ? (
                    <Check size={14} />
                  ) : (
                    <Plus size={14} />
                  )}{" "}
                  {social.follows.includes(creator.id)
                    ? "Following"
                    : "Follow creator"}
                </button>
              </div>
              <details className="asset-caller-history">
                <summary>
                  Calls on {asset.ticker}
                  <ChevronDown size={16} />
                </summary>
                {calls
                  .filter((c) => c.tokenId === asset.id)
                  .map((c) => (
                    <Link to={`/post/${c.id}`} key={c.id}>
                      <span>
                        <b>{users.find((u) => u.id === c.userId)?.name}</b>
                        <small>
                          {c.timestamp.slice(0, 10)} · Baseline{" "}
                          {money(c.baselineCap)}
                        </small>
                      </span>
                      <span
                        className={c.outcome >= 1 ? "positive" : "negative"}
                      >
                        {c.outcome.toFixed(1)}×
                      </span>
                    </Link>
                  ))}
                <p>
                  Original, simulated records. Failed outcomes remain visible.
                </p>
              </details>
              <Link className="token-calls-link" to="/people?role=Caller">
                <FileText size={17} />
                <span>
                  <b>Explore caller records</b>
                  <small>Inspect original calls and outcomes.</small>
                </span>
                <ChevronRight size={15} />
              </Link>
            </>
          ) : (
            <>
              <ShieldCheck size={24} />
              <h2>Keep context close.</h2>
              <p>
                Explore creators, callers and traders as you discover new
                assets.
              </p>
              <Link className="wallet-secondary" to="/people">
                Explore people <ChevronRight size={15} />
              </Link>
            </>
          )}
          <div className="wallet-safety">
            <ShieldCheck size={15} />
            <p>
              Buying and selling here only updates local demo balances. No
              execution or custody.
            </p>
          </div>
        </aside>
      </div>
      {action && (
        <WalletAction
          action={action}
          initialAssetId={asset.id}
          close={() => setAction(null)}
        />
      )}
    </div>
  );
}
export function Discover({
  renderPost,
}: {
  renderPost: (p: Post) => React.ReactNode;
}) {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [chain, setChain] = useState("All chains");
  const tab = params.get("view") || "Trending";
  const social = useStore();
  useMVP((s) => s.launches);
  const q = query.trim().toLowerCase();
  const filtered = tokens
    .filter((t) => isTokenAvailable(t.id))
    .filter(
      (t) =>
        (chain === "All chains" || t.chain === chain) &&
        `${t.ticker} ${t.name} ${t.address} ${t.chain} ${users.find((u) => u.id === t.creatorId)?.name || (t.creatorId === "account-demo" ? "You · demo creator" : "Unknown")}`
          .toLowerCase()
          .includes(q),
    )
    .sort((a, b) =>
      tab === "New launches"
        ? parseInt(a.age) - parseInt(b.age)
        : b.change - a.change,
    );
  const nativeMatches = walletAssets.filter(
    (a) =>
      !a.tokenId &&
      q &&
      (chain === "All chains" || a.chain === chain) &&
      `${a.name} ${a.ticker} ${a.chain}`.toLowerCase().includes(q),
  );
  const people = users.filter((u) => q && u.name.includes(q));
  const visiblePosts = social.posts.filter(
    (p) =>
      social.follows.includes(p.userId) &&
      (chain === "All chains" ||
        tokens.find((t) => t.id === p.tokenId)?.chain === chain) &&
      `${p.text} ${users.find((u) => u.id === p.userId)?.name}`
        .toLowerCase()
        .includes(q),
  );
  return (
    <div className="discover-page">
      <div className="wallet-page-title">
        <div>
          <h1>Discover</h1>
          <p>Tokens, launches and the people behind them.</p>
        </div>
        <Link
          className="icon-button"
          aria-label="Launch announcements"
          to="/launch"
        >
          <CalendarDays size={21} />
        </Link>
      </div>
      <nav className="discover-sections" aria-label="Discovery categories">
        <Link className="selected" to="/discover">
          Tokens
        </Link>
        <Link to="/creators">Creators</Link>
        <Link to="/callers">Callers</Link>
        <Link to="/traders">Traders</Link>
      </nav>
      <label className="discover-search">
        <Search size={20} />
        <input
          aria-label="Discover search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Token, contract, chain or person"
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label="Clear search">
            Clear
          </button>
        )}
      </label>
      <Link className="discover-announcement-link" to="/launch">
        <CalendarDays size={18} />
        <span>Creator launch announcements</span>
        <ChevronRight size={16} />
      </Link>
      <div className="discover-controls">
        <div className="wallet-segment" role="tablist">
          {["Trending", "New launches", "Following"].map((v) => (
            <button
              role="tab"
              key={v}
              aria-selected={tab === v}
              onClick={() => setParams(v === "Trending" ? {} : { view: v })}
            >
              {v}
            </button>
          ))}
        </div>
        <label className="network-filter">
          <SlidersHorizontal size={14} />
          <select
            aria-label="Token chain"
            value={chain}
            onChange={(e) => setChain(e.target.value)}
          >
            {[
              "All chains",
              "Solana",
              "Base",
              "Ethereum",
              "BNB Chain",
              "Robinhood Chain",
            ].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      {people.length > 0 && (
        <div className="discovered-people">
          {people.map((u) => (
            <Link key={u.id} to={`/profile/${u.id}`}>
              <span className="creator-wallet-avatar">{u.avatar}</span>
              <span>
                <b>{u.name}</b>
                <small>{u.roles.join(" · ")}</small>
              </span>
              <ChevronRight size={17} />
            </Link>
          ))}
        </div>
      )}
      {tab === "Following" ? (
        <div className="discover-following">
          {visiblePosts.map((p) => (
            <React.Fragment key={p.id}>{renderPost(p)}</React.Fragment>
          ))}
          {!visiblePosts.length && (
            <div className="wallet-empty">
              <Users size={26} />
              <h2>Your people, your perspective.</h2>
              <p>
                Follow creators, callers and traders to see their relevant
                activity.
              </p>
              <Link className="wallet-primary" to="/people">
                Find people
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="discover-token-list">
          <div className="discover-table-label">
            <span>Token · simulated data</span>
            <span>Market cap / Change</span>
          </div>
          {nativeMatches.map((a) => (
            <Link
              className="discover-token-row"
              key={a.id}
              to={`/asset/${a.id}`}
            >
              <AssetIcon asset={a} />
              <span className="discovery-token-name">
                <b>
                  {a.ticker}
                  <span>{a.name}</span>
                </b>
                <small>{a.chain} · native wallet asset</small>
              </span>
              <span className="discovery-spark" />
              <span className="discovery-value">
                <b>{a.id === "sol" ? "$98.2B" : "$42.8B"}</b>
                <small className="positive">+{a.change}%</small>
              </span>
              <ChevronRight size={15} />
            </Link>
          ))}
          {filtered.map((t, i) => (
            <Link
              className="discover-token-row"
              key={t.id}
              to={`/token/${t.id}`}
            >
              <span className="token-rank">{i + 1}</span>
              <AssetIcon asset={assetById(t.id)!} />
              <span className="discovery-token-name">
                <b>
                  {t.ticker} <span>{t.name}</span>
                </b>
                <small>
                  {t.chain} · by{" "}
                  {users.find((u) => u.id === t.creatorId)?.name ||
                    (t.creatorId === "account-demo"
                      ? "You · demo creator"
                      : "Unknown")}
                </small>
              </span>
              <span className="discovery-spark" aria-hidden="true">
                <svg viewBox="0 0 100 36">
                  <polyline
                    points={t.history
                      .filter((_, i) => i % 2 === 0)
                      .map((v, i) => `${i * 6},${35 - v / 2}`)
                      .join(" ")}
                    fill="none"
                    stroke={t.change > 0 ? "#44d8ad" : "#ee8c98"}
                    strokeWidth="1.5"
                  />
                </svg>
              </span>
              <span className="discovery-value">
                <b>{money(t.cap)}</b>
                <small className={t.change > 0 ? "positive" : "negative"}>
                  {t.change > 0 ? "+" : ""}
                  {t.change}%
                </small>
              </span>
              <ChevronRight size={15} />
            </Link>
          ))}
          {!filtered.length && !nativeMatches.length && (
            <div className="wallet-empty">
              No tokens match. Try another name, chain or address.
            </div>
          )}
          <p className="wallet-form-note">
            Illustrative prices and activity · no live market feed
          </p>
        </div>
      )}
      <div className="discovery-shortcuts">
        <Link to="/narratives">
          Explore narratives <ChevronRight size={15} />
        </Link>
        <Link to="/hire">
          Find creator opportunities <ChevronRight size={15} />
        </Link>
      </div>
    </div>
  );
}
export function People({ initial }: { initial?: Role }) {
  const [params, setParams] = useSearchParams();
  const role = (
    ["Creator", "Caller", "Trader"].includes(params.get("role") || "")
      ? params.get("role")
      : initial || "Creator"
  ) as Role;
  return (
    <div className="people-page">
      <div className="wallet-page-title">
        <div>
          <h1>People</h1>
        </div>
        <Link
          className="icon-button"
          aria-label="Hiring opportunities"
          to="/hire"
        >
          <Users size={22} />
        </Link>
      </div>
      <div className="people-roles" role="tablist">
        {(["Creator", "Caller", "Trader"] as const).map((r) => (
          <button
            key={r}
            role="tab"
            aria-selected={role === r}
            onClick={() => setParams({ role: r })}
          >
            {r}s
          </button>
        ))}
      </div>
      {role === "Trader" && <DiscoveryPreview role={role} />}
      <Directory key={role} category={role} embedded />
    </div>
  );
}
export function MyProfile({ account }: { account: React.ReactNode }) {
  const setup = useOnboarding();
  const [restart, setRestart] = useState(false);
  const [reset, setReset] = useState(false);
  const [info, setInfo] = useState("");
  const social = useStore();
  const wallet = useWallet();
  return (
    <div className="my-profile">
      <div className="wallet-page-title">
        <h1>Profile</h1>
        <Settings size={21} />
      </div>
      <div className="my-profile-identity">
        <span style={setup.xIdentity ? { fontSize: 28 } : undefined}>
          {setup.xIdentity ? "AR" : "✦"}
        </span>
        <h2>
          {setup.legacy
            ? social.participation === "wallet"
              ? "Your wallet"
              : "launchking"
            : setup.xIdentity?.name || "Your wallet"}
        </h2>
        <p>
          {setup.legacy
            ? social.participation === "wallet"
              ? "Wallet-only demo account"
              : "@launchking · social demo identity"
            : setup.xIdentity
              ? "@" + setup.xIdentity.username + " · simulated X identity"
              : "Wallet-only demo account"}
        </p>
        <span className="simulation-pill">
          Local demo · not authenticated with X
        </span>
      </div>
      <div className="profile-wallet-summary">
        <span>
          <Wallet size={20} />{" "}
          {setup.wallets.find((w) => w.id === setup.activeWalletId)?.label ||
            "Wallet 1"}
        </span>
        <b>
          {wallet.hidden ? "••••" : formatUSD(walletTotal(wallet.balances))}
        </b>
      </div>
      <div className="profile-menu">
        {(
          [
            [
              "Your reputation",
              setup.legacy
                ? "/profile/" +
                  (social.participation === "wallet" ? "wallet-demo" : "u1")
                : "/profile/history",
              ShieldCheck,
            ],
            ["Wallet activity", "/activity", Clock3],
            ["Posts and saved lists", "/lists", Bookmark],
            ["Notifications and preferences", "/alerts", Bell],
            ["Launch announcements", "/launch", CalendarDays],
          ] as const
        ).map(([label, to, Icon]) => (
          <Link key={label} to={to}>
            <Icon size={19} />
            <span>{label}</span>
            <ChevronRight size={17} />
          </Link>
        ))}
        <button
          onClick={() =>
            setInfo(
              "Creator subscriptions will support paid research, community access and configurable alerts. Payments and subscription purchases are not enabled in this prototype.",
            )
          }
        >
          <Star size={19} />
          <span>Subscriptions</span>
          <small>Coming later</small>
          <ChevronRight size={17} />
        </button>
        <Link to="/profile/wallets">
          <Wallet size={19} />
          <span>Connected wallets</span>
          <ChevronRight size={17} />
        </Link>
        <Link to="/profile/identity">
          <Link2 size={19} />
          <span>
            {setup.xIdentity ? "Linked X identity" : "Link your X identity"}
          </span>
          <ChevronRight size={17} />
        </Link>
        <button onClick={() => setRestart(true)}>
          <RotateCcw size={19} />
          <span>Restart onboarding demo</span>
          <ChevronRight size={17} />
        </button>
        <button onClick={wallet.toggleHidden}>
          {wallet.hidden ? <EyeOff size={19} /> : <Eye size={19} />}
          <span>
            {wallet.hidden ? "Show wallet balances" : "Hide wallet balances"}
          </span>
          <ChevronRight size={17} />
        </button>
        <button onClick={() => setReset(true)}>
          <LogOut size={19} />
          <span>Reset demo wallet</span>
          <ChevronRight size={17} />
        </button>
      </div>
      <details className="profile-advanced">
        <summary>
          Demo account modes and API access <ChevronDown size={16} />
        </summary>
        {account}
      </details>
      <p className="wallet-form-note">
        Aladdin Social · A wallet-first prototype.
        <br />
        No real funds, keys, transactions or paid access.
      </p>
      {restart && <ResetOnboarding close={() => setRestart(false)} />}
      {info && (
        <Modal title="Prototype feature" close={() => setInfo("")}>
          <p>{info}</p>
          <button className="wallet-primary" onClick={() => setInfo("")}>
            Got it
          </button>
        </Modal>
      )}
      {reset && (
        <Modal title="Reset demo wallet?" close={() => setReset(false)}>
          <p>
            This restores the original simulated balances and clears this
            browser’s demo wallet activity. Social posts, follows and
            notification settings are preserved.
          </p>
          <button
            className="wallet-primary"
            onClick={() => {
              wallet.reset();
              setReset(false);
            }}
          >
            Reset demo balances
          </button>
          <button className="wallet-secondary" onClick={() => setReset(false)}>
            Keep my demo activity
          </button>
        </Modal>
      )}
    </div>
  );
}

export function WalletAssets() {
  const s = useWallet();
  const [q, setQ] = useState("");
  const held = walletAssets.filter(
    (a) =>
      (s.balances[a.id] || 0) > 0 &&
      `${a.name} ${a.ticker} ${a.chain}`
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  return (
    <div className="wallet-page">
      <Link className="back" to="/">
        <ArrowLeft size={16} /> Wallet
      </Link>
      <h1>Your tokens</h1>
      <p className="wallet-subtitle">
        All your simulated holdings, across supported networks.
      </p>
      <label className="discover-search">
        <Search size={19} />
        <input
          aria-label="Search wallet assets"
          placeholder="Search your assets"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>
      {held.map((a) => (
        <Link className="asset-row" key={a.id} to={`/asset/${a.id}`}>
          <AssetIcon asset={a} />
          <span className="asset-label">
            <b>{a.name}</b>
            <small>
              {s.hidden ? "••••" : quantity(s.balances[a.id])} {a.ticker} ·{" "}
              {a.chain}
            </small>
          </span>
          <span className="asset-value">
            <b>{s.hidden ? "••••" : formatUSD(s.balances[a.id] * a.price)}</b>
          </span>
        </Link>
      ))}
      {!held.length && (
        <div className="wallet-empty">No holdings match your search.</div>
      )}
    </div>
  );
}
