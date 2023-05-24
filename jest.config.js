// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  clearMocks: true,
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageProvider: 'v8',
  maxWorkers: 1,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', 'dist', '.eslintrc.js', './src/shared/__tests__/support'],
};
