module.exports = {
  projects: [
    {
      displayName: 'backend',
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
      testMatch: [
        '<rootDir>/tests/unit/backend/**/*.test.js',
        '<rootDir>/tests/integration/**/*.test.js',
        '<rootDir>/tests/acceptance/**/*.test.js'
      ],
      collectCoverageFrom: [
        'src/backend/**/*.js',
        '!**/node_modules/**',
        '!**/coverage/**'
      ],
      coverageDirectory: 'coverage/backend',
      coverageReporters: ['text', 'lcov', 'html'],
      verbose: true,
      testTimeout: 30000
    },
    {
      displayName: 'frontend',
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
      testMatch: [
        '<rootDir>/tests/unit/frontend/**/*.test.js'
      ],
      collectCoverageFrom: [
        'src/frontend/src/**/*.js',
        '!**/node_modules/**',
        '!**/coverage/**'
      ],
      coverageDirectory: 'coverage/frontend',
      coverageReporters: ['text', 'lcov', 'html'],
      verbose: true,
      testTimeout: 30000,
      transform: {
        '^.+\\.(js|jsx)$': 'babel-jest'
      },
      moduleDirectories: [
        'node_modules'
      ],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^react$': '<rootDir>/node_modules/react',
        '^react-dom$': '<rootDir>/node_modules/react-dom',
        '^react-router-dom$': '<rootDir>/tests/unit/frontend/__mocks__/react-router-dom.js'
      },
      transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$))'
      ],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.js', '<rootDir>/tests/unit/frontend/setup.js']
    }
  ]
};
