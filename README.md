# Aladdin Social

A people-first crypto reputation network: discover a person, inspect their history, follow their next activity, and explore opportunities to work with them. All financial data, identities, wallet attestations, launch events, and entitlements are fictional demonstrations.

## Run locally

Node.js 22.12+ (tested with Node 24), npm, and two terminals:

```sh
npm ci
npm run api
```

```sh
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` to the demo Express server on port 3001. To run the built application with one server:

```sh
npm run build
NODE_ENV=production npm start
```

Open http://localhost:3001. A hosting platform may set `PORT`; bind address is `0.0.0.0`. Deploy this Node server with the built `dist` directory, not only a static directory, to retain API-backed permission demonstrations. Vercel deployment is configured in `vercel.json`, with the SPA and API in one project. No live Vercel deployment is claimed yet: creating the requested new `aladdin-social` project was rejected by the connected Vercel account with HTTP 403. The existing `aladdin-ui` project belongs to a different repository and was not changed. A development URL does not imply a public, permanent URL accessible on your phone.

## Product experiences

- **Discover:** people-led feed, role/chain filters, chain-aware user/token/contract search, trending tokens, creator discovery, historical milestones and contextual token intelligence.
- **Independent leaderboards:** creators rank by graduation, buyer reach or sustained demo outcomes; traders by realised PnL, win rate or consistency; callers by original-call outcomes, separate demo buy evidence or trading performance. Accounts may hold multiple roles. X-linked fictional accounts qualify for social visibility; a wallet-only demo session is available under the account avatar.
- **Profiles:** creator launch outcomes, fees and relationship caveats; trader realised/unrealised PnL and trade records; caller immutable baselines and successful/failed historical calls. Detailed launch rows are representative seed records rather than the complete all-time aggregate.
- **Hire:** public creator statistics and identities, optional availability filter, creator profile research, a brief and simulated feature-authorised introduction request. No payment, message, or private contact delivery. Not every creator is in the opted-in set.
- **Intelligence:** profile Intelligence tab or account page provides gated relationship evidence and JSON exports. Different API permissions govern introductions, identity enrichment, relationships and exports. Public reputation is always readable.
- **Launch:** scheduled creator announcements, reminder opt-in, manual reminder simulation and manually confirmed demo launches. No token creation, minting or distribution. Reminders require following plus the relevant category preference.
- **Terminal:** chain-aware token research and unified simulated balance. Trade control explains that execution is disabled.
- **Publishing:** thesis or callout, chain-specific address validation, available token snapshot, optional local image/chart/narrative, browser-local persistence, comments, likes, follows, watchlists and bookmarks. New posts preserve original timestamp, price and market-cap baseline. No baseline editor exists.
- **Share to X:** opens X's web intent containing text, ticker, CA and post URL. Publication is performed and confirmed by the user on X, never claimed by Aladdin. New demo posts only exist in their originating browser; their links cannot resolve on another device until a shared post backend exists.
- **Notifications:** category preferences per followed user, unread state, event simulator, and navigation to related token. Initial fictional notification is provided. No push, email, background scheduler or live RPC listener.
- **Supporting discovery:** narratives, custom token lists, saved posts, portfolio preview and clearly fictional reward campaigns.

## Architecture

- `src/models.ts`: identities (immutable internal and separate X IDs), wallets, chain-aware tokens, launches, fees, trades, positions, calls, theses, follows, notifications, milestones and reputation types.
- `src/data.ts`: public fictional seeds and address/token-identity helpers. EVM addresses normalise case; Solana addresses preserve case and must decode to 32 bytes.
- `src/store.ts`: versioned browser-local Zustand state for social interactions and simulated notification delivery.
- `src/main.tsx`: router, layout, reusable UI primitives, feed, profiles, token context, composer and notifications.
- `src/Leaderboards.tsx`: distinct role-specific rankings, columns, metrics, and period-filtered activity.
- `src/Experiences.tsx`: opportunities, advanced intelligence, announcements, terminal and demo participation modes.
- `src/Spark.tsx`: lazy-loaded Recharts visualisation; chart code is separate from the initial app bundle.
- `src/services.ts`: future provider contracts, including X OAuth, SocialData historical search, SolanaTracker/market data, Dune, Solana/EVM RPC, notifications, wallets and disabled execution.
- `server/index.mjs`: local Node entrypoint.
- `server/app.mjs`: shared Express API and API-level feature permission enforcement.
- `server/session.mjs`: signed, HTTP-only SameSite demo sessions that work across independent serverless instances.
- `api/handler.js`: Vercel function entrypoint; `vercel.json` keeps API routing separate from SPA deep links.

### API permission model

| Route                                | Required feature                                    |
| ------------------------------------ | --------------------------------------------------- |
| `GET /api/session`                   | Demo session                                        |
| `POST /api/demo/access`              | Demo session + CSRF token; simulated plan selection |
| `GET /api/creators/:id/identity`     | `creator.identity`                                  |
| `GET /api/creators/:id/intelligence` | `wallet.relationships`                              |
| `GET /api/intelligence/export`       | `intelligence.export`                               |
| `POST /api/introductions`            | `hiring.introduction` + CSRF token                  |
| `GET /api/introductions`             | Own demo session                                    |

`basic` has no advanced permissions; `intelligence` grants identity, relationships and export; `opportunities` grants introduction requests only. UI controls deliberately simulate entitlements so the flow is reviewable without payments. **This is not production billing or authentication:** replace demo session creation and self-service entitlement selection before any real paid access. Server responses, not CSS blur, enforce feature checks. Gated records are not shipped in client code. Private contact data is never returned. Public wallet/token records remain publicly inspectable; advanced access is not a promise to conceal public-chain identity.

Demo sessions expire after 24 hours. Sessions and the five latest introduction receipts are stored in a signed HTTP-only cookie rather than process memory, so independent serverless instances can validate them with the same signing key. Briefs and budgets are validated but not retained; there is no actual introduction delivery. Cookie receipts do not sync between devices. Local development uses an ephemeral signing key unless one is configured, so sessions reset on restart. No credentials, wallet private keys or production Aladdin/Vlak records are used.

### Data and ranking interpretation

All-time profile figures are illustrative aggregate seeds, while detailed rows are a small representative history. Different views explicitly label which is used. Period selection filters timestamped calls/trades/launches against the fixed demonstration snapshot of 24 October 2026. Creator and trader all-time ranking measures stay labelled all-time. Caller 2× success uses selected-period original baselines; a call below its baseline is a failed outcome. Not graduating is not automatically a failed launch. Demo consistency is a labelled illustrative composite, not an established reputation formula. No score alone establishes trustworthiness.

## Verification

```sh
npm run typecheck
npm run lint
npm run build
npm test
```

Start API and Vite before `npm test`. Playwright uses `/usr/bin/chromium` in this workspace; override `PLAYWRIGHT_CHROMIUM_EXECUTABLE` or install Playwright Chromium elsewhere. Tests exercise discovery → profile → follow → alerts → simulated launch, publishing and baseline persistence, comments/bookmarks, Share to X intent construction (intercepted fixture, no real X publication), trader/caller records including failures, chain filters, API 401/403/200 boundaries, simulated introductions, launch announcements and responsive routes.

Screenshots are generated in `artifacts/` at desktop 1536×1024, tablet 834×1024, and phone 390×1024 viewports. A 1536×1024 viewport crop is also included. Visual direction follows the reference's restrained dark information density with an independent warm-gold Aladdin identity, per the later instruction to use it as inspiration rather than copy it. No pixel-equivalence claim.

## Deploy a new Aladdin Social project on Vercel

Use a new project named `aladdin-social`; do not reuse `aladdin-ui` (linked to a different demo repository).

1. Import `olamilekanalaga/Aladdin-Social` in Vercel under your intended team.
2. Keep framework **Vite**, build command `npm run build`, output `dist`, and Node.js **24.x**. The tracked configuration also deploys the Express API as a Node function.
3. Configure `ALADDIN_SOCIAL_DEMO_SESSION_SECRET` as a server-only secret for the deployment environment. Use a cryptographically random value of at least 32 bytes, generated privately; never use a `VITE_` prefix or commit it. Production and preview should use separate values. The API fails closed on Vercel if this variable is absent.
4. Deploy, then verify `/`, `/creators`, `/hire`, `/launch`, `/account`, post sharing, and authenticated API requests on the resulting URL. A 401 from `GET /api/session` before creating a session is expected; a SPA HTML response on that API URL is a routing error.

The backend uses the shared key to validate signed demo sessions across serverless instances. This is not real account verification or paid access. Social posts, follows and announcements are still browser-local and do not sync between phone and computer. A database and real authentication remain future work.

The connected Vercel API returned `403 forbidden` when creating a new project. No authenticated CLI fallback is configured in this workspace. Project creation/access is the remaining external blocker; no existing Vercel project was overwritten.

## Before production

Real X OAuth and signed-wallet proof; durable multi-device posts/follows/preferences; indexers and provenance verification; full historical attribution and anti-gaming ranking methodology; authenticated server-managed entitlements and billing; creator consent and introduction delivery; durable background scheduling plus push/email notifications; authorised API tokens, quotas and licensing; subscription research access; external links with provenance; security/accessibility review and load testing. Trading, custody, launch execution, settlement and bridging require separately authorised integrations and are deliberately absent.

Four economic hypotheses remain modular: hiring/introduction access, disclosed trading fees, creator research subscriptions and intelligence API access. None is a proven revenue stream. No subscription promises an early-profit advantage.
