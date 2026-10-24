# Aladdin Social

MVP V1 uses the Signal Blue mobile system with **Wallet · Discover · Create · Activity · Profile** navigation. The existing application now includes a reviewed simulated token-launch wizard, persistent created-token discovery/history, call-linked purchase evidence, caller-attributed trade receipts and unpaid fee estimates, creator achievement filters, profile-to-hiring access and a no-movement Bridge walkthrough. See [the MVP review](artifacts/MVP-V1-REVIEW.md) for journeys, integration boundaries, screenshots and verification limits.

A wallet-first mobile application prototype with creator, caller and trader reputation integrated into discovery and token research. First-time browsers choose an existing-wallet or new-wallet demonstration; completed setup opens directly to balances and holdings. The hierarchy is **Wallet → Assets → Trading → Discovery → Reputation → Opportunities**. Financial data, wallet actions, identity attestations and events remain simulations; no real money, custody or trading is enabled.

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

Open http://localhost:3001. A hosting platform may set `PORT`; bind address is `0.0.0.0`. Deploy this Node server with the built `dist` directory, not only a static directory, to retain API-backed permission demonstrations. Vercel deployment is configured in `vercel.json`, with the SPA and API in one project. The existing live application is https://aladdin-social.vercel.app, project `prj_YEmqc2fucAzXNZIo0XKtiVu7em9y`. The previous onboarding release was confirmed READY at commit `6246fb2`; inspect deployment metadata for the latest MVP release. Updates are published to its existing Git-connected `main` branch. The connected Vercel app can read deployment metadata but currently denies access to this project’s protected fetch/project APIs; live browser verification remains access-dependent. The unrelated `aladdin-ui` project is not used. A development URL does not imply a public, permanent URL accessible on your phone.

## Wallet onboarding and inherited history

Fresh browsers see **Welcome to Aladdin** and two interactive paths:

- **Existing wallet:** select Browser Wallet / WalletConnect / secure SDK import preview and a network → simulated connection → inspect a domain/nonce/timestamp ownership challenge → simulate the signature → progressive demo-history discovery → inspect original records → optionally link a simulated X profile → wallet Home.
- **New wallet:** choose a network → simulated wallet setup → display/copy a public demo identifier → empty history → optional X linking or Skip → $0 wallet Home. No keypair or recovery phrase is generated.

Browser/WalletConnect/SDK names describe the demonstration paths; none is a real provider connection. The repository has no wallet SDK or real X OAuth integration to preserve. Import never asks for a seed/private key or accesses the production Aladdin/Vlak database.

Each existing-wallet demo discovers **18 launches, 9 graduations, 145 SOL in historical creator fees and 3 tokens reaching $1M+** on Solana. Other network fixtures keep fee currencies separate. Successes, active launches and failures are all inspectable. Historical fees are not added to spendable balances. New wallets have no imported records.

`/profile/history` aggregates only owned demo records and filters them per wallet while retaining original wallet IDs, chain + contract identities, observation dates, launch outcomes and fees. Linking two wallets gives 36 distinct launch records, not overwritten or reattributed copies. Wallet selection switches independent local balance/activity ledgers; existing browser balances are preserved by the existing-wallet upgrade path.

`/profile/identity` supports optional simulated X link/unlink. Linking enables a clearly labelled **demo discovery preview**, not actual authenticated public eligibility. Actual public boards require real X OAuth and cryptographic wallet ownership proof. Profiles can keep using the wallet and inspect private history without X.

`/profile/wallets` links/selects wallets. **Profile → Restart onboarding demo** or the setup screen’s **Reset demo** clears demo setup/history/wallet ledgers so both paths can be retested; third-party seed social records/follows/alert preferences are preserved. MVP-created tokens, their launch records and personal call evidence are cleared.

The creator launch walkthrough at `/launch` follows announcement → detection → new `ANXT` token registration → opt-in notification → token detail. The token cannot be discovered or traded in the demonstration before detection. Milestone buttons cover 2×, 5×, 10× and migration. These are manual simulated events, not live listeners or background delivery.

## Product experiences

The same information architecture is used on mobile, tablet and desktop. There is no landing page and no sidebar-led terminal as the opening experience.

| Primary tab              | Experience                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Home** `/`             | $2,485.60 initial demo balance, readable holdings, balance privacy, Receive / Send / Swap / Add funds, wallet activity. No portfolio chart or promotional cards.                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Discover** `/discover` | Token, contract, chain and person search; trending/new launches; filtered activity from followed accounts; launch announcements.                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **People** `/people`     | Independent Creator / Caller / Trader leaderboards with direct achievement sorting, native mobile rows, inspectable profile context, follow controls and hiring access. Creator sorts include launches, graduations, $100K/$500K/$1M+ outcomes, observed peak cap and attributable fees. Caller qualification requires a published call plus same-token/same-chain purchase evidence from a demo-attested wallet; unqualified posts remain recorded. Trader metrics include volume and explicit closed-position records. No composite AI reputation score is used. |
| **Alerts** `/alerts`     | Existing category preferences, unread state and creator/trader/caller/milestone events. Demo event tools are secondary and collapsed.                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Profile** `/profile`   | Identity, wallet summary, reputation, activity, saved posts/lists, notifications, subscriptions explanation, wallet privacy and reset, account-mode/API tools.                                                                                                                                                                                                                                                                                                                                                                                                     |

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
- `src/main.tsx`: five-tab application shell, first-time setup guard, existing social primitives, profiles, composer and alerts.
- `src/mvp/`: Signal Blue extensions, Create hub, token-launch wizard/registry, call evidence/attribution and Bridge preview.
- `src/onboarding/`: typed demo identity/wallet/history store; fixture importer; ownership challenge and X-link screens; wallet management, historical profile and launch walkthrough.
- `src/reputation.ts`: direct creator achievements, matched purchase evidence and verified-demo trading metrics.
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

All-time profile figures are illustrative aggregate seeds, while detailed rows are a small representative history. Different views explicitly label which is used. Period selection filters timestamped calls/trades/launches against the fixed demonstration snapshot of 24 October 2026. Creator and trader all-time ranking measures stay labelled all-time. Caller 2× success uses selected-period original baselines; a call below its baseline is a failed outcome. Not graduating is not automatically a failed launch. Ranking uses direct achievements rather than a composite reputation score. No score alone establishes trustworthiness.

## Verification

```sh
npm run typecheck
npm run lint
npm run build
npm test
```

Start API and Vite before `npm test`. Playwright uses `/usr/bin/chromium` in this workspace; override `PLAYWRIGHT_CHROMIUM_EXECUTABLE` or install Playwright Chromium elsewhere. Tests exercise discovery → profile → follow → alerts → simulated launch, publishing and baseline persistence, comments/bookmarks, Share to X intent construction (intercepted fixture, no real X publication), trader/caller records including failures, chain filters, API 401/403/200 boundaries, simulated introductions, launch announcements and responsive routes.

The current mobile audit, design system and before/after screenshots are documented in [`artifacts/MOBILE-REVIEW.md`](artifacts/MOBILE-REVIEW.md). Home was verified before connecting subsequent screens at 375×812, 390×844 and 393×852, plus the shorter 390×664 and 393×660 iPhone browser viewport profiles. Desktop/tablet route checks are retained. Tests run in Chromium; this is not a claim of on-device Safari verification.

## Deploy updates to the existing Vercel project

Use the existing `aladdin-social` project (`prj_YEmqc2fucAzXNZIo0XKtiVu7em9y`) and production domain https://aladdin-social.vercel.app. It is connected to `olamilekanalaga/Aladdin-Social`, branch `main`. Do not create another project or deploy to `aladdin-ui`.

The tracked Vite/Node configuration deploys the SPA and Express API together. Keep Node.js 24.x, `npm run build`, and `dist`. The existing server-only `ALADDIN_SOCIAL_DEMO_SESSION_SECRET` must remain configured for the API. Never expose it as a `VITE_` variable or commit its value.

Run checks before pushing `main`; then inspect the resulting deployment for READY status and matching commit, and verify the fresh-browser onboarding at the live URL. The current Vercel connection returns 403 for protected fetching and 404 for this project’s scoped management endpoints, even though public deployment metadata resolves correctly. The project/team must be authorised in the Vercel connection to complete those access-dependent checks. No Deployment Protection setting was weakened.

Onboarding/identity/history, wallet ledgers, announcements and social actions are browser-local demonstrations. A shared backend is required for cross-device synchronisation. Ordinary existing demo sessions and feature permissions remain in the signed HTTP-only cookie API.

See [`artifacts/ONBOARDING-REVIEW.md`](artifacts/ONBOARDING-REVIEW.md) for journeys, screenshots, implementation boundaries and test results.

## Before production

Real X OAuth and signed-wallet proof; durable multi-device posts/follows/preferences; indexers and provenance verification; full historical attribution and anti-gaming ranking methodology; authenticated server-managed entitlements and billing; creator consent and introduction delivery; durable background scheduling plus push/email notifications; authorised API tokens, quotas and licensing; subscription research access; external links with provenance; security/accessibility review and load testing. Trading, custody, launch execution, settlement and bridging require separately authorised integrations and are deliberately absent.

Four economic hypotheses remain modular: hiring/introduction access, disclosed trading fees, creator research subscriptions and intelligence API access. None is a proven revenue stream. No subscription promises an early-profit advantage.
