describe('数据验证', () => {
  describe('Email 验证', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    it('应该接受有效的 email 地址', () => {
      const validEmails = [
        'user@example.com',
        'test.user@example.co.uk',
        'user+tag@example.com',
      ];

      validEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    it('应该拒绝无效的 email 地址', () => {
      const invalidEmails = [
        'invalid.email',
        'user@',
        '@example.com',
        'user@.com',
      ];

      invalidEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe('用户名验证', () => {
    const validateUsername = (username: string): boolean => {
      if (typeof username !== 'string') return false;
      if (username.length < 3 || username.length > 20) return false;
      return /^[a-zA-Z0-9_-]+$/.test(username);
    };

    it('应该接受有效的用户名', () => {
      const validUsernames = ['user123', 'test_user', 'john-doe'];

      validUsernames.forEach((username) => {
        expect(validateUsername(username)).toBe(true);
      });
    });

    it('应该拒绝过短的用户名', () => {
      expect(validateUsername('ab')).toBe(false);
    });

    it('应该拒绝过长的用户名', () => {
      expect(validateUsername('a'.repeat(21))).toBe(false);
    });

    it('应该拒绝包含特殊字符的用户名', () => {
      const invalidUsernames = ['user@123', 'test user', 'user!name'];

      invalidUsernames.forEach((username) => {
        expect(validateUsername(username)).toBe(false);
      });
    });
  });

  describe('日期验证', () => {
    const isValidDate = (dateString: string): boolean => {
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date.getTime());
    };

    it('应该接受有效的日期字符串', () => {
      const validDates = [
        '2024-01-15',
        '2024-12-31',
        '2024-01-15T10:30:00Z',
      ];

      validDates.forEach((date) => {
        expect(isValidDate(date)).toBe(true);
      });
    });

    it('应该拒绝无效的日期字符串', () => {
      const invalidDates = [
        '2024-13-01',
        '2024-00-15',
        'invalid-date',
      ];

      invalidDates.forEach((date) => {
        expect(isValidDate(date)).toBe(false);
      });
    });
  });

  describe('数字验证', () => {
    const validateAmount = (amount: any): boolean => {
      const num = parseFloat(amount);
      return !isNaN(num) && num > 0;
    };

    it('应该接受正数金额', () => {
      expect(validateAmount(100)).toBe(true);
      expect(validateAmount('99.99')).toBe(true);
      expect(validateAmount(0.01)).toBe(true);
    });

    it('应该拒绝零和负数', () => {
      expect(validateAmount(0)).toBe(false);
      expect(validateAmount(-100)).toBe(false);
    });

    it('应该拒绝非数字值', () => {
      expect(validateAmount('abc')).toBe(false);
      expect(validateAmount(null)).toBe(false);
      expect(validateAmount(undefined)).toBe(false);
    });
  });
});
