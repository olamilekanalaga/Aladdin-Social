import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Megaphone,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useStore } from "../store";
import { announcedDemoToken } from "../data";
import type { NotificationCategory } from "../models";
const categories: NotificationCategory[] = [
  "Announcement",
  "Launch",
  "2×",
  "5×",
  "10×",
  "Migration",
];
export function LaunchJourneyDemo() {
  const s = useStore();
  const [message, setMessage] = useState("");
  const followed = s.follows.includes("u1");
  const enabled = categories.every((c) => (s.preferences.u1 || []).includes(c));
  function event(category: NotificationCategory) {
    const before = useStore.getState().notifications.length;
    s.simulate("u1", announcedDemoToken.id, category);
    setMessage(
      useStore.getState().notifications.length > before
        ? `Simulated ${category} notification delivered.`
        : `${category} simulated. No notification delivered: follow the creator and enable this category first.`,
    );
  }
  return (
    <section className="launch-journey-demo">
      <div className="launch-example-heading">
        <span>
          <ShieldCheck size={17} /> Creator launch walkthrough
        </span>
        <small>Fictional demo</small>
      </div>
      <Link to="/profile/u1" className="launch-creator-identity">
        <span>🧙</span>
        <div>
          <b>launchking</b>
          <small>Demo-attested creator · Original history stays visible</small>
        </div>
        <ChevronRight size={17} />
      </Link>
      <blockquote>
        “I’m launching a new token on Monday at 5 PM. Turn on Aladdin
        notifications.”
      </blockquote>
      <div className="launch-example-optins">
        <button
          className={followed ? "wallet-secondary" : "wallet-primary"}
          onClick={() => s.toggle("follows", "u1")}
        >
          {followed ? <Check size={16} /> : <ShieldCheck size={16} />}{" "}
          {followed ? "Following creator" : "Follow creator"}
        </button>
        <button
          className="wallet-secondary"
          aria-pressed={enabled}
          onClick={() =>
            s.configure(
              "u1",
              Array.from(new Set([...(s.preferences.u1 || []), ...categories])),
            )
          }
        >
          <Bell size={16} />
          {enabled ? "Launch alerts enabled" : "Enable demo launch alerts"}
        </button>
      </div>
      <p className="onboarding-caption">
        Opts into announcements, launches, 2×, 5×, 10× and migration for this
        creator. Fine-tune categories from their profile.
      </p>
      <ol className="launch-example-stages">
        <li className={s.demoLaunchStage !== "scheduled" ? "done" : ""}>
          <Megaphone size={18} />
          <span>
            <b>1. Upcoming announcement</b>
            <small>Intent is not an on-chain launch.</small>
          </span>
          <button
            className="quiet-button"
            onClick={() => {
              s.setDemoLaunchStage("announced");
              event("Announcement");
            }}
          >
            Simulate announcement
          </button>
        </li>
        <li className={s.demoTokenDiscovered ? "done" : ""}>
          <Search size={18} />
          <span>
            <b>2. Launch detected</b>
            <small>Registers the new ANXT demo token.</small>
          </span>
          <button
            className="quiet-button"
            disabled={s.demoLaunchStage === "scheduled"}
            onClick={() => {
              s.setDemoLaunchStage("detected");
              event("Launch");
            }}
          >
            Simulate launch detection
          </button>
        </li>
        <li className={s.demoTokenDiscovered ? "done" : ""}>
          <CheckCircle2 size={18} />
          <span>
            <b>3. Token available</b>
            <small>
              {s.demoTokenDiscovered
                ? "ANXT can now be opened from discovery or its notification."
                : "Token details unlock after detection."}
            </small>
          </span>
          {s.demoTokenDiscovered && (
            <Link
              className="quiet-button"
              to={`/token/${announcedDemoToken.id}`}
            >
              Open token <ChevronRight size={15} />
            </Link>
          )}
        </li>
      </ol>
      {s.demoTokenDiscovered && (
        <div className="launch-milestone-actions">
          {(["2×", "5×", "10×", "Migration"] as const).map((c) => (
            <button className="button" key={c} onClick={() => event(c)}>
              Simulate {c}
            </button>
          ))}
        </div>
      )}
      <p role="status" className="launch-example-status">
        {message}
      </p>
      <Link className="history-link" to="/alerts">
        Open follower alerts <Bell size={14} />
      </Link>
    </section>
  );
}
