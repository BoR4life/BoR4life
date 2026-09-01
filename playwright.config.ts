import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

const SANDBOX_CHROMIUM = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

function resolveChromium(): string | undefined {
  if (process.env.PLAYWRIGHT_CHROMIUM_PATH) return process.env.PLAYWRIGHT_CHROMIUM_PATH;
  if (existsSync(SANDBOX_CHROMIUM)) return SANDBOX_CHROMIUM;
  return undefined;
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Three places this runs, three different browsers:
        //   - the remote dev sandbox ships a pinned Chromium at a fixed
        //     path and forbids downloading another, so use it when present;
        //   - CI installs Playwright's own managed Chromium, and must be
        //     left to find it — a hard-coded sandbox path there launched
        //     nothing and failed all 54 browser tests on the first run;
        //   - PLAYWRIGHT_CHROMIUM_PATH overrides both, for anything else.
        // executablePath is therefore set only when there is a binary to
        // set it to. Undefined means "Playwright's default", which is the
        // only correct answer on a machine that is not this sandbox.
        launchOptions: {
          executablePath: resolveChromium(),
        },
      },
    },
  ],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
