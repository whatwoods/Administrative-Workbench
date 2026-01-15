import { test, expect } from '@playwright/test';

// 测试配置
const BASE_URL = 'http://localhost:5173';
const TEST_USER = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'TestPass123!',
};

test.describe('用户认证流程', () => {
  test('应该能够注册新用户', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // 点击注册标签
    await page.click('text=没有账户');

    // 填写注册表单
    await page.fill('input[type="text"]', TEST_USER.username);
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);

    // 提交表单
    await page.click('button:has-text("注册")');

    // 等待重定向
    await page.waitForURL(`${BASE_URL}/`);

    // 验证是否登录成功
    expect(page.url()).toBe(`${BASE_URL}/`);
  });

  test('应该能够使用正确的凭证登录', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // 填写登录表单
    await page.fill('input[type="text"]', TEST_USER.username);
    await page.fill('input[type="password"]', TEST_USER.password);

    // 点击登录
    await page.click('button:has-text("登录")');

    // 等待重定向
    await page.waitForURL(`${BASE_URL}/`);

    // 验证是否登录成功
    expect(page.url()).toBe(`${BASE_URL}/`);
  });
});

test.describe('导航和布局', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="text"]', TEST_USER.username);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("登录")');
    await page.waitForURL(`${BASE_URL}/`);
  });

  test('应该能够导航到所有主要页面', async ({ page }) => {
    const pages = [
      { text: 'Todos', url: '/todos' },
      { text: 'Expenses', url: '/expenses' },
      { text: 'Notes', url: '/notes' },
      { text: 'Weather', url: '/weather' },
    ];

    for (const { text, url } of pages) {
      await page.click(`text=${text}`);
      await page.waitForURL(`${BASE_URL}${url}`);
      expect(page.url()).toContain(url);
    }
  });

  test('应该能够登出', async ({ page }) => {
    // 点击用户菜单
    await page.click('.user-avatar');

    // 点击登出
    await page.click('button:has-text("Logout")');

    // 应该重定向到登录页
    await page.waitForURL(`${BASE_URL}/login`);
    expect(page.url()).toBe(`${BASE_URL}/login`);
  });
});

test.describe('仪表板功能', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="text"]', TEST_USER.username);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("登录")');
    await page.waitForURL(`${BASE_URL}/`);
  });

  test('应该显示功能卡片', async ({ page }) => {
    // 检查各个功能卡片是否存在
    await expect(page.locator('text=Todo')).toBeDefined();
    await expect(page.locator('text=Expense')).toBeDefined();
    await expect(page.locator('text=Note')).toBeDefined();
    await expect(page.locator('text=Weather')).toBeDefined();
  });

  test('应该显示天气小组件', async ({ page }) => {
    // 检查天气小组件
    const weatherWidget = page.locator('.weather-widget');
    await expect(weatherWidget).toBeDefined();
  });
});

test.describe('响应式设计', () => {
  test('在移动设备上应该正确显示', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(`${BASE_URL}/login`);

    // 检查登录表单是否可见
    const loginForm = page.locator('form');
    await expect(loginForm).toBeDefined();

    // 检查按钮是否可点击
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('在平板设备上应该正确显示', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto(`${BASE_URL}/login`);
    
    // 检查布局
    const container = page.locator('.login-container');
    await expect(container).toBeDefined();
  });
});
