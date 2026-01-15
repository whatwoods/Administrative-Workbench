import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('认证服务', () => {
  describe('密码哈希', () => {
    it('应该正确哈希密码', async () => {
      const password = 'testPassword123';
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);

      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it('应该能验证哈希密码', async () => {
      const password = 'testPassword123';
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);

      const isMatch = await bcryptjs.compare(password, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('应该拒绝错误的密码', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);

      const isMatch = await bcryptjs.compare(wrongPassword, hashedPassword);
      expect(isMatch).toBe(false);
    });
  });

  describe('JWT 令牌', () => {
    const secret = 'test-secret-key';

    it('应该生成有效的 JWT 令牌', () => {
      const payload = { userId: '123', username: 'testuser' };
      const token = jwt.sign(payload, secret, { expiresIn: '7d' });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('应该能解码有效的 JWT 令牌', () => {
      const payload = { userId: '123', username: 'testuser' };
      const token = jwt.sign(payload, secret, { expiresIn: '7d' });

      const decoded = jwt.verify(token, secret) as any;
      expect(decoded.userId).toBe('123');
      expect(decoded.username).toBe('testuser');
    });

    it('应该拒绝过期的令牌', () => {
      const payload = { userId: '123', username: 'testuser' };
      const token = jwt.sign(payload, secret, { expiresIn: '-1h' });

      expect(() => {
        jwt.verify(token, secret);
      }).toThrow();
    });

    it('应该拒绝无效的签名', () => {
      const payload = { userId: '123', username: 'testuser' };
      const token = jwt.sign(payload, secret, { expiresIn: '7d' });

      expect(() => {
        jwt.verify(token, 'wrong-secret-key');
      }).toThrow();
    });
  });
});
