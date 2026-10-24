import { test as base, expect } from "@playwright/test";
/** Existing-flow regression tests represent an already-onboarded legacy demo browser. */
export const test = base.extend({
  page: async ({ page }, provide) => {
    await page.addInitScript(() => {
      if (!localStorage.getItem("aladdin-onboarding-v1"))
        localStorage.setItem(
          "aladdin-onboarding-v1",
          JSON.stringify({
            state: {
              completed: true,
              legacy: true,
              wallets: [],
              activeWalletId: null,
              xIdentity: null,
              launches: [],
              trades: [],
            },
            version: 0,
          }),
        );
    });
    await provide(page);
  },
});
export { expect };
