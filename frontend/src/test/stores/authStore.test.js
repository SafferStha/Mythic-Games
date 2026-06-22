import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem:    (key)        => store[key] ?? null,
    setItem:    (key, value) => { store[key] = String(value); },
    removeItem: (key)        => { delete store[key]; },
    clear:      ()           => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'dispatchEvent',  { value: vi.fn() });

// Import after mocking
import { useAuthStore } from '../../stores/authStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Reset store to initial state
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });

  it('initialises with no user', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('setUser authenticates the user', () => {
    const { result } = renderHook(() => useAuthStore());
    const user = { uid: 1, username: 'test', email: 'test@example.com', role: 'user', token: 'abc' };

    act(() => {
      result.current.setUser(user);
    });

    expect(result.current.user).toEqual(user);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('clearUser removes the user', () => {
    const { result } = renderHook(() => useAuthStore());
    const user = { uid: 1, username: 'test', email: 'test@example.com', role: 'user', token: 'abc' };

    act(() => { result.current.setUser(user); });
    act(() => { result.current.clearUser(); });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('isAdmin returns true for admin role', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setUser({ uid: 1, role: 'admin', token: 'abc' });
    });

    expect(result.current.isAdmin()).toBe(true);
    expect(result.current.isUser()).toBe(false);
  });

  it('isAdmin returns true for super_admin role', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setUser({ uid: 1, role: 'super_admin', token: 'abc' });
    });

    expect(result.current.isAdmin()).toBe(true);
    expect(result.current.isSuperAdmin()).toBe(true);
  });

  it('isAdmin returns false for regular user', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setUser({ uid: 1, role: 'user', token: 'abc' });
    });

    expect(result.current.isAdmin()).toBe(false);
    expect(result.current.isUser()).toBe(true);
  });

  it('token() returns the user token', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setUser({ uid: 1, role: 'user', token: 'my-jwt-token' });
    });

    expect(result.current.token()).toBe('my-jwt-token');
  });

  it('token() returns null when not authenticated', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.token()).toBeNull();
  });

  it('userId() returns uid from user object', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setUser({ uid: 10000001, role: 'user', token: 'abc' });
    });

    expect(result.current.userId()).toBe(10000001);
  });
});
