import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Plus, CheckCircle2 } from "lucide-react";
import { useMVP } from "./state";
import { useOnboarding } from "../onboarding/store";
import { useStore } from "../store";
import { demoWalletAddress } from "../onboarding/fixtures";
import type { Chain, Token } from "../models";
import { formatUSD } from "../wallet-store";
export function CreateToken() {
  const navigate = useNavigate();
  const account = useOnboarding();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [chain, setChain] = useState<Chain>("Solana");
  const [supply, setSupply] = useState("1000000000");
  const [initialCap, setInitialCap] = useState("20000");
  const [followerOptIn, setFollowerOptIn] = useState(false);
  const [delivered, setDelivered] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Token | null>(null);
  const [launchId] = useState(() => crypto.randomUUID());
  const launchpad =
    chain === "Solana" ? "Aladdin curve · demo" : "Aladdin fair launch · demo";
  const wallet = account.wallets.find((w) => w.id === account.activeWalletId);
  function next() {
    setError("");
    if (
      step === 0 &&
      (!name.trim() ||
        !/^[A-Z0-9]{2,10}$/.test(ticker) ||
        description.trim().length < 20)
    )
      return setError(
        "Add a name, a 2–10 character ticker, and a description of at least 20 characters.",
      );
    if (
      step === 1 &&
      (!Number.isSafeInteger(Number(supply)) ||
        Number(supply) < 1000 ||
        Number(supply) > 1e12 ||
        !Number.isFinite(Number(initialCap)) ||
        Number(initialCap) < 1000 ||
        Number(initialCap) > 1e7)
    )
      return setError(
        "Supply must be a whole number from 1,000 to 1 trillion. Initial demo cap must be $1,000–$10 million.",
      );
    setStep(step + 1);
    window.scrollTo(0, 0);
  }
  function confirm() {
    if (!consent) return;
    if (!wallet?.proof)
      return setError(
        "Connect and verify a demonstration wallet in Profile before launching.",
      );
    if (wallet.chain !== chain)
      return setError(
        "Select a linked wallet on the launch network in Profile, or change the launch network.",
      );
    if (useMVP.getState().launches.some((l) => l.token.id === launchId)) return;
    const timestamp = new Date().toISOString();
    const t: Token = {
      id: launchId,
      chain,
      address: demoWalletAddress(
        chain,
        1000 + useMVP.getState().launches.length,
      ),
      name: name.trim(),
      ticker,
      description: description.trim(),
      icon: ticker.slice(0, 2),
      color: "#49BFFF",
      price: Number(initialCap) / Number(supply),
      cap: Number(initialCap),
      change: 0,
      volume: 0,
      holders: 0,
      age: "0m",
      creatorId: "account-demo",
      narrative: "Community",
      history: Array(24).fill(20),
    };
    useMVP.getState().saveLaunch({
      token: t,
      walletId: wallet.id,
      supply: Number(supply),
      launchpad,
      image,
      timestamp,
    });
    useOnboarding.setState((s) => ({
      launches: [
        ...s.launches,
        {
          id: launchId,
          walletId: wallet.id,
          chain,
          tokenAddress: t.address,
          tokenName: t.name,
          ticker,
          launchedAt: timestamp,
          outcome: "Active",
          highestObservedCap: t.cap,
          creatorFees: 0,
          feeAsset:
            chain === "Solana" ? "SOL" : chain === "BNB Chain" ? "BNB" : "ETH",
          observationAt: timestamp,
          provenance: "aladdin-demo-launch",
        },
      ],
    }));
    useStore.getState().publish({
      id: `launch-${launchId}`,
      userId: "account-demo",
      type: "Launch",
      tokenId: t.id,
      text: `${t.name} ($${ticker}) launched in the Aladdin simulator. No real token was deployed.`,
      timestamp,
      likes: 0,
    });
    useStore.getState().simulate("account-demo", t.id, "Launch");
    setResult(t);
    window.scrollTo(0, 0);
  }
  if (result)
    return (
      <div className="mvp-page launch-result">
        <CheckCircle2 size={52} />
        <div className="step-kicker">SIMULATED LAUNCH</div>
        <h1>{result.name} is ready to explore.</h1>
        <p>
          No blockchain transaction occurred. Your demonstration creator history
          now includes this launch. Supply is not credited to your spendable
          wallet.
        </p>
        <dl className="mvp-facts">
          <div>
            <dt>Network</dt>
            <dd>{result.chain}</dd>
          </div>
          <div>
            <dt>Initial market cap</dt>
            <dd>{formatUSD(result.cap)}</dd>
          </div>
          <div>
            <dt>Creator fees earned</dt>
            <dd>0 · no real fees</dd>
          </div>
        </dl>
        <Link className="wallet-primary" to={`/token/${result.id}`}>
          View token <ArrowRight size={18} />
        </Link>
        <Link className="wallet-secondary" to="/profile/history">
          View updated creator history
        </Link>
        <button
          className="wallet-secondary"
          onClick={() =>
            window.open(
              `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Exploring my simulated $${result.ticker} launch on Aladdin. ${window.location.origin}/token/${result.id} (browser-local demo, not a live token)`)}`,
              "_blank",
              "noopener,noreferrer",
            )
          }
        >
          Share to X
        </button>
        <details className="follower-preview">
          <summary>Test follower launch delivery</summary>
          <p>
            Preview a fictional follower’s inbox. This does not subscribe your
            own account or contact anyone.
          </p>
          <label className="check-label">
            <input
              type="checkbox"
              checked={followerOptIn}
              onChange={(e) => setFollowerOptIn(e.target.checked)}
            />{" "}
            Demo follower has Launch alerts enabled
          </label>
          <button
            className="wallet-secondary"
            disabled={!followerOptIn || delivered}
            onClick={() => {
              useStore.setState((s) => ({
                notifications: [
                  {
                    id: crypto.randomUUID(),
                    userId: "account-demo",
                    tokenId: result.id,
                    category: "Launch",
                    text: `Demo follower preview: ${result.name} ($${result.ticker}) launched in the simulator.`,
                    timestamp: new Date().toISOString(),
                    read: false,
                  },
                  ...s.notifications,
                ],
              }));
              setDelivered(true);
            }}
          >
            Deliver follower preview
          </button>
          {delivered && (
            <Link className="history-link" to="/alerts">
              Open simulated notification <ArrowRight size={16} />
            </Link>
          )}
        </details>
        <p className="mvp-note">
          You confirm publication in X. Demo token records are stored in this
          browser; links do not sync them to other devices.
        </p>
      </div>
    );
  return (
    <div className="mvp-page">
      <button
        className="back"
        onClick={() => (step ? setStep(step - 1) : navigate("/create"))}
      >
        <ArrowLeft size={18} /> {step ? "Back" : "Create"}
      </button>
      <div className="step-kicker">CREATE TOKEN · DEMO</div>
      <h1>
        {["Token details", "Configure launch", "Review your launch"][step]}
      </h1>
      <div className="mvp-steps" aria-label={`Step ${step + 1} of 3`}>
        {["Details", "Launch", "Review"].map((v, i) => (
          <span
            key={v}
            aria-current={i === step ? "step" : undefined}
            className={i <= step ? "current" : ""}
          >
            {i + 1} {v}
          </span>
        ))}
      </div>
      <form
        className="mvp-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 2) next();
          else confirm();
        }}
      >
        {step === 0 ? (
          <>
            <label>
              Token name
              <input
                maxLength={40}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your token name"
                required
              />
            </label>
            <label>
              Ticker
              <input
                maxLength={10}
                value={ticker}
                onChange={(e) =>
                  setTicker(
                    e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
                  )
                }
                placeholder="SYMBOL"
                required
              />
            </label>
            <label>
              Description
              <textarea
                maxLength={1000}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this token for? Explain the idea and the risks."
                required
              />
            </label>
            <label>
              Token image · optional, PNG/JPEG/WebP, up to 200 KB
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (
                    f.size > 200000 ||
                    !["image/png", "image/jpeg", "image/webp"].includes(f.type)
                  )
                    return setError("Choose a PNG, JPEG or WebP up to 200 KB.");
                  const reader = new FileReader();
                  reader.onload = () => {
                    setImage(String(reader.result));
                    setError("");
                  };
                  reader.readAsDataURL(f);
                }}
              />
            </label>
            {image && (
              <img
                className="launch-image"
                src={image}
                alt="Your token preview"
              />
            )}
          </>
        ) : step === 1 ? (
          <>
            <label>
              Launch network
              <select
                value={chain}
                onChange={(e) => setChain(e.target.value as Chain)}
              >
                {["Solana", "Base", "Ethereum", "BNB Chain"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label>
              Launchpad
              <select value={launchpad} onChange={() => {}}>
                <option>{launchpad}</option>
              </select>
            </label>
            <label>
              Total supply
              <input
                type="number"
                min={1000}
                max={1e12}
                step={1}
                value={supply}
                onChange={(e) => setSupply(e.target.value)}
              />
            </label>
            <label>
              Initial market cap · USD, fictional
              <input
                type="number"
                min={1000}
                max={1e7}
                value={initialCap}
                onChange={(e) => setInitialCap(e.target.value)}
              />
            </label>
            <p className="mvp-note">
              Fair launch preset: no creator allocation, no transfer tax, no
              real liquidity or launch fee. Linked wallet must use the selected
              network.
            </p>
          </>
        ) : (
          <>
            <div className="launch-preview">
              {image ? (
                <img src={image} alt="Token" />
              ) : (
                <span>
                  <Plus />
                </span>
              )}
              <div>
                <h2>{name}</h2>
                <small>${ticker}</small>
              </div>
            </div>
            <p>{description}</p>
            <dl className="mvp-facts">
              <div>
                <dt>Network</dt>
                <dd>{chain}</dd>
              </div>
              <div>
                <dt>Launchpad</dt>
                <dd>{launchpad}</dd>
              </div>
              <div>
                <dt>Supply</dt>
                <dd>{Number(supply).toLocaleString()}</dd>
              </div>
              <div>
                <dt>Initial cap</dt>
                <dd>{formatUSD(Number(initialCap))}</dd>
              </div>
              <div>
                <dt>Creator wallet</dt>
                <dd>{wallet?.label || "Not connected"}</dd>
              </div>
            </dl>
            <label className="check-label">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />{" "}
              I understand this creates a browser-local demo token, with no real
              funds or blockchain deployment.
            </label>
          </>
        )}
        {error && (
          <p className="negative" role="alert">
            {error}
          </p>
        )}
        <button
          className="wallet-primary"
          type="submit"
          disabled={step === 2 && !consent}
        >
          {step === 2 ? "Confirm simulated launch" : "Continue"}
          <ArrowRight size={17} />
        </button>
      </form>
    </div>
  );
}
