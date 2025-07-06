// Mock fetch globally with a safe default
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: async () => ([]), // default empty array for safety
  })
);

// Mock timers
global.setTimeout = jest.fn((callback, ms) => {
  if (typeof callback === 'function') {
    callback();
  }
  return 1;
});
global.clearTimeout = jest.fn();

// AbortController mock
global.AbortController = jest.fn(() => ({
  abort: jest.fn(),
  signal: {
    aborted: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }
}));

// Reset mocks before each test
beforeEach(() => {
  fetch.mockReset();
  setTimeout.mockClear();
  clearTimeout.mockClear();
  jest.clearAllTimers();
  jest.useRealTimers();
});

// Cleanup after tests
afterEach(() => {
  jest.restoreAllMocks();
});
