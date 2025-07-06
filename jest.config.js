module.exports = {
  setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js',
    // Exclude demo folders
    '!**/demo/**',
    '!**/docs/**',
    '!**/examples/**'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/demo/',
    '/docs/',
    '/examples/'
  ],
  moduleFileExtensions: ['js', 'json'],
  verbose: true,
  testTimeout: 10000,
  // Transform ES modules
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  // Handle ES module imports
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};