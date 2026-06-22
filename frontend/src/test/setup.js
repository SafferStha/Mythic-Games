import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Axios globally
vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn(() => mockAxios),
    get:     vi.fn(),
    post:    vi.fn(),
    patch:   vi.fn(),
    put:     vi.fn(),
    delete:  vi.fn(),
    interceptors: {
      request:  { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
    defaults: { baseURL: '' },
  };
  return { default: mockAxios };
});

// Mock framer-motion (avoids animation side-effects in tests)
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_t, tag) => {
      const React = require('react');
      return ({ children, ...props }) =>
        React.createElement(tag, props, children);
    },
  }),
  AnimatePresence: ({ children }) => children,
  useAnimation:    () => ({ start: vi.fn(), stop: vi.fn() }),
  useInView:       () => [vi.fn(), false],
}));

// Mock react-router-dom navigation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
    useParams:   () => ({}),
  };
});

// Mock sonner toasts
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error:   vi.fn(),
    info:    vi.fn(),
    warning: vi.fn(),
  },
  Toaster: () => null,
}));

// Suppress console.error for React rendering warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) return;
    originalError(...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
