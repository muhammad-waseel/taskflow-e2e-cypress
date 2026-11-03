const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // Point at a local TaskFlow by default; override with CYPRESS_BASE_URL for other environments.
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:5000',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 8000,
    requestTimeout: 15000,
    retries: { runMode: 1, openMode: 0 },
    video: false,
    screenshotOnRunFailure: true,
  },
});
