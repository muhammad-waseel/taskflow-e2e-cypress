import './commands';

// Start every test logged out with a clean browser.
beforeEach(() => {
  cy.clearLocalStorage();
});
