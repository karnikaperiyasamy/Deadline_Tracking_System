module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/src/__tests__/setup.ts'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/setup.ts'],
};
