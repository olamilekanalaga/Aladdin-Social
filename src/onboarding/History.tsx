import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  History,
  Link2,
  LoaderCircle,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useOnboarding } from "./store";
import { summarizeHistory, discoveryEligibility } from "./model";
import {
  HistoryTotals,
  ImportedRecordList,
  WalletIdentity,
  XIdentityCard,
} from "./Onboarding";
import { useStore } from "../store";
import { money, tokens } from "../data";
import { useMVP } from "../mvp/state";
import { useWallet } from "../wallet-store";
import type { Role } from "../models";
export function HistoricalProfile() {
  const a = useOnboarding();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState("Launch history");
  const selected = params.get("wallet") || "all";
  const launches = a.launches.filter(
    (l) => selected === "all" || l.walletId === selected,
  );
  const trades = a.trades.filter(
    (t) => selected === "all" || t.walletId === selected,
  );
  const summary = summarizeHistory(launches, trades);
  const eligible = discoveryEligibility(a.wallets, a.xIdentity);
  return (
    <div className="historical-profile">
      <Link className="back" to="/profile">
        <ArrowLeft size={17} /> Your profile
      </Link>
      <div className="history-profile-title">
        <span className="x-avatar">
          {a.xIdentity ? "AR" : <Wallet size={27} />}
        </span>
        <div>
          <h1>{a.xIdentity?.name || "Your on-chain history"}</h1>
          <p>
            {a.xIdentity ? "@" + a.xIdentity.username : "Wallet-only profile"} ·
            Fictional demo records
          </p>
        </div>
      </div>
      <div className="history-discovery-status">
        <ShieldCheck size={19} />
        <div>
          <b>
            {eligible.demoEligible
              ? "Discoverable in demo preview"
              : "Private wallet history"}
          </b>
          <p>{eligible.reason}</p>
        </div>
        {!a.xIdentity && (
          <Link to="/profile/identity">
            Link X <ArrowUpRight size={14} />
          </Link>
        )}
      </div>
      <label className="onboarding-label">
        History scope
        <select
          aria-label="History wallet"
          value={selected}
          onChange={(e) =>
            setParams(
              e.target.value === "all" ? {} : { wallet: e.target.value },
            )
          }
        >
          <option value="all">
            All connected wallets ({a.wallets.length})
          </option>
          {a.wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.label} · {w.chain}
            </option>
          ))}
        </select>
      </label>
      <HistoryTotals launches={launches} trades={trades} />
      <div className="direct-achievements">
        <span>
          <b>{summary.above100k}</b>
          <small>Reached $100K</small>
        </span>
        <span>
          <b>{summary.above500k}</b>
          <small>Reached $500K</small>
        </span>
        <span>
          <b>{money(summary.highestCap)}</b>
          <small>Highest observed cap</small>
        </span>
      </div>
      <div className="wallet-segment" role="tablist">
        {["Launch history", "Trading history", "Wallets"].map((t) => (
          <button
            role="tab"
            aria-selected={tab === t}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Launch history" ? (
        <ImportedRecordList records={launches} wallets={a.wallets} />
      ) : tab === "Trading history" ? (
        <div className="imported-trades">
          <p className="onboarding-caption">
            Original timestamps and wallet attribution are preserved. Simulated
            financial results.
          </p>
          <div className="direct-achievements">
            <span>
              <b>{money(summary.realisedPnL)}</b>
              <small>Realised PnL</small>
            </span>
            <span>
              <b>{money(summary.volume)}</b>
              <small>Volume</small>
            </span>
            <span>
              <b>{summary.closedPositions}</b>
              <small>Closed positions</small>
            </span>
          </div>
          {trades.map((t) => (
            <article key={t.id}>
              <div>
                <span className={t.side === "Buy" ? "positive" : "negative"}>
                  {t.side}
                </span>
                <b>{money(t.amountUSD)}</b>
              </div>
              <small>
                {a.wallets.find((w) => w.id === t.walletId)?.label} · {t.chain}{" "}
                · {new Date(t.timestamp).toLocaleString("en-GB")}
              </small>
              <code>{t.tokenAddress}</code>
              <small>
                Realised PnL: {money(t.realisedPnL)} · Demo purchase evidence
              </small>
            </article>
          ))}
          {!trades.length && (
            <div className="wallet-empty">
              No historical trading records for this wallet.
            </div>
          )}
        </div>
      ) : (
        <div className="history-wallet-breakdown">
          {a.wallets
            .filter((w) => selected === "all" || w.id === selected)
            .map((w) => {
              const s = summarizeHistory(
                a.launches.filter((l) => l.walletId === w.id),
                a.trades.filter((t) => t.walletId === w.id),
              );
              return (
                <article key={w.id}>
                  <WalletIdentity wallet={w} />
                  <div>
                    <b>
                      {s.launches} launches · {s.graduated} graduated ·{" "}
                      {s.trades} trades
                    </b>
                    <small>
                      Historical fees:{" "}
                      {Object.entries(s.fees)
                        .map(([asset, value]) => `${value} ${asset}`)
                        .join(" + ") || "0"}
                    </small>
                  </div>
                  <details className="ownership-message">
                    <summary>
                      Original demo proof <ChevronRight size={14} />
                    </summary>
                    <pre>
                      {w.proof?.message || "No ownership proof attached."}
                    </pre>
                    <small>
                      Accepted {w.proof?.acceptedAt || "Not verified"} ·
                      Simulated, not cryptographic proof
                    </small>
                  </details>
                </article>
              );
            })}
          <Link className="wallet-secondary" to="/profile/wallets">
            <Link2 size={17} /> Manage connected wallets
          </Link>
        </div>
      )}
      <div className="onboarding-fact">
        <History size={18} />
        <p>
          Records belong to their original wallets and tokens. Combining wallets
          changes the summary, not the underlying observations. This
          demonstration never accesses the production Aladdin/Vlak database.
        </p>
      </div>
    </div>
  );
}
export function IdentityManagement() {
  const a = useOnboarding();
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!busy) return;
    const timer = setTimeout(() => {
      useOnboarding.getState().linkX();
      useStore.getState().setParticipation("social");
      setBusy(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [busy]);
  const eligibility = discoveryEligibility(a.wallets, a.xIdentity);
  return (
    <div className="identity-management">
      <Link className="back" to="/profile">
        <ArrowLeft size={17} /> Profile
      </Link>
      <div className="wallet-page-title">
        <h1>Linked identity</h1>
        <span className="simulation-pill">Demo</span>
      </div>
      <p className="wallet-subtitle">
        Connect your X identity to make your verified on-chain history
        discoverable.
      </p>
      <XIdentityCard />
      <div className="identity-eligibility">
        <ShieldCheck size={20} />
        <div>
          <b>
            {eligibility.demoEligible
              ? "Demo discovery enabled"
              : "Wallet-only participation"}
          </b>
          <p>{eligibility.reason}</p>
        </div>
      </div>
      {!a.xIdentity ? (
        <button
          className="wallet-primary"
          onClick={() => setBusy(true)}
          disabled={busy}
        >
          {busy ? (
            <LoaderCircle className="onboarding-spinner" size={17} />
          ) : (
            <span>𝕏</span>
          )}{" "}
          {busy ? "Linking demo identity…" : "Simulate X connection"}
        </button>
      ) : (
        <>
          <Link className="wallet-primary" to="/people">
            View discovery preview <ArrowUpRight size={16} />
          </Link>
          <button
            className="wallet-secondary"
            onClick={() => {
              a.unlinkX();
              useStore.getState().setParticipation("wallet");
            }}
          >
            Unlink demo X identity
          </button>
        </>
      )}
      <h2 className="linked-wallet-title">Connected wallets</h2>
      {a.wallets.map((w) => (
        <WalletIdentity key={w.id} wallet={w} />
      ))}
      <Link className="wallet-secondary" to="/profile/wallets">
        <Wallet size={17} /> Manage wallets <ChevronRight size={16} />
      </Link>
      <p className="onboarding-caption">
        X OAuth is not configured. The demonstration account has not
        authenticated with X. A simulated connection does not create actual
        public leaderboard eligibility.
      </p>
    </div>
  );
}
export function DiscoveryPreview({ role = "Creator" }: { role?: Role }) {
  const a = useOnboarding();
  const posts = useStore((s) => s.posts);
  const evidence = useMVP((s) => s.callPurchases);
  const ledger = useWallet();
  const ownCalls = posts.filter(
    (p) =>
      ["account-demo", "wallet-demo"].includes(p.userId) &&
      p.type === "Callout",
  );
  const transactions = [
    ...ledger.transactions,
    ...Object.entries(ledger.ledgers)
      .filter(([id]) => id !== ledger.activeWalletId)
      .flatMap(([, l]) => l.transactions),
  ];
  const qualifying = ownCalls.filter((p) =>
    transactions.some(
      (tx) =>
        tx.id === evidence[p.id] &&
        tx.type === "Buy" &&
        tx.toAssetId === p.tokenId &&
        a.wallets.some(
          (w) =>
            w.id === tx.walletId &&
            w.proof &&
            w.chain === tokens.find((t) => t.id === p.tokenId)?.chain,
        ),
    ),
  );
  const e = discoveryEligibility(a.wallets, a.xIdentity);
  if (a.legacy || !a.completed) return null;
  const stats = summarizeHistory(a.launches, a.trades);
  return (
    <div className="own-discovery-preview">
      <div>
        <span className="x-avatar">
          {a.xIdentity ? "AR" : <Wallet size={20} />}
        </span>
        <span>
          <b>{a.xIdentity?.name || "Your wallet profile"}</b>
          <small>
            {e.demoEligible
              ? "Your demo discovery preview"
              : "Your history stays with your wallet"}
          </small>
        </span>
        {e.demoEligible && <Check size={17} />}
      </div>
      <p>
        {e.demoEligible
          ? role === "Caller"
            ? `${ownCalls.length} published calls · ${qualifying.length} with associated demo purchases. Original and failed records remain available.`
            : role === "Trader"
              ? `${stats.trades} imported trades · ${transactions.filter((tx) => tx.type === "Buy" || tx.type === "Sell").length} local trade receipts · ${a.wallets.length} connected wallets`
              : `${stats.launches} launches · ${stats.graduated} graduated · ${a.wallets.length} connected wallet${a.wallets.length === 1 ? "" : "s"}`
          : "Link an X identity to preview social discovery. You can inspect your wallet history without linking."}
      </p>
      <Link to={e.demoEligible ? "/profile/history" : "/profile/identity"}>
        {e.demoEligible ? "Inspect your reputation history" : "Link X identity"}{" "}
        <ArrowUpRight size={15} />
      </Link>
      <small>
        Preview only. Real public access requires authenticated X and live
        ownership verification.
      </small>
    </div>
  );
}
