// 测试设置文件
// 可以在这里配置全局的测试钩子和模拟

beforeAll(() => {
  // 关闭数据库连接日志
  console.log = jest.fn();
});

afterAll(() => {
  jest.restoreAllMocks();
});
