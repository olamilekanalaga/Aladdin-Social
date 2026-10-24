import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowUpRight } from "lucide-react";
import { useWallet, formatUSD } from "../wallet-store";
import { useOnboarding } from "../onboarding/store";
import { useMVP } from "./state";
import { useStore } from "../store";
import { tokens, personById, calls } from "../data";
import { purchaseEvidence } from "../reputation";
import type { Post } from "../models";
import { WalletAction } from "../Wallet";
export function CallEvidence({ post }: { post: Post }) {
  const wallet = useWallet();
  const account = useOnboarding();
  const mvp = useMVP();
  const [buy, setBuy] = useState(false);
  const [notice, setNotice] = useState("");
  const token = tokens.find((t) => t.id === post.tokenId);
  if (!token) return null;
  const own =
    post.userId === "account-demo" ||
    post.userId === "wallet-demo" ||
    (account.legacy && post.userId === "u1");
  const accountTransactions = [
    ...wallet.transactions,
    ...Object.entries(wallet.ledgers)
      .filter(([id]) => id !== wallet.activeWalletId)
      .flatMap(([, l]) => l.transactions),
  ];
  const matches = accountTransactions.filter(
    (tx) =>
      tx.type === "Buy" &&
      tx.toAssetId === token.id &&
      account.wallets.some(
        (w) => w.id === tx.walletId && w.proof && w.chain === token.chain,
      ),
  );
  const associated = matches.find((tx) => tx.id === mvp.callPurchases[post.id]);
  const seedCall = calls.find((c) => c.id === post.id);
  const seedUser = personById(post.userId);
  const seedPurchase =
    !own && seedCall && seedUser ? purchaseEvidence(seedCall)[0] : undefined;
  const seedEvidence = Boolean(seedPurchase);
  const evidence = own ? Boolean(associated) : Boolean(seedEvidence);
  const related = wallet.transactions.filter(
    (tx) => tx.attribution?.postId === post.id && tx.type === "Buy",
  );
  const fee = related.reduce((sum, tx) => sum + tx.usd * 0.003, 0);
  const sold = wallet.transactions.filter(
    (tx) => tx.type === "Sell" && tx.assetId === token.id,
  );
  const realised =
    sold.length && sold.every((tx) => tx.realisedPnL !== undefined)
      ? sold.reduce((n, tx) => n + (tx.realisedPnL || 0), 0)
      : null;
  return (
    <section className="mvp-call-evidence">
      <div className="row-between">
        <h2>Call & purchase evidence</h2>
        <ShieldCheck size={20} />
      </div>
      <p className={evidence ? "positive" : "muted"}>
        {evidence
          ? "Demo purchase associated · not live verification"
          : "Unverified call · no qualifying purchase associated"}
      </p>
      <dl className="mvp-facts">
        <div>
          <dt>Network</dt>
          <dd>{token.chain}</dd>
        </div>
        <div>
          <dt>Token contract</dt>
          <dd className="call-contract">{token.address}</dd>
        </div>
        <div>
          <dt>Original publication</dt>
          <dd>{new Date(post.timestamp).toLocaleString()}</dd>
        </div>
        <div>
          <dt>Market cap at publication</dt>
          <dd>
            {post.baseline
              ? formatUSD(post.baseline.marketCap)
              : seedCall
                ? formatUSD(seedCall.baselineCap)
                : "Not recorded"}
          </dd>
        </div>
        <div>
          <dt>Observed call return</dt>
          <dd>
            {post.baseline
              ? `${((token.price / post.baseline.price - 1) * 100).toFixed(2)}% · demo`
              : seedCall
                ? `${seedCall.outcome}× · demo`
                : "Unavailable"}
          </dd>
        </div>
        {seedPurchase && (
          <>
            <div>
              <dt>Demo purchase timestamp</dt>
              <dd>{new Date(seedPurchase.timestamp).toLocaleString()}</dd>
            </div>
            <div>
              <dt>Demo entry value</dt>
              <dd>{formatUSD(seedPurchase.amount)}</dd>
            </div>
          </>
        )}
        {associated && (
          <>
            <div>
              <dt>Buy recorded</dt>
              <dd>{new Date(associated.timestamp).toLocaleString()}</dd>
            </div>
            <div>
              <dt>Purchase entry value</dt>
              <dd>{formatUSD(associated.usd)}</dd>
            </div>
            <div>
              <dt>Wallet</dt>
              <dd>
                {
                  account.wallets.find((w) => w.id === associated.walletId)
                    ?.label
                }
              </dd>
            </div>
          </>
        )}
        {own && (
          <div>
            <dt>Realised trading result</dt>
            <dd>
              {sold.length && realised !== null
                ? `${formatUSD(realised)} · active-wallet estimate`
                : "No realised result recorded"}
            </dd>
          </div>
        )}
        <div>
          <dt>Attributed buys · this wallet</dt>
          <dd>{related.length}</dd>
        </div>
        <div>
          <dt>Caller fee estimate</dt>
          <dd>{formatUSD(fee)} · fictional, unpaid</dd>
        </div>
      </dl>
      {own && (
        <>
          <label className="mvp-select">
            Associate a qualifying demo purchase
            <select
              value={associated?.id || ""}
              onChange={(e) => {
                if (e.target.value) {
                  mvp.associate(post.id, e.target.value);
                  useStore
                    .getState()
                    .simulate(post.userId, post.tokenId, "Callout", post.id);
                  setNotice(
                    "Demo purchase evidence associated. Original call timestamp and baseline are unchanged.",
                  );
                }
              }}
            >
              <option value="">Choose your purchase</option>
              {matches.map((tx) => (
                <option key={tx.id} value={tx.id}>
                  {formatUSD(tx.usd)} ·{" "}
                  {new Date(tx.timestamp).toLocaleTimeString()}
                </option>
              ))}
            </select>
          </label>
          {!matches.length && (
            <p className="mvp-note">
              Buy this token using a demo-attested wallet on {token.chain}, then
              associate the recorded purchase. Calls may precede or follow a
              buy.
            </p>
          )}
        </>
      )}
      <button className="wallet-primary" onClick={() => setBuy(true)}>
        Buy from this call <ArrowUpRight size={16} />
      </button>
      <Link className="wallet-secondary" to={`/token/${token.id}`}>
        Open token details
      </Link>
      <p className="mvp-note">
        Attribution keeps this original post and caller on the buy receipt. The
        0.3% fictional caller fee is included in the illustrative 0.5% spread;
        nothing is paid. Real eligibility requires authenticated X and verified
        wallet purchases.
      </p>
      {notice && <p role="status">{notice}</p>}
      {buy && (
        <WalletAction
          action="Buy"
          initialAssetId={token.id}
          attribution={{ postId: post.id, callerId: post.userId }}
          close={() => setBuy(false)}
        />
      )}
    </section>
  );
}
