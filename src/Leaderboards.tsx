import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ArrowUpRight,
  ShieldCheck,
  Users,
  History,
  ChartNoAxesCombined,
  Megaphone,
} from "lucide-react";
import { users, tokens, launches, calls, trades, money } from "./data";
import {
  creatorAchievements,
  qualifiedCalls,
  tradingEvidence,
} from "./reputation";
import { useStore } from "./store";
import type { Role, User } from "./models";
const copy = {
  Creator: {
    title: "Creators",
    sub: "Launch outcomes, graduation rate and attributable fees.",
    criteria: [
      "Launches",
      "Graduations",
      "Reached $100K",
      "Reached $500K",
      "Reached $1M+",
      "Highest observed cap",
      "Creator fees",
    ],
    icon: Users,
  },
  Trader: {
    title: "Traders",
    sub: "Realised PnL, win rate and trading consistency.",
    criteria: ["Realised PnL", "Win rate", "Trading volume"],
    icon: ChartNoAxesCombined,
  },
  Caller: {
    title: "Callers",
    sub: "Original call times, market-cap baselines and subsequent outcomes.",
    criteria: ["Call success", "Verified buys", "Trading performance"],
    icon: Megaphone,
  },
};
function compactIdentity(u: User) {
  return (
    <Link className="leader-identity" to={`/profile/${u.id}`}>
      <span
        className="avatar"
        style={{
          background: u.color + "25",
          borderColor: u.color + "70",
          width: 34,
          height: 34,
          fontSize: 20,
        }}
      >
        {u.avatar}
      </span>
      <span>
        <b>
          {u.name}{" "}
          {u.social.verified && <ShieldCheck size={12} className="blue" />}
        </b>
        <small>@{u.social.username}</small>
      </span>
    </Link>
  );
}
export default function Leaderboards({
  category: role,
  embedded = false,
}: {
  category: Role;
  embedded?: boolean;
}) {
  const config = copy[role];
  const [search, setSearch] = useState("");
  const [metric, setMetric] = useState(config.criteria[0]);
  const [period, setPeriod] = useState("All time");
  const store = useStore();
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const Icon = config.icon;
  const days = period === "7D" ? 7 : period === "30D" ? 30 : Infinity;
  const within = (timestamp: string) =>
    Date.parse(timestamp) >=
    Date.parse("2026-10-24T23:59:59Z") - days * 86400000;
  const buys = (u: User) =>
    tradingEvidence(u).trades.filter((t) => t.side === "Buy");
  const userCalls = (u: User) =>
    (role === "Caller" && verifiedOnly
      ? qualifiedCalls(u)
      : calls.filter((c) => c.userId === u.id)
    ).filter((c) => within(c.timestamp));
  const success = (u: User) => {
    const c = userCalls(u);
    return c.length
      ? (c.filter((c) => c.outcome >= 2).length / c.length) * 100
      : 0;
  };
  const buyerCount = (u: User) => u.launches * 280 + u.graduated * 120;
  const rankingValue = (u: User) => {
    if (role === "Creator") {
      const a = creatorAchievements(u);
      return metric === "Launches"
        ? a.launches
        : metric === "Graduations"
          ? a.graduated
          : metric === "Reached $100K"
            ? a.above100k
            : metric === "Reached $500K"
              ? a.above500k
              : metric === "Reached $1M+"
                ? a.above1m
                : metric === "Highest observed cap"
                  ? a.highest
                  : a.fees;
    }
    if (role === "Trader")
      return metric === "Win rate"
        ? u.winRate
        : metric === "Trading volume"
          ? tradingEvidence(u).volume
          : u.pnl;
    return metric === "Verified buys"
      ? qualifiedCalls(u).length
      : metric === "Trading performance"
        ? u.pnl
        : success(u);
  };
  const list = users
    .filter(
      (u) =>
        u.roles.includes(role) &&
        Boolean(u.social.externalId) &&
        (role !== "Caller" || !verifiedOnly || qualifiedCalls(u).length > 0) &&
        `${u.name} ${u.social.username}`.includes(search.toLowerCase()),
    )
    .sort((a, b) => rankingValue(b) - rankingValue(a));
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">PEOPLE FIRST. EVIDENCE ALWAYS.</div>
          {embedded ? (
            <h2>{config.title}</h2>
          ) : (
            <h1>
              {config.title}
              <span className="gold">.</span>
            </h1>
          )}
          <p>{config.sub}</p>
        </div>
        <span className="leader-emblem">
          <Icon size={26} strokeWidth={1.3} />
        </span>
      </div>
      <div className={`leader-context ${role.toLowerCase()}`}>
        <div>
          <Icon size={19} />
          <span>
            <b>
              {role === "Creator"
                ? "Launch history is a record, not a guarantee."
                : role === "Caller"
                  ? "Every outcome stays attached to the original call."
                  : "PnL means more with a complete trading history."}
            </b>
            <small>
              {role === "Creator"
                ? "Successful launches, failed launches, attribution and sustained outcomes."
                : role === "Caller"
                  ? "Caller buys are separate evidence from a published thesis. No assumed holdings."
                  : "Realised and unrealised results are separate. All figures here are simulated."}
            </small>
          </span>
        </div>
        <Link
          to={
            role === "Creator"
              ? "/hire"
              : role === "Caller"
                ? "/launch"
                : "/terminal"
          }
        >
          {role === "Creator"
            ? "Explore opportunities"
            : role === "Caller"
              ? "Follow future activity"
              : "Open research terminal"}{" "}
          <ArrowUpRight size={13} />
        </Link>
      </div>
      <div className="toolbar">
        {role === "Creator" ? (
          <label className="creator-ranking-select">
            Rank by
            <select
              aria-label="Rank creators by"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
            >
              {config.criteria.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        ) : (
          <div className="tabs" role="tablist">
            {config.criteria.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={c === metric}
                className={c === metric ? "active" : ""}
                onClick={() => setMetric(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        <div className="tabs" role="tablist">
          {["7D", "30D", "All time"].map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={p === period}
              className={p === period ? "active" : ""}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      {role === "Caller" && (
        <label className="caller-evidence-filter">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
          />{" "}
          Verified callers only{" "}
          <small>
            Published call + matching token purchase + demo-attested wallet
          </small>
        </label>
      )}
      <div className="stats-grid">
        <div className="panel stat">
          <small>X-linked {role.toLowerCase()}s</small>
          <h2>{list.length}</h2>
          <span>Wallet-only accounts can participate privately</span>
        </div>
        <div className="panel stat">
          <small>
            {role === "Creator"
              ? "All-time demo launches"
              : role === "Caller"
                ? "Calls in selected period"
                : "Trades in selected period"}
          </small>
          <h2>
            {list.reduce(
              (n, u) =>
                n +
                (role === "Creator"
                  ? u.launches
                  : role === "Caller"
                    ? userCalls(u).length
                    : trades.filter(
                        (t) => t.userId === u.id && within(t.timestamp),
                      ).length),
              0,
            )}
          </h2>
          <span>{period} activity records below</span>
        </div>
        <div className="panel stat">
          <small>
            {role === "Creator"
              ? "All-time graduation rate"
              : role === "Caller"
                ? "Calls reaching 2×"
                : "All-time average win rate"}
          </small>
          <h2>
            {Math.round(
              list.reduce(
                (n, u) =>
                  n +
                  (role === "Creator"
                    ? (u.graduated / u.launches) * 100
                    : role === "Caller"
                      ? success(u)
                      : u.winRate),
                0,
              ) / (list.length || 1),
            )}
            %
          </h2>
          <span>Fictional attributed outcomes</span>
        </div>
        <div className="panel stat">
          <small>Evidence coverage</small>
          <h2>Wins + losses</h2>
          <span>Fees and relationships distinguished</span>
        </div>
      </div>
      <div className="panel directory">
        <div className="panel-title">
          <h2>
            {role} leaderboard <span className="badge">Simulated</span>
          </h2>
          <label className="inline-search">
            <Search size={14} />
            <input
              aria-label={`Search ${role.toLowerCase()}s`}
              placeholder="Search people"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
        <div className="people-mobile-list">
          {list.map((u, i) => (
            <article className="people-mobile-person" key={u.id}>
              <div>
                <span className="people-rank">{i + 1}</span>
                {compactIdentity(u)}
                <button
                  className={
                    store.follows.includes(u.id)
                      ? "button followed"
                      : "button light"
                  }
                  onClick={() => store.toggle("follows", u.id)}
                >
                  {store.follows.includes(u.id) ? "Following" : "Follow"}
                </button>
              </div>
              <div className="people-person-metrics">
                {(role === "Creator"
                  ? [
                      [String(u.launches), "Launches"],
                      [
                        Math.round((u.graduated / u.launches) * 100) + "%",
                        "Graduated",
                      ],
                      [money(u.fees), "Demo fees"],
                    ]
                  : role === "Caller"
                    ? [
                        [String(userCalls(u).length), "Original calls"],
                        [Math.round(success(u)) + "%", "Reached 2×"],
                        [
                          String(
                            userCalls(u).filter((c) => c.outcome < 1).length,
                          ),
                          "Failed calls",
                        ],
                      ]
                    : [
                        [money(u.pnl), "Realised PnL"],
                        [u.winRate + "%", "Win rate"],
                        [money(tradingEvidence(u).volume), "Trading volume"],
                      ]
                ).map(([value, label]) => (
                  <span key={label}>
                    <b>{value}</b>
                    <small>{label}</small>
                  </span>
                ))}
              </div>
              {role === "Creator" && (
                <div className="creator-achievement-line">
                  $100K+: {creatorAchievements(u).above100k} · $500K+:{" "}
                  {creatorAchievements(u).above500k} · $1M+:{" "}
                  {creatorAchievements(u).above1m}
                  <br />
                  Peak {money(creatorAchievements(u).highest)} ·{" "}
                  {creatorAchievements(u).walletCount} demo-attested wallets
                </div>
              )}
              {role === "Trader" && (
                <div className="creator-achievement-line">
                  {tradingEvidence(u).closedPositions} closed positions ·{" "}
                  {tradingEvidence(u).walletCount} connected wallets
                </div>
              )}
              {role === "Caller" && !qualifiedCalls(u).length && (
                <p className="unqualified-caller">
                  Recorded calls · no verified token purchase; excluded from
                  verified ranks.
                </p>
              )}
              <Link to={`/profile/${u.id}`}>
                View full history <ArrowUpRight size={14} />
              </Link>
            </article>
          ))}
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>{role}</th>
                {role === "Creator" ? (
                  <>
                    <th>Launches / failures</th>
                    <th>Graduation rate</th>
                    <th>Unique buyers</th>
                    <th>Attributable fees</th>
                    <th>$100K / $500K / $1M+ · Peak</th>
                  </>
                ) : role === "Caller" ? (
                  <>
                    <th>Timestamped calls</th>
                    <th>Reached 2× / failed</th>
                    <th>Buy evidence</th>
                    <th>Trading PnL</th>
                    <th>Avg. to milestone</th>
                  </>
                ) : (
                  <>
                    <th>Realised PnL</th>
                    <th>Unrealised PnL</th>
                    <th>Win rate</th>
                    <th>Trading volume / closed</th>
                    <th>Recent trades</th>
                  </>
                )}
                <th />
              </tr>
            </thead>
            <tbody>
              {list.map((u, i) => (
                <tr key={u.id}>
                  <td className={i === 0 ? "gold" : ""}>{i + 1}</td>
                  <td>{compactIdentity(u)}</td>
                  {role === "Creator" ? (
                    <>
                      <td>
                        <b>{u.launches}</b>
                        <small className="negative">
                          {u.launches - u.graduated} not graduated
                        </small>
                      </td>
                      <td>
                        <span className="positive">
                          {Math.round((u.graduated / u.launches) * 100)}%
                        </span>
                        <div className="progress">
                          <span
                            style={{
                              width: `${(u.graduated / u.launches) * 100}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        {buyerCount(u).toLocaleString()}
                        <small>Demo deduplicated buyers</small>
                      </td>
                      <td>
                        {money(u.fees)}
                        <small>Attributed seed records</small>
                      </td>
                      <td>
                        {creatorAchievements(u).above100k} /{" "}
                        {creatorAchievements(u).above500k} /{" "}
                        {creatorAchievements(u).above1m}
                        <small>
                          {money(creatorAchievements(u).highest)} highest
                          observed
                        </small>
                      </td>
                    </>
                  ) : role === "Caller" ? (
                    <>
                      <td>
                        {userCalls(u).length}
                        <small>Original timestamps retained</small>
                      </td>
                      <td>
                        <span className="positive">
                          {userCalls(u).filter((c) => c.outcome >= 2).length}{" "}
                          reached 2×
                        </span>
                        <small className="negative">
                          {userCalls(u).filter((c) => c.outcome < 1).length}{" "}
                          below baseline
                        </small>
                      </td>
                      <td>
                        {buys(u).length} demo buys
                        <small>Fictional wallet attestations</small>
                      </td>
                      <td className={u.pnl >= 0 ? "positive" : "negative"}>
                        {money(u.pnl)}
                      </td>
                      <td>
                        6h 18m<small>Simulated mean</small>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className={u.pnl >= 0 ? "positive" : "negative"}>
                        {money(u.pnl)}
                      </td>
                      <td className={u.pnl >= 0 ? "positive" : "negative"}>
                        {money(u.pnl * 0.12)}
                      </td>
                      <td>
                        {u.winRate}%
                        <div className="progress">
                          <span style={{ width: `${u.winRate}%` }} />
                        </div>
                      </td>
                      <td>
                        {money(tradingEvidence(u).volume)}
                        <small>
                          {tradingEvidence(u).closedPositions} closed positions
                        </small>
                      </td>
                      <td>
                        {
                          trades.filter(
                            (t) => t.userId === u.id && within(t.timestamp),
                          ).length
                        }
                        <small>{period}</small>
                      </td>
                    </>
                  )}
                  <td>
                    <button
                      className={`button ${store.follows.includes(u.id) ? "followed" : "light"}`}
                      onClick={() => store.toggle("follows", u.id)}
                    >
                      {store.follows.includes(u.id) ? "Following" : "Follow"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!list.length && (
            <p className="empty">No people match your search.</p>
          )}
        </div>
        <p className="table-note">
          {role === "Creator"
            ? "Ranks use the selected direct achievement from fictional creator history, never an AI reputation score. “Not graduated” includes active launches and is not a count of failures. Selected period applies to launch records below."
            : role === "Caller"
              ? "Verified ranks require a published original call and a same-token buy from an attested wallet on the matching chain. Evidence is simulated; unqualified posts remain in all-call records."
              : "Direct all-time PnL, win rate and verified demo trade volume; selected period filters recent activity. No composite reputation score."}
        </p>
      </div>
      <section className="panel padded" style={{ marginTop: 20 }}>
        <div className="panel-title">
          <h2>
            <History size={15} /> {period}{" "}
            {role === "Creator"
              ? "launch outcomes"
              : role === "Caller"
                ? "original call records"
                : "trade activity"}
          </h2>
          <span className="badge">
            {role === "Caller"
              ? "Read-only baselines"
              : "Demonstration history"}
          </span>
        </div>
        {role === "Creator"
          ? launches
              .filter(
                (l) =>
                  within(l.timestamp) && list.some((u) => u.id === l.userId),
              )
              .map((l) => (
                <Link
                  className="history-row"
                  to={`/token/${l.tokenId}`}
                  key={l.id}
                >
                  <b>{tokens.find((t) => t.id === l.tokenId)?.ticker}</b>
                  <span>{users.find((u) => u.id === l.userId)?.name}</span>
                  <span
                    className={l.outcome === "Failed" ? "negative" : "positive"}
                  >
                    {l.outcome}
                  </span>
                  <small>{l.timestamp.slice(0, 10)}</small>
                </Link>
              ))
          : role === "Caller"
            ? calls
                .filter(
                  (c) =>
                    within(c.timestamp) && list.some((u) => u.id === c.userId),
                )
                .slice(0, 8)
                .map((c) => (
                  <Link
                    className="history-row"
                    to={`/profile/${c.userId}`}
                    key={c.id}
                  >
                    <b>{users.find((u) => u.id === c.userId)?.name}</b>
                    <span>
                      {tokens.find((t) => t.id === c.tokenId)?.ticker}
                    </span>
                    <small>
                      Baseline {money(c.baselineCap)} ·{" "}
                      {c.timestamp.slice(0, 10)}
                    </small>
                    <span className={c.outcome >= 1 ? "positive" : "negative"}>
                      {c.outcome.toFixed(1)}×
                    </span>
                  </Link>
                ))
            : trades
                .filter(
                  (t) =>
                    within(t.timestamp) && list.some((u) => u.id === t.userId),
                )
                .slice(0, 8)
                .map((t) => (
                  <Link
                    className="history-row"
                    to={`/profile/${t.userId}`}
                    key={t.id}
                  >
                    <b>{users.find((u) => u.id === t.userId)?.name}</b>
                    <span>
                      {tokens.find((x) => x.id === t.tokenId)?.ticker}
                    </span>
                    <span
                      className={t.side === "Buy" ? "positive" : "negative"}
                    >
                      {t.side}
                    </span>
                    <b>{money(t.amount)}</b>
                  </Link>
                ))}
      </section>
    </>
  );
}
