import { defineConfig, devices } from '@playwright/test';

/**
 * 参考: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* 在测试中最长运行时间 */
  timeout: 30 * 1000,
  expect: {
    /**
     * 最长等待时间
     */
    timeout: 5000,
  },
  /* 并行运行数 */
  fullyParallel: true,
  /* 失败时停止 */
  forbidOnly: !!process.env.CI,
  /* 重试次数 */
  retries: process.env.CI ? 2 : 0,
  /* 工作进程数 */
  workers: process.env.CI ? 1 : undefined,
  /* 报告器 */
  reporter: 'html',
  /* 共享设置 */
  use: {
    /* 基础 URL */
    baseURL: 'http://localhost:5173',
    /* 收集跟踪 */
    trace: 'on-first-retry',
    /* 截图 */
    screenshot: 'only-on-failure',
  },

  /* 在所有项目之前运行一次 */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:5173',
  //   reuseExistingServer: !process.env.CI,
  // },

  /* 配置项目 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* 针对移动浏览器的测试 */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
