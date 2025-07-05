

// Mock fetch globally
global.fetch = jest.fn();

// Mock timers for better control
global.setTimeout = jest.fn((cb, ms) => {
  // Execute immediately in tests unless using fake timers
  if (jest.isMockFunction(global.setTimeout)) {
    return global.setTimeout.mock.calls.length;
  }
  return cb();
});

global.clearTimeout = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  fetch.mockClear();
  jest.clearAllTimers();
  jest.useRealTimers();
});

// Cleanup after tests
afterEach(() => {
  jest.restoreAllMocks();
});