'use strict';

jest.mock('../../src/repositories/userRepository');
jest.mock('../../src/repositories/adminRepository');
jest.mock('../../src/repositories/tokenRepository');

const userRepository  = require('../../src/repositories/userRepository');
const adminRepository = require('../../src/repositories/adminRepository');
const tokenRepository = require('../../src/repositories/tokenRepository');
const authService     = require('../../src/services/authService');

// ── Fixtures ──────────────────────────────────────────────────────────────────

const hashedPassword = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCMGmJkFjfKCrSmFkz2HYCW';

const baseUser = {
  uid:        10000001,
  username:   'testuser',
  email:      'testuser@example.com',
  password:   hashedPassword,
  role:       'user',
  status:     'active',
  created_at: new Date().toISOString(),
  updated_at: null,
};

// ── register ──────────────────────────────────────────────────────────────────

describe('authService.register', () => {
  beforeEach(() => {
    userRepository.findByEmailOrUsername.mockResolvedValue(null);
    adminRepository.findByEmailOrUsername.mockResolvedValue(null);
    userRepository.create.mockResolvedValue(baseUser);
    tokenRepository.save.mockResolvedValue(undefined);
  });

  it('returns user + token pair on successful registration', async () => {
    const result = await authService.register({
      username: 'testuser',
      email:    'testuser@example.com',
      password: 'Password123!',
    });

    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result.user.username).toBe('testuser');
    expect(result.user).not.toHaveProperty('password');
  });

  it('throws 409 conflict when email already taken', async () => {
    userRepository.findByEmailOrUsername.mockResolvedValue(baseUser);

    await expect(authService.register({
      username: 'testuser',
      email:    'testuser@example.com',
      password: 'Password123!',
    })).rejects.toMatchObject({ statusCode: 409, code: 'AUTH_DUPLICATE' });
  });

  it('saves a refresh token to the store', async () => {
    await authService.register({
      username: 'newuser',
      email:    'new@example.com',
      password: 'Password123!',
    });

    expect(tokenRepository.save).toHaveBeenCalledTimes(1);
  });
});

// ── login ─────────────────────────────────────────────────────────────────────

describe('authService.login', () => {
  beforeEach(() => {
    adminRepository.findByLoginIdentifier.mockResolvedValue(null);
  });

  it('throws 401 when neither user nor admin exists', async () => {
    userRepository.findByLoginIdentifier.mockResolvedValue(null);

    await expect(authService.login({
      identifier: 'ghost@example.com',
      password:   'any',
    })).rejects.toMatchObject({ statusCode: 401, code: 'AUTH_INVALID_CREDENTIALS' });
  });

  it('throws 403 when account is inactive', async () => {
    userRepository.findByLoginIdentifier.mockResolvedValue({ ...baseUser, status: 'inactive' });

    await expect(authService.login({
      identifier: 'testuser@example.com',
      password:   'Password123!',
    })).rejects.toMatchObject({ statusCode: 403, code: 'AUTH_ACCOUNT_INACTIVE' });
  });

  it('throws 401 for wrong password', async () => {
    userRepository.findByLoginIdentifier.mockResolvedValue(baseUser);

    await expect(authService.login({
      identifier: 'testuser@example.com',
      password:   'WrongPassword!',
    })).rejects.toMatchObject({ statusCode: 401, code: 'AUTH_INVALID_CREDENTIALS' });
  });
});

// ── refreshAccessToken ────────────────────────────────────────────────────────

describe('authService.refreshAccessToken', () => {
  it('throws 401 when refresh token not found', async () => {
    tokenRepository.findValid.mockResolvedValue(null);

    await expect(authService.refreshAccessToken('invalid-token'))
      .rejects.toMatchObject({ statusCode: 401, code: 'AUTH_TOKEN_INVALID' });
  });

  it('throws 401 when user account is inactive', async () => {
    tokenRepository.findValid.mockResolvedValue({ user_id: 10000001, user_type: 'user' });
    userRepository.findById.mockResolvedValue({ ...baseUser, status: 'inactive' });

    await expect(authService.refreshAccessToken('some-token'))
      .rejects.toMatchObject({ statusCode: 401, code: 'AUTH_ACCOUNT_INACTIVE' });
  });

  it('returns a new access token for a valid refresh token', async () => {
    tokenRepository.findValid.mockResolvedValue({ user_id: 10000001, user_type: 'user' });
    userRepository.findById.mockResolvedValue(baseUser);

    const result = await authService.refreshAccessToken('valid-token');

    expect(result).toHaveProperty('accessToken');
    expect(typeof result.accessToken).toBe('string');
  });
});

// ── logout ────────────────────────────────────────────────────────────────────

describe('authService.logout', () => {
  it('calls tokenRepository.revoke with the provided token', async () => {
    tokenRepository.revoke.mockResolvedValue(undefined);

    await authService.logout('some-refresh-token');

    expect(tokenRepository.revoke).toHaveBeenCalledWith('some-refresh-token');
  });

  it('is a no-op when no refresh token provided', async () => {
    await authService.logout(undefined);
    expect(tokenRepository.revoke).not.toHaveBeenCalled();
  });
});
