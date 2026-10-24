import { Link } from "react-router-dom";
import { ArrowRight, FileText, Rocket, CalendarDays } from "lucide-react";
import { useStore } from "../store";
import { useOnboarding } from "../onboarding/store";
export function CreateHub({ compose }: { compose: () => void }) {
  const posts = useStore((s) => s.posts);
  const account = useOnboarding();
  const own = posts.filter(
    (p) =>
      ["Callout", "Thesis"].includes(p.type) &&
      (p.userId === "account-demo" ||
        p.userId === "wallet-demo" ||
        (account.legacy && p.userId === "u1")),
  );
  return (
    <div className="mvp-page">
      <div className="step-kicker">MAKE YOUR NEXT MOVE</div>
      <h1>Create</h1>
      <p className="wallet-subtitle">
        Build a track record people can explore.
      </p>
      <div className="mvp-menu">
        <Link to="/create/token">
          <Rocket />
          <span>
            <b>Create token</b>
            <small>
              Details, launch settings and a review before you confirm.
            </small>
          </span>
          <ArrowRight />
        </Link>
        <button onClick={compose}>
          <FileText />
          <span>
            <b>Publish a call or thesis</b>
            <small>Keep the original time and entry evidence on record.</small>
          </span>
          <ArrowRight />
        </button>
        <Link to="/launch">
          <CalendarDays />
          <span>
            <b>Announce a launch</b>
            <small>Help followers opt into your next chapter.</small>
          </span>
          <ArrowRight />
        </Link>
      </div>
      {own.length > 0 && (
        <section className="mvp-menu">
          <h2>Your published perspectives</h2>
          {own.map((p) => (
            <Link key={p.id} to={`/post/${p.id}`}>
              <FileText />
              <span>
                <b>{p.type}</b>
                <small>{p.text.slice(0, 100)}</small>
              </span>
              <ArrowRight />
            </Link>
          ))}
        </section>
      )}
      <p className="mvp-note">
        Demonstration only. No real tokens, transactions or X posts are
        submitted.
      </p>
    </div>
  );
}
