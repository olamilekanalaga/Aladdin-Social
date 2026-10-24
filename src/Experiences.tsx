import { LaunchJourneyDemo } from "./onboarding/LaunchJourney";
import { useWallet, walletTotal, formatUSD } from "./wallet-store";
import { londonLocalToISO } from "./time";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ArrowUpRight,
  ArrowRight,
  LockKeyhole,
  Users,
  Check,
  CalendarDays,
  Bell,
  FlaskConical,
  Wallet,
  Download,
} from "lucide-react";
import { api, ensureSession, type DemoSession } from "./api";
import { users, money, tokens } from "./data";
import { useStore } from "./store";
function useSession() {
  const [session, setSession] = useState<DemoSession | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    ensureSession()
      .then(setSession)
      .catch(() =>
        setError(
          "Demo API unavailable. Start npm run api to use permission-gated features.",
        ),
      );
  }, []);
  return { session, setSession, error, setError };
}
export function Opportunities() {
  const { session, setSession, error, setError } = useSession();
  const [creator, setCreator] = useState("u1");
  const [brief, setBrief] = useState("");
  const [budget, setBudget] = useState("Exploring options");
  const [status, setStatus] = useState("");
  const [requests, setRequests] = useState<
    { id: string; status: string; creatorId: string }[]
  >([]);
  const [available, setAvailable] = useState(true);
  const [chain, setChain] = useState("All chains");
  useEffect(() => {
    if (session)
      api<typeof requests>("/introductions")
        .then(setRequests)
        .catch(() => {});
  }, [session]);
  const eligible = users.filter(
    (u) =>
      u.roles.includes("Creator") &&
      (!available || ["u1", "u2"].includes(u.id)) &&
      (chain === "All chains" ||
        tokens.some((t) => t.creatorId === u.id && t.chain === chain)),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">REPUTATION → OPPORTUNITY</div>
          <h1>
            Build with people who’ve built before<span className="gold">.</span>
          </h1>
          <p>
            Discover experience. Examine the whole record. Start a conversation.
          </p>
        </div>
        <span className="badge">Hire · Demo</span>
      </div>
      <div className="talent-hero">
        <div>
          <div className="eyebrow">THE NEXT IDEA NEEDS THE RIGHT PEOPLE</div>
          <h1>
            Proven experience.
            <br />
            New possibilities.
          </h1>
          <p>
            A public track record is a starting point for working together.
            Explore creators, compare successes and failures, then request an
            introduction from those open to opportunities.
          </p>
          <div className="tags">
            <span className="badge">Public performance</span>
            <span className="badge">Opt-in introductions</span>
            <span className="badge">Creator consent first</span>
          </div>
        </div>
        <div className="talent-seal">
          <Users size={44} strokeWidth={1} />
        </div>
      </div>
      <div className="toolbar">
        <div className="talent-options">
          <label>
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
            />{" "}
            Open to opportunities
          </label>
        </div>
        <select
          aria-label="Talent chain"
          value={chain}
          onChange={(e) => setChain(e.target.value)}
        >
          {["All chains", "Solana", "Base", "Ethereum", "BNB Chain"].map(
            (c) => (
              <option key={c}>{c}</option>
            ),
          )}
        </select>
      </div>
      <div className="talent-grid">
        {eligible.map((u) => (
          <section className="panel talent-card" key={u.id}>
            <div className="talent-card-head">
              <span className="talent-anon">{u.avatar}</span>
              <span className="badge">
                {["u1", "u2"].includes(u.id)
                  ? "Open to opportunities"
                  : "Not accepting introductions"}
              </span>
            </div>
            <Link to={`/profile/${u.id}`}>
              <h2>
                {u.name} <ShieldCheck size={15} className="gold" />
              </h2>
            </Link>
            <small>@{u.social.username} · Public creator profile</small>
            <p>
              Token launch experience, community development and an inspectable
              history. Outcomes include unsuccessful launches.
            </p>
            <div className="talent-metrics">
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
              <ShieldCheck size={13} /> Review full history{" "}
              <ArrowUpRight size={13} />
            </Link>
            {["u1", "u2"].includes(u.id) && (
              <button
                className="button light"
                style={{ marginTop: 14 }}
                onClick={() => {
                  setCreator(u.id);
                  document
                    .getElementById("intro-form")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              >
                Request introduction <ArrowRight size={13} />
              </button>
            )}
            <p className="privacy">
              No private contact details are delivered to the browser. Creator
              approval and any actual outreach require a future backend
              workflow.
            </p>
          </section>
        ))}
      </div>
      {!eligible.length && (
        <div className="panel empty">
          No opted-in creators match this chain.
        </div>
      )}
      <section id="intro-form" className="panel padded talent-requests">
        <div className="panel-title">
          <h2>Start with a clear brief</h2>
          <span className="badge">Feature: hiring.introduction</span>
        </div>
        <p className="muted">
          A simulated request helps test whether a qualified introduction is
          valuable. No charge and no message sent.
        </p>
        {error && (
          <p role="alert" className="negative">
            {error}
          </p>
        )}
        <form
          className="composer"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!session) return;
            setError("");
            try {
              const r = await api<{ id: string; status: string }>(
                "/introductions",
                { creatorId: creator, brief, budget },
                session.csrf,
              );
              setStatus(r.status);
              setRequests(await api("/introductions"));
              setBrief("");
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          <div className="form-row">
            <label>
              Creator
              <select
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
              >
                <option value="u1">launchking</option>
                <option value="u2">marcellus</option>
              </select>
            </label>
            <label>
              Indicative budget
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              >
                {[
                  "Exploring options",
                  "Under $5,000",
                  "$5,000–$20,000",
                  "$20,000+",
                ].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            What do you want to build?
            <textarea
              minLength={20}
              maxLength={2000}
              required
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="Describe the project, the experience you need, and the expected scope."
            />
          </label>
          {!session?.features.includes("hiring.introduction") ? (
            <button
              type="button"
              className="button"
              disabled={!session}
              onClick={async () => {
                try {
                  setSession(
                    await api(
                      "/demo/access",
                      { plan: "opportunities" },
                      session?.csrf,
                    ),
                  );
                  setStatus(
                    "Demo introduction permission enabled. No payment taken.",
                  );
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              <LockKeyhole size={14} /> Simulate introduction access
            </button>
          ) : (
            <button type="submit" className="button light">
              Record demo introduction request <ArrowUpRight size={14} />
            </button>
          )}
          <p role="status" className="muted">
            {status}
          </p>
        </form>
        {requests.map((r) => (
          <div className="history-row" key={r.id}>
            <Check size={15} className="positive" />
            <b>{users.find((u) => u.id === r.creatorId)?.name}</b>
            <small>{r.status}</small>
          </div>
        ))}
      </section>
    </>
  );
}
export function IntelligenceAccess({ userId }: { userId?: string }) {
  const { session, setSession, error, setError } = useSession();
  const [record, setRecord] = useState<{
    relationship: string;
    methodology: string;
  } | null>(null);
  const [status, setStatus] = useState("");
  return (
    <section className="panel padded">
      <div className="panel-title">
        <h2>
          <ShieldCheck size={16} className="gold" /> Advanced intelligence
        </h2>
        <span className="badge">API permissions</span>
      </div>
      <p className="muted">
        Public performance stays visible. Advanced relationship evidence and
        exports require a feature-authorised session. These entitlements are
        simulated.
      </p>
      <div className="tags">
        <span className="badge">wallet.relationships</span>
        <span className="badge">intelligence.export</span>
        <span className="badge">creator.identity</span>
      </div>
      {error && (
        <p role="alert" className="negative">
          {error}
        </p>
      )}
      <div className="toolbar" style={{ marginTop: 20 }}>
        <button
          className="button"
          disabled={!session}
          onClick={async () => {
            setError("");
            try {
              const next = await api<DemoSession>(
                "/demo/access",
                {
                  plan:
                    session?.plan === "intelligence" ? "basic" : "intelligence",
                },
                session?.csrf,
              );
              setSession(next);
              setRecord(null);
              setStatus(
                next.plan === "basic"
                  ? "Advanced access removed."
                  : "Demo intelligence access enabled. No payment taken.",
              );
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          <LockKeyhole size={13} />
          {session?.plan === "intelligence"
            ? "Return to public access"
            : "Simulate intelligence access"}
        </button>
        <button
          className="button"
          onClick={async () => {
            setError("");
            try {
              setRecord(await api(`/creators/${userId || "u1"}/intelligence`));
              setStatus("Authorised demonstration evidence loaded.");
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          Load gated evidence
        </button>
        <button
          className="button"
          onClick={async () => {
            setError("");
            try {
              const data = await api("/intelligence/export");
              const url = URL.createObjectURL(
                new Blob([JSON.stringify(data, null, 2)], {
                  type: "application/json",
                }),
              );
              const a = document.createElement("a");
              a.href = url;
              a.download = "aladdin-demo-intelligence.json";
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
              setStatus("Demonstration export downloaded.");
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          <Download size={13} /> Export
        </button>
      </div>
      {record && (
        <div className="evidence-note">
          <ShieldCheck size={17} />
          <p>
            {record.relationship}
            <br />
            {record.methodology}
            <br />
            Fictional seed evidence; no live ownership verification.
          </p>
        </div>
      )}
      <p role="status" className="micro">
        {status}
      </p>
    </section>
  );
}
interface Announcement {
  id: string;
  userId: string;
  title: string;
  scheduledAt: string;
  tokenId: string;
  reminder: boolean;
  status: "Scheduled" | "Confirmed";
}
export function LaunchExperience() {
  const s = useStore();
  const [items, setItems] = useState<Announcement[]>(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("aladdin-announcements") || "null") || [
          {
            id: "a1",
            userId: "u1",
            title:
              "I’m launching a new token on Monday at 5 PM. Turn on Aladdin notifications.",
            scheduledAt: "2026-10-26T17:00:00Z",
            tokenId: "t1",
            reminder: false,
            status: "Scheduled",
          },
        ]
      );
    } catch {
      return [];
    }
  });
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("2026-10-26T17:00");
  const [tokenId, setTokenId] = useState("t1");
  const [message, setMessage] = useState("");
  function save(next: Announcement[]) {
    setItems(next);
    localStorage.setItem("aladdin-announcements", JSON.stringify(next));
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">FOLLOW THE NEXT CHAPTER</div>
          <h1>
            Launch announcements<span className="gold">.</span>
          </h1>
          <p>
            Follow a creator’s future activity, with their history always in
            view.
          </p>
        </div>
        <span className="badge">No token deployment</span>
      </div>
      <LaunchJourneyDemo />
      <div className="notification-layout">
        <section>
          <div className="panel padded">
            <h2>On the horizon</h2>
            <p className="muted">
              Schedules express creator intent, not a confirmed onchain event.
              All times are London time.
            </p>
            {items.map((a) => (
              <article className="call-record" key={a.id}>
                <div className="row-between">
                  <Link to={`/profile/${a.userId}`}>
                    <b>@{users.find((u) => u.id === a.userId)?.name}</b>
                  </Link>
                  <span className="badge">{a.status}</span>
                </div>
                <h2 style={{ marginTop: 15 }}>{a.title}</h2>
                <p>
                  <CalendarDays size={14} />{" "}
                  {new Date(a.scheduledAt).toLocaleString("en-GB", {
                    timeZone: "Europe/London",
                  })}{" "}
                  · London
                </p>
                <div className="toolbar">
                  <button
                    className="button"
                    aria-pressed={a.reminder}
                    onClick={() =>
                      save(
                        items.map((v) =>
                          v.id === a.id ? { ...v, reminder: !v.reminder } : v,
                        ),
                      )
                    }
                  >
                    <Bell size={13} />
                    {a.reminder ? "Reminder enabled" : "Remind me"}
                  </button>
                  <button
                    className="button"
                    onClick={() => {
                      const before = useStore.getState().notifications.length;
                      if (a.reminder)
                        s.simulate(
                          a.userId,
                          a.tokenId,
                          "Announcement reminder",
                        );
                      setMessage(
                        useStore.getState().notifications.length > before
                          ? "Simulated reminder delivered."
                          : "Enable reminder, follow this creator, and enable Announcement reminder in profile alerts.",
                      );
                    }}
                  >
                    Simulate reminder
                  </button>
                  <button
                    className="button"
                    onClick={() => {
                      save(
                        items.map((v) =>
                          v.id === a.id ? { ...v, status: "Confirmed" } : v,
                        ),
                      );
                      s.simulate(a.userId, a.tokenId, "Launch");
                      setMessage(
                        "Demo launch confirmed. A Launch notification is delivered only when the creator is followed and Launch alerts are enabled. No actual token was created.",
                      );
                    }}
                  >
                    <FlaskConical size={13} /> Simulate confirmed launch
                  </button>
                </div>
                <Link className="history-link" to={`/profile/${a.userId}`}>
                  Inspect creator history <ArrowUpRight size={13} />
                </Link>
              </article>
            ))}
            {!items.length && <p className="empty">No announcements yet.</p>}
            <p role="status" className="muted">
              {message}
            </p>
          </div>
        </section>
        <section className="panel padded">
          <h2>Announce a future launch</h2>
          <p className="muted">
            Posting as launchking, a local demo creator. This does not create or
            distribute a token.
          </p>
          <form
            className="composer"
            onSubmit={(e) => {
              e.preventDefault();
              let scheduledAt: string;
              try {
                scheduledAt = londonLocalToISO(date);
              } catch (error) {
                setMessage((error as Error).message);
                return;
              }
              if (Date.parse(scheduledAt) <= Date.now()) {
                setMessage(
                  "Choose a future London time for a new announcement.",
                );
                return;
              }
              save([
                {
                  id: crypto.randomUUID(),
                  userId: "u1",
                  title: title.trim(),
                  scheduledAt,
                  tokenId,
                  reminder: false,
                  status: "Scheduled",
                },
                ...items,
              ]);
              s.simulate("u1", tokenId, "Announcement");
              setTitle("");
              setMessage(
                "Demo announcement saved. Eligible followers receive a simulated announcement notification.",
              );
            }}
          >
            <label>
              Announcement
              <input
                required
                maxLength={160}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What are you building next?"
              />
            </label>
            <label>
              Scheduled time (London)
              <input
                required
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label>
              Related demonstration token
              <select
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
              >
                {tokens
                  .filter((t) => t.creatorId === "u1")
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.ticker}
                    </option>
                  ))}
              </select>
            </label>
            <button className="button light" type="submit">
              Publish announcement <ArrowUpRight size={13} />
            </button>
          </form>
          <div className="evidence-note">
            <CalendarDays size={17} />
            <p>
              Reminders are manually simulated here. Delivery with the browser
              closed requires server scheduling and notification integrations.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
export function Terminal() {
  const balances = useWallet((s) => s.balances);
  const [chain, setChain] = useState("All chains");
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">RESEARCH BEFORE EXECUTION</div>
          <h1>
            Terminal<span className="gold">.</span>
          </h1>
          <p>Token context and people’s records, connected in one workspace.</p>
        </div>
        <span className="badge">Execution disabled</span>
      </div>
      <div className="toolbar">
        <select
          aria-label="Terminal chain"
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
        <Link className="button" to="/portfolio">
          <Wallet size={14} /> Unified demo balance:{" "}
          {formatUSD(walletTotal(balances))}
        </Link>
      </div>
      <div className="narrative-grid">
        {tokens
          .filter((t) => chain === "All chains" || t.chain === chain)
          .map((t) => (
            <Link className="panel padded" key={t.id} to={`/token/${t.id}`}>
              <span className="eyebrow">{t.chain} · SIMULATED</span>
              <h2>
                {t.icon} {t.ticker} <ArrowUpRight size={14} />
              </h2>
              <p className="muted">
                {money(t.cap)} market cap · {t.change > 0 ? "+" : ""}
                {t.change}%
              </p>
              <span className="history-link">
                Creator: @{users.find((u) => u.id === t.creatorId)?.name}{" "}
                <ArrowRight size={12} />
              </span>
            </Link>
          ))}
      </div>
      <div className="evidence-note">
        <Wallet size={17} />
        <p>
          Future execution adapters can support multichain trading with
          disclosed fees. This prototype does not connect wallets, route orders,
          bridge funds or provide custody.
        </p>
      </div>
    </>
  );
}
export function AccountAccess() {
  const { session, setSession, error, setError } = useSession();
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>
            Your account<span className="gold">.</span>
          </h1>
          <p>One identity network. Several ways to participate.</p>
        </div>
        <span className="badge">Local demonstration</span>
      </div>
      <div className="panel padded">
        <h2>Participation mode</h2>
        <p className="muted">
          Social accounts can appear on X-linked leaderboards. Wallet-only
          participants can research, follow people and hold activity records
          without appearing as verified social accounts.
        </p>
        <div className="toolbar">
          {(["social", "wallet"] as const).map((identity) => (
            <button
              key={identity}
              className={`button ${session?.identity === identity ? "light" : ""}`}
              onClick={async () => {
                try {
                  setSession(await api("/session", { identity }));
                  useStore.getState().setParticipation(identity);
                  setError("");
                } catch {
                  setError("Demo API unavailable. Run npm run api.");
                }
              }}
            >
              {identity === "social" ? (
                <Users size={15} />
              ) : (
                <Wallet size={15} />
              )}{" "}
              {identity === "social"
                ? "Social-linked demo"
                : "Wallet-only demo"}
            </button>
          ))}
        </div>
        <p className="micro">
          Current session: {session?.identity || "Connecting…"} · Feature set:{" "}
          {session?.plan || "basic"}
        </p>
        <div className="evidence-note">
          <ShieldCheck size={17} />
          <p>
            These modes demonstrate account permissions, not real X OAuth or
            wallet ownership. Sessions use HTTP-only cookies. New device logins
            are normal; key export and custody are not implemented.
          </p>
        </div>
        {error && (
          <p role="alert" className="negative">
            {error}
          </p>
        )}
      </div>
      <div style={{ marginTop: 20 }}>
        <IntelligenceAccess />
      </div>
      <div className="economic-modules">
        {[
          ["Hiring", "Simulated access to qualified introductions."],
          ["Trading", "Future disclosed execution fees."],
          [
            "Creator access",
            "Future research subscriptions and configurable alerts.",
          ],
          ["Intelligence API", "Feature-authorised evidence and exports."],
        ].map(([name, text]) => (
          <div key={name}>
            <b>{name}</b>
            <p>{text} Revenue hypothesis; no payment collection.</p>
          </div>
        ))}
      </div>
    </>
  );
}
