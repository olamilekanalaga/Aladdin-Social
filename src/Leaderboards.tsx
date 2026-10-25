import { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { users, calls, money } from "./data";
import {
  qualifiedCalls,
  traderPeriodMetrics,
  type TradingPeriod,
} from "./reputation";
import type { Role, User } from "./models";
export default function Leaderboards({
  category: role,
}: {
  category: Role;
  embedded?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<TradingPeriod>("24h");
  const [metric, setMetric] = useState(
    role === "Creator" ? "Created" : role === "Caller" ? "Called" : "PnL",
  );
  const criteria =
    role === "Creator"
      ? ["Created", "Migrated"]
      : role === "Caller"
        ? ["Called", "Call multiple", "Sold multiple"]
        : ["PnL", "Win rate"];
  const userCalls = (u: User) => calls.filter((c) => c.userId === u.id);
  function value(u: User) {
    if (role === "Creator")
      return metric === "Migrated" ? u.migrated || 0 : u.launches;
    if (role === "Caller")
      return metric === "Called"
        ? userCalls(u).length
        : metric === "Call multiple"
          ? Math.max(0, ...userCalls(u).map((c) => c.outcome))
          : 0;
    const results = traderPeriodMetrics(u, period);
    return metric === "Win rate" ? results.winRate : results.pnl;
  }
  const list = users
    .filter(
      (u) =>
        u.roles.includes(role) &&
        u.social.externalId &&
        (role !== "Caller" || qualifiedCalls(u).length > 0) &&
        `${u.name} ${u.social.username}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) => value(b) - value(a));
  return (
    <section className="compact-board" aria-label={`${role}s leaderboard`}>
      <div className="compact-board-tools">
        <label className="inline-search">
          <Search size={16} />
          <input
            aria-label={`Search ${role.toLowerCase()}s`}
            placeholder={`Search ${role.toLowerCase()}s`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          aria-label={`Rank ${role.toLowerCase()}s by`}
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
        >
          {criteria.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      {role === "Trader" && (
        <div className="trader-periods" role="group" aria-label="PnL period">
          {(["24h", "7D", "30D"] as const).map((p) => (
            <button
              key={p}
              aria-pressed={period === p}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}
      <div className={`compact-board-labels ${role.toLowerCase()}`}>
        <span>Account</span>
        {role === "Creator" ? (
          <>
            <span>Created</span>
            <span>Migrated</span>
          </>
        ) : role === "Caller" ? (
          <>
            <span>Called</span>
            <span>Call ×</span>
            <span>Sold ×</span>
          </>
        ) : (
          <>
            <span>PnL</span>
            <span>Win rate</span>
          </>
        )}
      </div>
      <div className="compact-board-list">
        {list.map((u) => {
          const records = userCalls(u);
          const best = records.length
            ? Math.max(...records.map((c) => c.outcome))
            : null;
          const results = traderPeriodMetrics(u, period);
          return (
            <Link
              className={`compact-person ${role.toLowerCase()}`}
              key={u.id}
              to={`/profile/${u.id}`}
            >
              <span className="compact-person-identity">
                <span
                  className="compact-portrait"
                  style={{ background: u.color + "30", color: u.color }}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 40 40" width="36" height="36">
                    <circle cx="20" cy="14" r="7" fill="currentColor" />
                    <path d="M7 37v-5a13 13 0 0126 0v5" fill="currentColor" />
                  </svg>
                </span>
                <span>
                  <b>{u.name}</b>
                  <small>@{u.social.username}</small>
                </span>
              </span>
              {role === "Creator" ? (
                <>
                  <strong>{u.launches}</strong>
                  <strong>{u.migrated ?? 0}</strong>
                </>
              ) : role === "Caller" ? (
                <>
                  <strong>{records.length}</strong>
                  <strong
                    className={
                      best !== null && best >= 1 ? "positive" : "negative"
                    }
                  >
                    {best === null ? "—" : `${best.toFixed(1)}×`}
                  </strong>
                  <strong title="Realised sale multiple unavailable">—</strong>
                </>
              ) : (
                <>
                  <strong
                    className={results.pnl >= 0 ? "positive" : "negative"}
                  >
                    {results.pnl > 0 ? "+" : ""}
                    {money(results.pnl)}
                  </strong>
                  <strong>{Math.round(results.winRate)}%</strong>
                </>
              )}
            </Link>
          );
        })}
      </div>
      {!list.length && <p className="wallet-empty">No results</p>}
    </section>
  );
}
