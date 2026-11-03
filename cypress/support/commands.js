// Reusable building blocks for the TaskFlow tests.

const TOKEN_KEY = 'taskflow_token';

/** Select an element by its data-cy test hook. */
Cypress.Commands.add('getCy', (name, options) => cy.get(`[data-cy="${name}"]`, options));

/** A brand-new user with a unique email, so tests never clash. */
Cypress.Commands.add('newUser', (overrides = {}) => {
  const id = `${Date.now()}${Cypress._.random(1000, 9999)}`;
  return cy.wrap({
    name: 'Test User',
    email: `e2e.${id}@example.com`,
    password: 'Secret123!',
    ...overrides,
  });
});

/** Register through the API and return the JWT (fast setup, no UI). */
Cypress.Commands.add('registerViaApi', (user) =>
  cy
    .request('POST', '/api/auth/register', user)
    .its('body.token')
);

/** Create a fresh user and open the dashboard already logged in. */
Cypress.Commands.add('loginAsNewUser', (overrides = {}) =>
  cy.newUser(overrides).then((user) =>
    cy.registerViaApi(user).then((token) => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem(TOKEN_KEY, token);
        },
      });
      cy.getCy('welcome').should('be.visible');
      return cy.wrap({ user, token });
    })
  )
);

/** Create a task through the API for the given token. */
Cypress.Commands.add('createTaskViaApi', (token, task) =>
  cy
    .request({
      method: 'POST',
      url: '/api/tasks',
      headers: { Authorization: `Bearer ${token}` },
      body: task,
    })
    .its('body.task')
);

/** Format a Date as YYYY-MM-DD (the value a date input expects). */
Cypress.Commands.add('isoDate', (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const pad = (n) => String(n).padStart(2, '0');
  return cy.wrap(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
});
