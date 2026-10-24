# Aladdin Social

A wallet-first mobile application prototype with creator, caller and trader reputation integrated into discovery and token research. Opens directly to demo balances and holdings. The hierarchy is **Wallet → Assets → Trading → Discovery → Reputation → Opportunities**. Financial data, wallet actions, identity attestations and events remain simulations; no real money, custody or trading is enabled.

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

The same information architecture is used on mobile, tablet and desktop. There is no landing page and no sidebar-led terminal as the opening experience.

| Primary tab              | Experience                                                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Home** `/`             | $2,485.60 initial demo balance, readable holdings, balance privacy, Receive / Send / Swap / Add funds, wallet activity. No portfolio chart or promotional cards.    |
| **Discover** `/discover` | Token, contract, chain and person search; trending/new launches; filtered activity from followed accounts; launch announcements.                                    |
| **People** `/people`     | Independent Creator / Caller / Trader leaderboards with distinct existing metrics, native mobile rows, complete profile context, follow controls and hiring access. |
| **Alerts** `/alerts`     | Existing category preferences, unread state and creator/trader/caller/milestone events. Demo event tools are secondary and collapsed.                               |
| **Profile** `/profile`   | Identity, wallet summary, reputation, activity, saved posts/lists, notifications, subscriptions explanation, wallet privacy and reset, account-mode/API tools.      |

### Wallet and trading flows

- `/assets` lists/searches all held demo assets; `/asset/:id` opens wallet asset details; `/token/:id` opens the same research/trading interface from Discover.
- Token detail includes fractional price precision, one contextual simulated chart, holdings, Buy/Sell, wallet transaction history, token information, attributable creator context and original caller records.
- **Receive** renders a QR containing an `aladdin-demo://` URI, not a real cryptocurrency payment address. It cannot receive funds.
- **Send** validates the selected chain's recipient address and available quantity, then requires an explicit simulation review before updating local holdings.
- **Swap / Buy / Sell** show fixed fictional quote information, a disclosed 0.5% illustrative spread and a review step. Confirmation atomically updates the local demo ledger. Repeated operation IDs, invalid quantities and overspending are rejected. Cross-chain settlement/bridging is not implemented; assets without supported funding show an explicit explanation.
- **Add funds** adds simulated Solana USDC after review, with no payment or financial details collected. Funds never leave or enter a real wallet.
- Wallet state is versioned browser-local Zustand storage, separate from the existing social state. Resetting the wallet preserves social posts/follows/preferences.

### Preserved connected experiences

Creator/caller/trader profiles, launch history, attributable fees and relationship caveats; successful and failed original call records; immutable post baselines; follows, comments, bookmarks and lists; local thesis/callout publishing; X web-intent sharing with user confirmation; consent-based simulated introductions; API-gated relationship evidence and exports; scheduled announcements and manual reminder/launch simulation. X OAuth, signed-wallet proof, payments, live market data and actual notifications are not connected.

Posts and wallet activity are local to their originating browser and do not sync between phone and desktop. Web-intent post links require shared storage before a locally created post can resolve on another device. Rewards and subscription views do not promise real allocations or early trading advantages.

## Architecture

- `src/models.ts`: identities (immutable internal and separate X IDs), wallets, chain-aware tokens, launches, fees, trades, positions, calls, theses, follows, notifications, milestones and reputation types.
- `src/data.ts`: public fictional seeds and address/token-identity helpers. EVM addresses normalise case; Solana addresses preserve case and must decode to 32 bytes.
- `src/store.ts`: versioned browser-local Zustand state for social interactions and simulated notification delivery.
- `src/main.tsx`: five-tab application shell, existing social primitives, profiles, composer and alerts.
- `src/Wallet.tsx`: wallet home, holdings, activity, reviewed wallet actions, token research/trading, Discover, People and personal Profile.
- `src/wallet-store.ts`: typed wallet assets, balances, activity, operation validation and local persistence.
- `src/wallet.css`: mobile design tokens and shared screen styles; `src/ui/Modal.tsx`: shared accessible bottom sheet/dialog.
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

The current mobile audit, design system and before/after screenshots are documented in [`artifacts/MOBILE-REVIEW.md`](artifacts/MOBILE-REVIEW.md). Home was verified before connecting subsequent screens at 375×812, 390×844 and 393×852, plus the shorter 390×664 and 393×660 iPhone browser viewport profiles. Desktop/tablet route checks are retained. Tests run in Chromium; this is not a claim of on-device Safari verification.

## Deploy a new Aladdin Social project on Vercel

Use a new project named `aladdin-social`; do not reuse `aladdin-ui` (linked to a different demo repository).

1. Import `olamilekanalaga/Aladdin-Social` in Vercel under your intended team.
2. Keep framework **Vite**, build command `npm run build`, output `dist`, and Node.js **24.x**. The tracked configuration also deploys the Express API as a Node function.
3. Configure `ALADDIN_SOCIAL_DEMO_SESSION_SECRET` as a server-only secret for the deployment environment. Use a cryptographically random value of at least 32 bytes, generated privately; never use a `VITE_` prefix or commit it. Production and preview should use separate values. The API fails closed on Vercel if this variable is absent.
4. Deploy, then verify `/`, `/discover`, `/people`, `/alerts`, `/profile`, `/asset/t1`, wallet review flows, post sharing, and authenticated API requests on the resulting URL. A 401 from `GET /api/session` before creating a session is expected; a SPA HTML response on that API URL is a routing error.

The backend uses the shared key to validate signed demo sessions across serverless instances. This is not real account verification or paid access. Social posts, follows and announcements are still browser-local and do not sync between phone and computer. A database and real authentication remain future work.

The connected Vercel API returned `403 forbidden` when creating a new project. No authenticated CLI fallback is configured in this workspace. Project creation/access is the remaining external blocker; no existing Vercel project was overwritten.

## Before production

Real X OAuth and signed-wallet proof; durable multi-device posts/follows/preferences; indexers and provenance verification; full historical attribution and anti-gaming ranking methodology; authenticated server-managed entitlements and billing; creator consent and introduction delivery; durable background scheduling plus push/email notifications; authorised API tokens, quotas and licensing; subscription research access; external links with provenance; security/accessibility review and load testing. Trading, custody, launch execution, settlement and bridging require separately authorised integrations and are deliberately absent.

Four economic hypotheses remain modular: hiring/introduction access, disclosed trading fees, creator research subscriptions and intelligence API access. None is a proven revenue stream. No subscription promises an early-profit advantage.
