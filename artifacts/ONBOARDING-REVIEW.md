# Wallet onboarding update — 24 October 2026

## Inspection and preserved infrastructure

Inspected the existing React/Vite/TypeScript routes, Zustand social and wallet stores, wallet action sheets, Express session/permission API, service adapter interfaces, demo reputation fixtures and tests before integration. The live deployment’s metadata points to repository commit `ff18e58`, the inspected baseline. No secure wallet SDK, real message-signing provider or X OAuth configuration exists in that source.

Retained the wallet-first Home and five-tab navigation, shared design system, financial simulator, original post baselines, social persistence, follow/notification preferences, independent role profiles, hiring/API permission demonstrations and existing server sessions. No production Aladdin/Vlak source was read or changed. Previously persisted wallet balances survive the existing-wallet setup path.

The supplied live URL resolves through Vercel deployment metadata, but protected fetching returned 403 and the selected project-management endpoints returned 404. Anonymous workspace networking to that Vercel hostname is also denied. Visual verification therefore uses the matching source locally; deployment readiness and live browser verification are reported separately.

## Interactive journeys

1. **Bring history:** Browser Wallet / WalletConnect / SDK preview → fictional existing wallet → inspect origin/address/network/nonce/timestamp verification message → simulate signature → staged history discovery → 18 immutable demo launch records → optional simulated X link → Home → inherited profile.
2. **Start fresh:** choose network → create a public demo identifier → display/copy address → 0 historical launches/trades/fees → Skip X → $0 Home. No private key or recovery phrase exists.
3. **Discoverable identity:** optional simulated X linking, linked-wallet count and explicit authentication/eligibility state → own discovery preview. Wallet-only access remains available. The actual public-eligibility result stays false until real authenticated X and real wallet proof exist.
4. **Multiple wallets:** each connection receives its own proof and immutable wallet/token records; 2 wallets yield 36 launches with per-wallet 18-record breakdowns. Switching wallets switches independent local balance/activity ledgers without discarding either ledger.
5. **Follow future activity:** follow a demo-attested creator → opt into categories → announce Monday 26 October at 17:00 London → simulate detection → register ANXT → receive notification → open token. 2×/5×/10×/migration events are supported. ANXT is unavailable before detection.
6. **Reset:** Profile → Restart onboarding demo, or Reset demo during setup. Clears simulated identity/history/wallet ledgers while preserving existing social posts/follows/preferences.

## Reputation rules

- Creators sort by direct launch, graduation, $100K/$500K/$1M+, highest observed cap and fee achievements. No AI/composite trust score.
- Verified-demo caller qualification requires a published original call and a same-token purchase from a demo-attested wallet on the token’s chain. A social post or unrelated/unattested buy cannot qualify. Unqualified calls remain inspectable, with failed calls preserved.
- Traders expose wallet relationships, PnL, win rate, volume and explicitly recorded closed positions. A sell is not automatically treated as a closed position.
- Original wallet IDs, chain/contract identity, launch/observation timestamps, fees and unsuccessful outcomes remain attached to the imported records. Historical fees do not fund the current wallet.
- Public demonstration creator contact is non-deliverable `example.invalid` data; advanced private evidence remains behind the existing API feature permissions.

## Screenshots

All new screens were captured at iPhone CSS viewport sizes and visually inspected. The summary screen’s scrolling/header paint issue was corrected; subsequent stages reset scroll and focus the new heading. Mobile primary setup actions remain reachable at the bottom of the viewport.

| Screen                      | Capture                                                                                             |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| Welcome                     | [393 × 852](onboarding-welcome-393.png)                                                             |
| Connection choices          | [Existing wallet](onboarding-connect-393.png)                                                       |
| Ownership challenge         | [393px](onboarding-verify-393.png) · [375px](onboarding-verify-375.png)                             |
| Discovery progress          | [Importing](onboarding-import-progress-393.png)                                                     |
| Inherited summary           | [18 launches / 145 SOL](onboarding-history-found-393.png)                                           |
| Original and failed records | [Inspectable records](onboarding-records-393.png)                                                   |
| New-wallet path             | [Empty history](onboarding-new-wallet-393.png)                                                      |
| Optional X linking          | [Link screen](onboarding-link-x-393.png) · [Simulated linked identity](onboarding-x-linked-393.png) |
| Personal historical profile | [Inherited profile](onboarding-inherited-profile-393.png)                                           |

## Verification

- `npm run typecheck` / production TypeScript validation: passed.
- `npm run lint`: passed.
- `npm run build`: passed; no new SDK/API dependency required.
- Full suite: **32 passed**, including existing functionality regression tests, all four requested user journeys, multi-wallet aggregation/selection, existing-browser balance preservation, token availability gating, evidence-based caller eligibility and no-real-auth discovery status.
- After the final screen-transition accessibility/paint correction, the 8 onboarding journey/accessibility tests passed again.
- New setup viewport checks: 393×852, 390×664 and 375×812. Existing wallet/responsive coverage retains 390×844, 393×660, tablet and desktop checks. No page-level horizontal overflow in tested routes.
- Automated WCAG A/AA checks cover Welcome, connection and verification screens plus the existing primary/research screens and wallet sheets.
- Browser: Chromium at iPhone CSS viewport sizes. Real iPhone Safari/VoiceOver and production-load testing remain necessary before financial release.

## Real versus simulated

**Real existing infrastructure:** React application, browser persistence, Node HTTP routes, HTTP-only signed demo sessions, CSRF/feature-permission checks, Git repository and existing Vercel hosting pipeline. The session API itself remains a demonstration, not production identity authentication.

**Simulated:** Browser/WalletConnect/SDK connection, wallet creation, ownership signature, history indexing, X linking, all financial figures, buys/sells/transfers/deposits, creator/caller/trader records, launch detection, notifications, milestones, introduction requests and paid entitlements. No actual X authentication, RPC signature verification, key generation/storage/export, production indexing, live token deployment, real funds or paid APIs.

No Deployment Protection was disabled. Live onboarding verification remains contingent on the Vercel connection authorising the existing project/team and the deployment URL being reachable through supported tooling.
