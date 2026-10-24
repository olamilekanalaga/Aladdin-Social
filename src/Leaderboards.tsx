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
import { useStore } from "./store";
import type { Role, User } from "./models";
const copy = {
  Creator: {
    title: "Creators",
    sub: "Launch outcomes, graduation rate and attributable fees.",
    criteria: ["Graduation rate", "Unique buyers", "Sustained outcomes"],
    icon: Users,
  },
  Trader: {
    title: "Traders",
    sub: "Realised PnL, win rate and trading consistency.",
    criteria: ["Realised PnL", "Win rate", "Consistency"],
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
  const Icon = config.icon;
  const days = period === "7D" ? 7 : period === "30D" ? 30 : Infinity;
  const within = (timestamp: string) =>
    Date.parse(timestamp) >=
    Date.parse("2026-10-24T23:59:59Z") - days * 86400000;
  const buys = (u: User) =>
    trades.filter((t) => t.userId === u.id && t.side === "Buy");
  const userCalls = (u: User) =>
    calls.filter((c) => c.userId === u.id && within(c.timestamp));
  const success = (u: User) => {
    const c = userCalls(u);
    return c.length
      ? (c.filter((c) => c.outcome >= 2).length / c.length) * 100
      : 0;
  };
  const consistency = (u: User) =>
    Math.round(u.winRate * 0.7 + Math.min(100, Math.abs(u.pnl) / 5000) * 0.3);
  const buyerCount = (u: User) => u.launches * 280 + u.graduated * 120;
  const score = (u: User) =>
    role === "Creator"
      ? metric === "Unique buyers"
        ? buyerCount(u)
        : metric === "Sustained outcomes"
          ? Math.round((u.graduated / u.launches) * 100) * 0.7 + u.winRate * 0.3
          : u.graduated / u.launches
      : role === "Trader"
        ? metric === "Win rate"
          ? u.winRate
          : metric === "Consistency"
            ? consistency(u)
            : u.pnl
        : metric === "Verified buys"
          ? buys(u).length
          : metric === "Trading performance"
            ? u.pnl
            : success(u);
  const list = users
    .filter(
      (u) =>
        u.roles.includes(role) &&
        `${u.name} ${u.social.username}`.includes(search.toLowerCase()),
    )
    .sort((a, b) => score(b) - score(a));
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
                        [consistency(u) + "/100", "Consistency"],
                      ]
                ).map(([value, label]) => (
                  <span key={label}>
                    <b>{value}</b>
                    <small>{label}</small>
                  </span>
                ))}
              </div>
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
                    <th>30d retention</th>
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
                    <th>Consistency</th>
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
                        {u.winRate - 12}%<small>Demo retention measure</small>
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
                        {consistency(u)}/100<small>Demo composite</small>
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
            ? "Ranks use all-time fictional creator history. “Not graduated” includes active launches and is not a count of failures. Selected period applies to launch records below."
            : role === "Caller"
              ? "Ranking success uses original call baselines for the selected period. Buying evidence and trading results are separate demo metrics."
              : "All-time PnL, win rate and consistency ranks; selected period filters recent activity. Consistency demo composite = 70% win rate + 30% capped PnL magnitude."}
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
