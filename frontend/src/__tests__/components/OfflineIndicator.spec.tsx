import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OfflineIndicator from '../../components/OfflineIndicator';

// Mock hooks
vi.mock('../../hooks/useOfflineStatus', () => ({
  useOfflineStatus: () => ({
    isOnline: false,
    pendingSyncCount: 2,
  }),
}));

describe('OfflineIndicator 组件', () => {
  it('应该在离线时显示离线指示器', () => {
    render(<OfflineIndicator />);
    expect(screen.getByText(/离线模式/)).toBeDefined();
  });

  it('应该显示待同步项数', () => {
    render(<OfflineIndicator />);
    expect(screen.getByText(/2 项待同步/)).toBeDefined();
  });
});
