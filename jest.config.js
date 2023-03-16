/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/**/*.spec.ts'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  moduleNameMapper: {
    '~/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/setup-tests.ts'],
  collectCoverage: true,
  coverageReporters: ['json', 'html'],
};
