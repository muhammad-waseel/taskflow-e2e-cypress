import authPage from '../support/pages/AuthPage';
import dashboard from '../support/pages/DashboardPage';

describe('Authentication', () => {
  it('shows the login screen to logged-out visitors', () => {
    authPage.visit();
    authPage.title().should('have.text', 'Welcome back');
    cy.getCy('name-input').should('not.exist');
  });

  it('switches between log in and sign up', () => {
    authPage.visit().switchMode();
    authPage.title().should('have.text', 'Create your account');
    cy.getCy('name-input').should('be.visible');
    authPage.switchMode();
    authPage.title().should('have.text', 'Welcome back');
  });

  it('registers a new account and lands on the dashboard', () => {
    cy.newUser({ name: 'Sara Ahmed' }).then((user) => {
      authPage.visit().register(user);
      dashboard.welcome().should('contain', 'Hi Sara');
      cy.getCy('user-name').should('contain', 'Sara Ahmed');
      dashboard.emptyState().should('contain', 'No tasks yet');
    });
  });

  it('rejects an email that is already registered', () => {
    cy.newUser().then((user) => {
      cy.registerViaApi(user);
      authPage.visit().register(user);
      authPage.error().should('contain', 'already exists');
    });
  });

  // Data-driven: each invalid sign-up case comes from the fixture file.
  describe('sign-up validation', () => {
    beforeEach(function () {
      cy.fixture('tasks').then((data) => {
        this.cases = data.invalidSignups;
      });
    });

    ['missing name', 'invalid email', 'short password'].forEach((name) => {
      it(`shows an error for ${name}`, function () {
        const c = this.cases.find((x) => x.case === name);
        authPage.visit().register(c);
        authPage.error().should('have.text', c.message);
        dashboard.welcome().should('not.exist');
      });
    });
  });

  it('logs in with valid credentials', () => {
    cy.newUser({ name: 'Bilal Khan' }).then((user) => {
      cy.registerViaApi(user);
      authPage.visit().login(user);
      dashboard.welcome().should('contain', 'Hi Bilal');
    });
  });

  it('shows an error for a wrong password', () => {
    cy.newUser().then((user) => {
      cy.registerViaApi(user);
      authPage.visit().login({ email: user.email, password: 'WrongPass1' });
      authPage.error().should('have.text', 'Invalid email or password');
    });
  });

  it('keeps the user logged in after a page reload', () => {
    cy.loginAsNewUser({ name: 'Ayesha Noor' });
    cy.reload();
    dashboard.welcome().should('contain', 'Hi Ayesha');
  });

  it('logs out and returns to the login screen', () => {
    cy.loginAsNewUser();
    dashboard.logout();
    authPage.title().should('have.text', 'Welcome back');
    cy.window().its('localStorage').invoke('getItem', 'taskflow_token').should('be.null');
    cy.reload();
    cy.getCy('auth-form').should('be.visible');
  });
});
