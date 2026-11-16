import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:8082',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: false,
  },
  viewportWidth: 1280,
  viewportHeight: 800,
  video: true,
  screenshotOnRunFailure: true,
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'cypress/results/results-[hash].xml',
    toConsole: true,
  },
})
