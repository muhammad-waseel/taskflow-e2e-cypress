// Page Object for the login / sign-up screen.
class AuthPage {
  visit() {
    cy.visit('/');
    cy.getCy('auth-form').should('be.visible');
    return this;
  }

  title() {
    return cy.getCy('auth-title');
  }

  switchMode() {
    cy.getCy('auth-switch').click();
    return this;
  }

  goToSignUp() {
    this.title().then(($t) => {
      if ($t.text().includes('Welcome back')) this.switchMode();
    });
    this.title().should('contain', 'Create your account');
    return this;
  }

  fill({ name, email, password }) {
    const set = (field, value, opts) => {
      if (value === undefined) return;
      cy.getCy(field).clear();
      if (value !== '') cy.getCy(field).type(value, opts);
    };
    set('name-input', name);
    set('email-input', email);
    set('password-input', password, { log: false });
    return this;
  }

  submit() {
    cy.getCy('auth-submit').click();
    return this;
  }

  register(user) {
    return this.goToSignUp().fill(user).submit();
  }

  login({ email, password }) {
    return this.fill({ email, password }).submit();
  }

  error() {
    return cy.getCy('auth-error');
  }
}

export default new AuthPage();
