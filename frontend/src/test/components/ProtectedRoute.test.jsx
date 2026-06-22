import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';

// Mock auth utilities
vi.mock('../../utils/auth', () => ({
  getStoredUser: vi.fn(),
}));

import { getStoredUser } from '../../utils/auth';

const Protected = ({ allowedRoles }) => (
  <MemoryRouter initialEntries={['/dashboard']}>
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div data-testid="protected-content">Protected Content</div>
    </ProtectedRoute>
  </MemoryRouter>
);

describe('ProtectedRoute', () => {
  beforeEach(() => {
    getStoredUser.mockReset();
  });

  it('redirects to /login when not authenticated', () => {
    getStoredUser.mockReturnValue(null);

    const { container } = render(<Protected />);
    // React Router Navigate will redirect — no protected content shown
    expect(screen.queryByTestId('protected-content')).toBeNull();
  });

  it('renders children when authenticated (no role restriction)', () => {
    getStoredUser.mockReturnValue({ uid: 1, role: 'user', token: 'abc' });

    render(<Protected />);
    expect(screen.getByTestId('protected-content')).toBeDefined();
  });

  it('renders children when user has the required role', () => {
    getStoredUser.mockReturnValue({ uid: 1, role: 'admin', token: 'abc' });

    render(<Protected allowedRoles={['admin', 'super_admin']} />);
    expect(screen.getByTestId('protected-content')).toBeDefined();
  });

  it('redirects when user does not have required role', () => {
    getStoredUser.mockReturnValue({ uid: 1, role: 'user', token: 'abc' });

    render(<Protected allowedRoles={['admin', 'super_admin']} />);
    expect(screen.queryByTestId('protected-content')).toBeNull();
  });

  it('allows super_admin when admin is required', () => {
    getStoredUser.mockReturnValue({ uid: 1, role: 'super_admin', token: 'abc' });

    render(<Protected allowedRoles={['admin', 'super_admin']} />);
    expect(screen.getByTestId('protected-content')).toBeDefined();
  });

  it('accepts role as a string (not array)', () => {
    getStoredUser.mockReturnValue({ uid: 1, role: 'user', token: 'abc' });

    render(<Protected allowedRoles="user" />);
    expect(screen.getByTestId('protected-content')).toBeDefined();
  });
});
