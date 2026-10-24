# Aladdin Social mobile review

## Audit of the previous experience

Inspected the running application at 393 × 852 before replacing the root screen and navigation. The previous Home was a social feed: no balance or holdings were visible, creator/caller/trader lists occupied the bottom navigation, feed tabs clipped horizontally, and visible contract/social controls measured approximately 14–35px high. The app had no opening wallet journey.

[Previous mobile Home](mobile-before-393.png) · [Current Wallet Home](wallet-home-393.png)

## Shared design system

- Flat dark application surfaces (`#0d1015`), restrained warm-gold actions (`#dfc89c`), readable secondary text, green/red financial outcomes.
- Four/eight-unit spacing rhythm with consistent mobile screen gutters. No sidebar on any primary screen; desktop retains the same five product areas.
- 48px mobile balance, 15px asset names and values, 12px holding metadata, tabular monetary figures. Fractional token prices retain meaningful decimal precision.
- At least 44px primary touch targets; wallet action buttons measure about 80px high. Fixed five-tab navigation with safe-area padding.
- Asset rows and dividers rather than dashboard cards. No portfolio chart, promotional banner or marketing content on Wallet Home. One relevant chart is retained in token details.
- Shared bottom-sheet/dialog with keyboard focus handling, Escape dismissal, visible focus states, and explicit review/confirmation. Screen transitions use a short translation and respect reduced-motion settings; an initial opacity fade was removed to preserve text contrast.

Phantom/Fomo informed interaction priorities—balance first, scannable holdings, reachable controls, contextual research and transaction review. Their branding/assets were not copied, and no claim is made of pixel-matching their current applications.

## Home first, then connected screens

Wallet Home was integrated and captured before activating the new token/discovery/people/profile routes. It was corrected for holding precision, quantity privacy, an icon wrapping onto its own line, misleading wallet-account navigation, and missing QR alternative text. Home, local funding persistence and Home/Receive accessibility checks passed before progressing to the other screens.

Then the same system was applied to token details and reviewed simulations, followed by reputation/discovery/alerts. Existing social state, post baselines, ranking calculations, identity models, permission API and notification delivery logic were preserved. The modal was extracted into a shared component; wallet state was added independently of social state.

## Visual captures

| Screen                          | Capture                                     |
| ------------------------------- | ------------------------------------------- |
| Wallet Home, 393 × 852          | [Home](wallet-home-393.png)                 |
| Wallet Home, 390 × 844          | [Home](wallet-home-390.png)                 |
| Wallet Home, 375 × 812          | [Home](wallet-home-375.png)                 |
| Short iPhone browser, 393 × 660 | [Browser Home](wallet-home-browser-393.png) |
| Short iPhone browser, 390 × 664 | [Browser Home](wallet-home-browser-390.png) |
| Receive preview                 | [Receive sheet](wallet-receive-393.png)     |
| Asset research and Buy/Sell     | [Token detail](mobile-asset-393.png)        |
| Trade review                    | [Buy review](mobile-buy-review-393.png)     |
| Discover                        | [Discover](mobile-discover-393.png)         |
| Creator reputation              | [People](mobile-people-393.png)             |
| Caller reputation               | [Callers](mobile-callers-393.png)           |
| Alerts                          | [Alerts](mobile-alerts-393.png)             |
| Personal profile                | [Profile](mobile-profile-393.png)           |

On full-height phone viewports all three initial holdings fit above the fixed tab bar. On shorter browser viewports assets remain reachable through normal scrolling and open their details without tab-bar interception. Captures wait for screen transitions and relevant charts to render.

## Checks and limits

- Production build, strict TypeScript and lint pass.
- Full 20-test suite passed, followed by all six wallet-flow/Home tests after the final success-button wording correction and an additional short-browser-viewport regression check.
- Tests cover validation and review, local ledger updates/persistence, insufficient balances, unsupported cross-chain trading, identity participation, discovery/follow/alerts, failed caller outcomes, posting, X intent construction, backend feature permissions and independent serverless instances.
- Automated WCAG A/AA scans passed on nine core/supporting desktop screens, all six primary/research mobile screens plus caller mode, and the Home/Receive flow. No device-level accessibility certification is claimed.
- Responsive route checks at 1536, 834 and 390px wide passed without page-level horizontal overflow or uncaught browser errors.
- Browser automation uses Chromium at iPhone CSS viewport sizes, not a real iPhone or Safari. Real-device testing remains necessary before production release.
- This is a functional application prototype, not a production financial wallet: no private keys, custody, transfers, order routing, payments, bridges, live prices, or live notifications. All wallet actions are explicitly labelled simulations; Receive uses a non-payment URI.

The requested new `aladdin-social` Vercel project still does not exist in the connected account. The previous project-creation attempt was rejected with HTTP 403, and the existing `aladdin-ui` project has not been changed.
