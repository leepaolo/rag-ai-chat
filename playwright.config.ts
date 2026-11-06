import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;

export default defineConfig({
  testDir: "./e2e",
  // Every answer costs an embedding call plus (for in-domain questions) an LLM call.
  timeout: 60_000,
  expect: { timeout: 30_000 },
  workers: 2,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: `http://localhost:${PORT}/assistente`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
