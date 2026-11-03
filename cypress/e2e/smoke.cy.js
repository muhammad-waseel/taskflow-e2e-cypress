// Read-only smoke checks. Safe to run against production: no accounts or data are created.
describe('Smoke test', { retries: 2 }, () => {
  it('reports a healthy API with a connected database', () => {
    cy.request('/api/health').its('body').should('include', { status: 'ok', db: 'connected' });
  });

  it('loads the app and shows the login form', () => {
    cy.visit('/');
    cy.title().should('contain', 'TaskFlow');
    cy.getCy('auth-form').should('be.visible');
  });

  it('rejects bad credentials', () => {
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: { email: 'nobody@example.com', password: 'not-a-real-password' },
      failOnStatusCode: false,
    }).its('status').should('eq', 401);
  });

  it('protects the tasks API', () => {
    cy.request({ url: '/api/tasks', failOnStatusCode: false }).its('status').should('eq', 401);
  });
});
