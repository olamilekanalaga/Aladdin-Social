import { useState } from "react";
import Modal from "../ui/Modal";
import { ArrowDownUp, CheckCircle2 } from "lucide-react";
/** A quote walkthrough only. It deliberately cannot mutate spendable chain balances. */
export function BridgeDemo({ close }: { close: () => void }) {
  const [from, setFrom] = useState("Solana");
  const [to, setTo] = useState("Base");
  const [amount, setAmount] = useState("100");
  const [stage, setStage] = useState(0);
  const [error, setError] = useState("");
  return (
    <Modal
      title={
        stage === 2
          ? "Bridge walkthrough complete"
          : stage === 1
            ? "Review bridge preview"
            : "Bridge preview"
      }
      close={close}
    >
      <div className="mvp-form">
        <span className="simulation-pill">DEMO · NO CROSS-CHAIN EXECUTION</span>
        {stage === 0 ? (
          <>
            <p>
              Explore the flow with fictional USDC. No funds are moved and no
              wallet balances change.
            </p>
            <label>
              From network
              <select value={from} onChange={(e) => setFrom(e.target.value)}>
                {["Solana", "Base", "Ethereum", "BNB Chain"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label>
              To network
              <select value={to} onChange={(e) => setTo(e.target.value)}>
                {["Solana", "Base", "Ethereum", "BNB Chain"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label>
              Preview amount · USDC
              <input
                type="number"
                min="0.01"
                max="100000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
            <button
              className="wallet-primary"
              onClick={() => {
                if (
                  from === to ||
                  !Number.isFinite(Number(amount)) ||
                  Number(amount) <= 0 ||
                  Number(amount) > 100000
                )
                  return setError(
                    "Choose different networks and an amount from 0.01 to 100,000 USDC.",
                  );
                setError("");
                setStage(1);
              }}
            >
              Preview bridge <ArrowDownUp size={17} />
            </button>
          </>
        ) : stage === 1 ? (
          <>
            <h2>{amount} USDC</h2>
            <dl className="mvp-facts">
              <div>
                <dt>Route</dt>
                <dd>
                  {from} → {to}
                </dd>
              </div>
              <div>
                <dt>Illustrative fee</dt>
                <dd>{(Number(amount) * 0.003).toFixed(2)} USDC</dd>
              </div>
              <div>
                <dt>Preview receive</dt>
                <dd>{(Number(amount) * 0.997).toFixed(2)} USDC</dd>
              </div>
            </dl>
            <p>
              No live quote, bridge provider or settlement. This preview does
              not debit your wallet.
            </p>
            <button className="wallet-primary" onClick={() => setStage(2)}>
              Confirm demonstration
            </button>
            <button className="wallet-secondary" onClick={() => setStage(0)}>
              Edit route
            </button>
          </>
        ) : (
          <>
            <CheckCircle2 size={44} />
            <h2>Route explored</h2>
            <p>
              Your balances are unchanged. Live bridging requires a future
              provider integration and explicit transaction approval.
            </p>
            <button className="wallet-primary" onClick={close}>
              Done
            </button>
          </>
        )}
        {error && (
          <p role="alert" className="negative">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
