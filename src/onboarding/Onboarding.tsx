import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Wallet,
  Plus,
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Copy,
  ShieldCheck,
  LoaderCircle,
  History,
  Link2,
  RotateCcw,
  FileText,
} from "lucide-react";
import type { Chain } from "../models";
import { money } from "../data";
import { useWallet } from "../wallet-store";
import { useStore } from "../store";
import { useOnboarding } from "./store";
import { demoWalletAddress } from "./fixtures";
import {
  discoveryEligibility,
  summarizeHistory,
  type ConnectedWallet,
  type DemoMethod,
  type ImportedLaunch,
} from "./model";
import Modal from "../ui/Modal";
import "./onboarding.css";
type Phase =
  | "welcome"
  | "connect"
  | "connecting"
  | "verify"
  | "importing"
  | "found"
  | "new"
  | "creating"
  | "created"
  | "x";
const networks: Chain[] = ["Solana", "Base", "Ethereum", "BNB Chain"];
export function OnboardingFlow({ adding = false }: { adding?: boolean }) {
  const account = useOnboarding();
  const navigate = useNavigate();
  const saved = !adding ? account.wallets.at(-1) : undefined;
  const [wallet, setWallet] = useState<ConnectedWallet | null>(saved || null);
  const [phase, setPhase] = useState<Phase>(
    saved
      ? saved.origin === "new"
        ? "created"
        : saved.proof
          ? account.launches.some((l) => l.walletId === saved.id)
            ? "found"
            : "verify"
          : "connect"
      : "welcome",
  );
  const [method, setMethod] = useState<DemoMethod>("browser");
  const [chain, setChain] = useState<Chain>("Solana");
  const [progress, setProgress] = useState(0);
  const [records, setRecords] = useState(false);
  const [reset, setReset] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [linking, setLinking] = useState(false);
  const [nonce] = useState(() => crypto.randomUUID());
  const [issuedAt] = useState(() => new Date().toISOString());
  useEffect(() => {
    window.scrollTo(0, 0);
    const heading = document.querySelector<HTMLElement>(".onboarding-step h1");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
  }, [phase]);
  const challenge = wallet
    ? `Aladdin Social ownership verification\nOrigin: ${window.location.origin}\nWallet: ${wallet.address}\nNetwork: ${wallet.chain}\nNonce: ${nonce}\nIssued at: ${issuedAt}\n\nPurpose: attach historical public activity to this profile.\nThis demo does not request a real signature or authorise a transaction.`
    : "";
  useEffect(() => {
    if (phase !== "connecting" && phase !== "creating") return;
    const timer = window.setTimeout(() => {
      const index = useOnboarding.getState().wallets.length;
      const w: ConnectedWallet = {
        id: crypto.randomUUID(),
        label: `Wallet ${index + 1}`,
        address: demoWalletAddress(chain, index),
        chain,
        origin: phase === "creating" ? "new" : "existing",
        connection: phase === "creating" ? "created-demo" : method,
        proof:
          phase === "creating"
            ? {
                kind: "simulated",
                message:
                  "Simulated new wallet setup. No keypair was generated.",
                nonce: crypto.randomUUID(),
                acceptedAt: new Date().toISOString(),
              }
            : null,
        createdAt: new Date().toISOString(),
      };
      setWallet(w);
      if (phase === "creating") useOnboarding.getState().addWallet(w);
      setPhase(phase === "creating" ? "created" : "verify");
    }, 650);
    return () => clearTimeout(timer);
  }, [phase, chain, method]);
  useEffect(() => {
    if (phase !== "importing" || !wallet) return;
    let current = 0;
    const timer = window.setInterval(() => {
      current += 1;
      setProgress(current);
      if (current === 4) {
        clearInterval(timer);
        useOnboarding.getState().importHistory(wallet.id);
        setPhase("found");
      }
    }, 430);
    return () => clearInterval(timer);
  }, [phase, wallet]);
  useEffect(() => {
    if (!linking) return;
    const timer = window.setTimeout(() => {
      useOnboarding.getState().linkX();
      useStore.getState().setParticipation("social");
      setLinking(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [linking]);
  const launches = account.launches.filter((l) => l.walletId === wallet?.id);
  const trading = account.trades.filter((t) => t.walletId === wallet?.id);
  const stats = summarizeHistory(launches, trading);
  function finish() {
    if (!wallet) return;
    const before = useOnboarding.getState();
    if (!before.activeWalletId || before.wallets.length === 1) {
      useOnboarding.getState().setActive(wallet.id);
      useWallet
        .getState()
        .activateWallet(
          wallet.id,
          wallet.origin === "existing" && wallet.chain === "Solana",
        );
    }
    useOnboarding.getState().complete();
    useStore
      .getState()
      .setParticipation(
        useOnboarding.getState().xIdentity ? "social" : "wallet",
      );
    navigate(adding ? "/profile/wallets" : "/", { replace: true });
  }
  function resetAll() {
    useOnboarding.getState().reset();
    useWallet.getState().clearAccount();
    useStore.getState().setParticipation("wallet");
    setWallet(null);
    setPhase("welcome");
    setReset(false);
    setProgress(0);
  }
  function back() {
    setError("");
    if (phase === "connect" || phase === "new") setPhase("welcome");
    else if (phase === "verify") setPhase("connect");
    else if (phase === "x")
      setPhase(wallet?.origin === "new" ? "created" : "found");
    else if (adding) navigate("/profile/wallets");
    else setPhase("welcome");
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(wallet?.address || "");
      setCopied(true);
    } catch {
      setError(
        "Clipboard unavailable. Select and copy the displayed demo address.",
      );
    }
  }
  return (
    <div className="onboarding-app" key={phase}>
      <header className="onboarding-header">
        <Link to={account.completed ? "/profile" : "/"} aria-label="Aladdin">
          <span className="onboarding-mark">✦</span>
          <b>Aladdin</b>
        </Link>
        <span>Demo setup</span>
      </header>
      <main className="onboarding-main">
        <div className="onboarding-topline">
          {phase !== "welcome" &&
          !["connecting", "creating", "importing"].includes(phase) ? (
            <button className="icon-button" onClick={back} aria-label="Back">
              <ArrowLeft size={22} />
            </button>
          ) : (
            <span />
          )}
          <button className="quiet-button" onClick={() => setReset(true)}>
            <RotateCcw size={14} /> Reset demo
          </button>
        </div>
        <div className="onboarding-step" key={phase}>
          {phase === "welcome" ? (
            <>
              <div className="onboarding-symbol">
                <Wallet size={37} strokeWidth={1.3} />
              </div>
              <h1>
                Welcome to
                <br />
                Aladdin<span>.</span>
              </h1>
              <p className="onboarding-intro">
                Your on-chain history belongs to you. Bring it with you or start
                fresh.
              </p>
              <div className="onboarding-choices">
                <button onClick={() => setPhase("connect")}>
                  <span>
                    <History size={23} />
                  </span>
                  <span>
                    <b>Continue with existing wallet</b>
                    <small>Bring your activity and reputation</small>
                  </span>
                  <ArrowRight size={19} />
                </button>
                <button onClick={() => setPhase("new")}>
                  <span>
                    <Plus size={24} />
                  </span>
                  <span>
                    <b>Create new wallet</b>
                    <small>A fresh start, on your terms</small>
                  </span>
                  <ArrowRight size={19} />
                </button>
              </div>
              <div className="onboarding-fact">
                <ShieldCheck size={17} />
                <p>
                  Simulated connections. No private keys or recovery phrases are
                  generated, requested or stored.
                </p>
              </div>
              {adding && (
                <button
                  className="quiet-button"
                  onClick={() => navigate("/profile/wallets")}
                >
                  Return to connected wallets
                </button>
              )}
            </>
          ) : phase === "connect" ? (
            <>
              <div className="step-kicker">BRING YOUR HISTORY</div>
              <h1>
                Connect your
                <br />
                existing wallet.
              </h1>
              <p className="onboarding-intro">
                Choose how you would connect. This walkthrough uses a fictional
                wallet and never opens a real signing request.
              </p>
              <label className="onboarding-label">
                Network
                <select
                  value={chain}
                  onChange={(e) => setChain(e.target.value as Chain)}
                >
                  {networks.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <div
                className="connection-methods"
                role="radiogroup"
                aria-label="Wallet connection method"
              >
                {(
                  [
                    [
                      "browser",
                      "Browser wallet",
                      "Phantom or another compatible wallet",
                      Wallet,
                    ],
                    [
                      "walletconnect",
                      "WalletConnect",
                      "A mobile wallet connection preview",
                      Link2,
                    ],
                    [
                      "sdk-preview",
                      "Secure SDK import",
                      "Import preview · no SDK configured",
                      ShieldCheck,
                    ],
                  ] as const
                ).map(([id, title, description, Icon]) => (
                  <button
                    role="radio"
                    aria-checked={method === id}
                    className={method === id ? "selected" : ""}
                    key={id}
                    onClick={() => setMethod(id)}
                  >
                    <Icon size={22} />
                    <span>
                      <b>{title}</b>
                      <small>{description}</small>
                    </span>
                    {method === id && <Check size={18} />}
                  </button>
                ))}
              </div>
              {method === "sdk-preview" && (
                <div className="onboarding-fact">
                  <ShieldCheck size={17} />
                  <p>
                    No secure wallet SDK is configured. This option only
                    simulates importing public wallet metadata. Never paste a
                    private key or seed phrase here.
                  </p>
                </div>
              )}
              <button
                className="wallet-primary"
                onClick={() => setPhase("connecting")}
              >
                Connect demo wallet <ArrowRight size={18} />
              </button>
            </>
          ) : phase === "connecting" || phase === "creating" ? (
            <div className="onboarding-loading" role="status">
              <LoaderCircle size={39} className="onboarding-spinner" />
              <h1>
                {phase === "creating"
                  ? "Preparing your demo wallet"
                  : "Connecting demo wallet"}
              </h1>
              <p>
                {phase === "creating"
                  ? "Creating a public demo identifier, not a real keypair."
                  : "Simulating the connection. No wallet permission is requested."}
              </p>
            </div>
          ) : phase === "verify" ? (
            <>
              <div className="step-kicker">OWNERSHIP FIRST</div>
              <h1>
                Make your
                <br />
                history yours.
              </h1>
              <p className="onboarding-intro">
                A real connection would ask your wallet to sign a unique
                ownership message. Here you can inspect and simulate that step.
              </p>
              <WalletIdentity wallet={wallet!} />
              <details className="ownership-message" open>
                <summary>
                  Verification message <ChevronDown size={15} />
                </summary>
                <pre>{challenge}</pre>
              </details>
              <button
                className="wallet-primary"
                onClick={() => {
                  if (!wallet) return;
                  const proof = {
                    kind: "simulated" as const,
                    message: challenge,
                    nonce,
                    acceptedAt: new Date().toISOString(),
                  };
                  useOnboarding.getState().addWallet({ ...wallet, proof });
                  useOnboarding.getState().verify(wallet.id, proof);
                  setWallet({ ...wallet, proof });
                  setProgress(0);
                  setPhase("importing");
                }}
              >
                <ShieldCheck size={18} /> Simulate ownership signature
              </button>
              <p className="onboarding-caption">
                No cryptographic ownership claim is made. Verification remains
                demo-only.
              </p>
            </>
          ) : phase === "importing" ? (
            <div className="onboarding-loading">
              <div className="onboarding-orbit">
                <History size={34} />
                <LoaderCircle className="onboarding-spinner" size={64} />
              </div>
              <h1>
                Finding your
                <br />
                on-chain story.
              </h1>
              <p>Discovering fictional records attached to this demo wallet.</p>
              <ol className="import-progress">
                {[
                  "Find original wallet and token records",
                  "Read graduations and previous outcomes",
                  "Attribute historical creator fees",
                  "Prepare your reputation summary",
                ].map((label, i) => (
                  <li
                    key={label}
                    className={
                      i < progress ? "done" : i === progress ? "current" : ""
                    }
                  >
                    {i < progress ? (
                      <Check size={16} />
                    ) : i === progress ? (
                      <LoaderCircle size={16} className="onboarding-spinner" />
                    ) : (
                      <span className="progress-empty" />
                    )}
                    <span>{label}</span>
                  </li>
                ))}
              </ol>
              <div
                className="import-bar"
                role="progressbar"
                aria-label="Import demo history"
                aria-valuenow={progress * 25}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span style={{ width: `${progress * 25}%` }} />
              </div>
              <p className="onboarding-caption">
                No chain scan, paid provider or production database is accessed.
              </p>
            </div>
          ) : phase === "found" ? (
            <>
              <div className="onboarding-success-icon">
                <CheckCircle2 size={35} />
              </div>
              <div className="step-kicker">HISTORY, NOT A RESET</div>
              <h1>
                Your history
                <br />
                has been found.
              </h1>
              <p className="onboarding-intro">
                Fictional demonstration data. Original wallet, token addresses
                and timestamps stay attached to every record.
              </p>
              <HistoryTotals launches={launches} trades={trading} />
              <button
                className="wallet-secondary"
                onClick={() => setRecords(true)}
              >
                <FileText size={17} /> Inspect {stats.launches} imported records{" "}
                <ChevronRight size={16} />
              </button>
              <div className="onboarding-fact">
                <History size={17} />
                <p>
                  Historical earnings are not a current wallet balance. These
                  records do not add spendable funds.
                </p>
              </div>
              <button
                className="wallet-primary"
                onClick={() => (adding ? finish() : setPhase("x"))}
              >
                {adding ? "Add wallet to profile" : "Continue"}{" "}
                <ArrowRight size={18} />
              </button>
            </>
          ) : phase === "new" ? (
            <>
              <div className="onboarding-symbol">
                <Plus size={34} />
              </div>
              <div className="step-kicker">START FRESH</div>
              <h1>
                A new beginning.
                <br />
                Your own history.
              </h1>
              <p className="onboarding-intro">
                Create a simulated wallet with an empty balance and no previous
                activity.
              </p>
              <label className="onboarding-label">
                Network
                <select
                  value={chain}
                  onChange={(e) => setChain(e.target.value as Chain)}
                >
                  {networks.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <div className="new-wallet-steps">
                <span>
                  <Check size={17} /> Public demo address
                </span>
                <span>
                  <Check size={17} /> Empty historical profile
                </span>
                <span>
                  <ShieldCheck size={17} /> No keys or seed phrase
                </span>
              </div>
              <button
                className="wallet-primary"
                onClick={() => setPhase("creating")}
              >
                Create demo wallet <Plus size={18} />
              </button>
            </>
          ) : phase === "created" ? (
            <>
              <div className="onboarding-success-icon">
                <CheckCircle2 size={36} />
              </div>
              <div className="step-kicker">A FRESH START</div>
              <h1>
                Your demo wallet
                <br />
                is ready.
              </h1>
              <p className="onboarding-intro">
                No real keypair was created. This public identifier is only for
                the walkthrough; do not send funds to it.
              </p>
              <WalletIdentity wallet={wallet!} />
              <button className="wallet-secondary" onClick={copy}>
                {copied ? <Check size={17} /> : <Copy size={17} />}{" "}
                {copied ? "Demo address copied" : "Copy demo address"}
              </button>
              <div className="empty-history">
                <History size={24} />
                <span>
                  <b>Your history starts here.</b>
                  <small>0 launches · 0 trades · 0 creator fees</small>
                </span>
              </div>
              <button
                className="wallet-primary"
                onClick={() => (adding ? finish() : setPhase("x"))}
              >
                {adding ? "Add wallet to profile" : "Continue"}{" "}
                <ArrowRight size={18} />
              </button>
            </>
          ) : (
            <>
              <div className="onboarding-symbol x-symbol">𝕏</div>
              <div className="step-kicker">OPTIONAL · YOUR SOCIAL IDENTITY</div>
              <h1>
                Put a person
                <br />
                behind the history.
              </h1>
              <p className="onboarding-intro">
                Connect your X identity to make your verified on-chain history
                discoverable.
              </p>
              <XIdentityCard />
              <div className="identity-eligibility">
                <ShieldCheck size={18} />
                <div>
                  <b>
                    {account.xIdentity
                      ? "Demo discovery preview enabled"
                      : "Wallet-only access is always available"}
                  </b>
                  <p>
                    {account.xIdentity
                      ? "Your simulated X identity is attached to your connected wallets. Real public leaderboard access still requires authenticated X OAuth and a real wallet signature."
                      : "You can use your wallet without X. An authenticated X identity is required for actual public reputation leaderboards."}
                  </p>
                </div>
              </div>
              {!account.xIdentity ? (
                <button
                  className="wallet-primary"
                  disabled={linking}
                  onClick={() => setLinking(true)}
                >
                  {linking ? (
                    <LoaderCircle size={18} className="onboarding-spinner" />
                  ) : (
                    <span>𝕏</span>
                  )}{" "}
                  {linking ? "Linking demo identity…" : "Simulate X connection"}
                </button>
              ) : (
                <button className="wallet-primary" onClick={finish}>
                  Continue to wallet <ArrowRight size={18} />
                </button>
              )}
              {!account.xIdentity && (
                <button
                  className="quiet-button onboarding-skip"
                  disabled={linking}
                  onClick={finish}
                >
                  Skip for now <ArrowRight size={15} />
                </button>
              )}
              <p className="onboarding-caption">
                Demo linking is not X OAuth authentication.
              </p>
            </>
          )}
          {error && (
            <p className="negative" role="alert">
              {error}
            </p>
          )}
        </div>
      </main>
      <footer className="onboarding-footer">
        <span>Aladdin Social</span>
        <span>Start fresh or bring your history.</span>
      </footer>
      {records && (
        <Modal title="Imported demo records" close={() => setRecords(false)}>
          <ImportedRecordList records={launches} wallets={account.wallets} />
        </Modal>
      )}
      {reset && (
        <ResetOnboarding close={() => setReset(false)} onReset={resetAll} />
      )}
    </div>
  );
}
export function WalletIdentity({ wallet }: { wallet: ConnectedWallet }) {
  return (
    <div className="setup-wallet-identity">
      <span>
        <Wallet size={21} />
      </span>
      <div>
        <b>
          {wallet.label}
          <small>
            {wallet.chain} ·{" "}
            {wallet.origin === "new"
              ? "Created in demo"
              : "Existing demo wallet"}{" "}
            · {wallet.proof ? "Demo proof" : "Not verified"}
          </small>
        </b>
        <code>{wallet.address}</code>
      </div>
    </div>
  );
}
export function XIdentityCard() {
  const a = useOnboarding();
  return (
    <div className="x-identity-card">
      <div>
        <span className="x-avatar">AR</span>
        <span>
          <b>Alex River</b>
          <small>@alexriver_demo</small>
        </span>
        <span className="x-demo-state">
          {a.xIdentity ? (
            <>
              <Check size={13} /> Linked in demo
            </>
          ) : (
            "Demo preview"
          )}
        </span>
      </div>
      <dl>
        <div>
          <dt>Connected wallets</dt>
          <dd>{a.wallets.length}</dd>
        </div>
        <div>
          <dt>X authentication</dt>
          <dd>Not authenticated</dd>
        </div>
        <div>
          <dt>Discovery eligibility</dt>
          <dd>
            {discoveryEligibility(a.wallets, a.xIdentity).demoEligible
              ? "Demo preview only"
              : "Not linked yet"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
export function HistoryTotals({
  launches,
  trades,
}: {
  launches: ReturnType<typeof useOnboarding.getState>["launches"];
  trades: ReturnType<typeof useOnboarding.getState>["trades"];
}) {
  const s = summarizeHistory(launches, trades);
  return (
    <div className="inherited-totals">
      <div>
        <b>{s.launches}</b>
        <span>Tokens launched</span>
      </div>
      <div>
        <b>{s.graduated}</b>
        <span>Graduated</span>
      </div>
      <div>
        <b>
          {Object.entries(s.fees)
            .map(
              ([asset, value]) =>
                `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${asset}`,
            )
            .join(" + ") || "0"}
        </b>
        <span>Creator fees · demo</span>
      </div>
      <div>
        <b>{s.above1m}</b>
        <span>Reached $1M+</span>
      </div>
    </div>
  );
}
export function ImportedRecordList({
  records,
  wallets,
}: {
  records: ImportedLaunch[];
  wallets: ConnectedWallet[];
}) {
  const [filter, setFilter] = useState("All");
  return (
    <div className="imported-record-list">
      <p className="onboarding-caption">
        Fictional demonstration records. Original observations are read-only.
      </p>
      <div className="wallet-segment" role="tablist">
        {["All", "Graduated", "Active", "Failed"].map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
      {records
        .filter((r) => filter === "All" || r.outcome === filter)
        .map((r) => (
          <details key={r.id} className="imported-record">
            <summary>
              <span>
                <b>{r.ticker}</b>
                <small>
                  {new Date(r.launchedAt).toLocaleDateString("en-GB")} ·{" "}
                  {wallets.find((w) => w.id === r.walletId)?.label}
                </small>
              </span>
              <span
                className={r.outcome === "Failed" ? "negative" : "positive"}
              >
                {r.outcome}
              </span>
              <ChevronDown size={15} />
            </summary>
            <dl>
              <div>
                <dt>Highest observed cap</dt>
                <dd>{money(r.highestObservedCap)}</dd>
              </div>
              <div>
                <dt>Creator fees</dt>
                <dd>
                  {r.creatorFees} {r.feeAsset}
                </dd>
              </div>
              <div>
                <dt>Chain</dt>
                <dd>{r.chain}</dd>
              </div>
              <div>
                <dt>Original launch</dt>
                <dd>{r.launchedAt}</dd>
              </div>
              <div>
                <dt>Observation time</dt>
                <dd>{r.observationAt}</dd>
              </div>
            </dl>
            <small>Original token contract</small>
            <code>{r.tokenAddress}</code>
            <small>Original wallet</small>
            <code>{wallets.find((w) => w.id === r.walletId)?.address}</code>
            <p>
              Source: fictional demo index. This is not an on-chain
              verification.
            </p>
          </details>
        ))}
      {!records.length && (
        <div className="wallet-empty">
          <History size={26} />
          <p>No historical launches. New wallets begin with an empty record.</p>
        </div>
      )}
    </div>
  );
}
export function ResetOnboarding({
  close,
  onReset,
}: {
  close: () => void;
  onReset?: () => void;
}) {
  const navigate = useNavigate();
  function reset() {
    useOnboarding.getState().reset();
    useWallet.getState().clearAccount();
    useStore.getState().setParticipation("wallet");
    onReset?.();
    close();
    navigate("/", { replace: true });
  }
  return (
    <Modal title="Reset onboarding demonstration?" close={close}>
      <p>
        This clears the demo identity, connected wallets, imported history and
        simulated wallet balances in this browser. Existing social posts,
        follows and alert preferences are preserved. No real account or funds
        are affected.
      </p>
      <button className="wallet-primary" onClick={reset}>
        Reset onboarding demo
      </button>
      <button className="wallet-secondary" onClick={close}>
        Keep my setup
      </button>
    </Modal>
  );
}
export function WalletManager({ close }: { close?: () => void }) {
  const a = useOnboarding();
  const navigate = useNavigate();
  return (
    <div className="wallet-manager">
      <p className="onboarding-caption">
        Connected public demo identifiers. No private keys or live wallet
        sessions.
      </p>
      {a.wallets.map((w) => (
        <div className="managed-wallet" key={w.id}>
          <button
            aria-pressed={a.activeWalletId === w.id}
            onClick={() => {
              a.setActive(w.id);
              useWallet.getState().activateWallet(w.id);
              close?.();
            }}
          >
            <WalletIdentity wallet={w} />
            {a.activeWalletId === w.id ? (
              <Check size={18} />
            ) : (
              <ChevronRight size={18} />
            )}
          </button>
          <Link to={`/profile/history?wallet=${w.id}`}>
            Inspect wallet history <ArrowUpRight size={13} />
          </Link>
        </div>
      ))}
      {!a.wallets.length && (
        <p className="wallet-empty">
          No wallet linked to this demo profile yet.
        </p>
      )}
      <button
        className="wallet-primary"
        onClick={() => {
          close?.();
          navigate("/onboarding/add");
        }}
      >
        <Plus size={18} /> Link another wallet
      </button>
      <Link className="wallet-secondary" to="/profile/history" onClick={close}>
        <History size={17} /> Aggregated history
      </Link>
    </div>
  );
}
export function WalletManagementPage() {
  return (
    <div className="wallet-page">
      <Link className="back" to="/profile">
        <ArrowLeft size={16} /> Profile
      </Link>
      <div className="wallet-page-title">
        <h1>Connected wallets</h1>
        <span className="simulation-pill">Demo</span>
      </div>
      <WalletManager />
    </div>
  );
}
