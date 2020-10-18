export default {
  preset: '@shelf/jest-mongodb',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageReporters: ['text', 'lcov'],
};
