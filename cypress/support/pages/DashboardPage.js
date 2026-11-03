// Page Object for the TaskFlow dashboard.
class DashboardPage {
  welcome() {
    return cy.getCy('welcome');
  }

  logout() {
    cy.getCy('logout').click();
    return this;
  }

  // ---- creating tasks ----
  addTask({ title, description, priority, due }) {
    cy.getCy('task-title').clear().type(title);
    if (description) cy.getCy('task-description').type(description);
    if (priority) cy.getCy('task-priority').select(priority);
    if (due) cy.getCy('task-due').type(due);
    cy.getCy('add-task').click();
    if (title.trim()) this.task(title).should('exist');
    return this;
  }

  formError() {
    return cy.getCy('task-error');
  }

  // ---- task list ----
  task(title) {
    return cy.contains('[data-cy="task-item"]', title);
  }

  titles() {
    return cy.get('[data-cy="task-item-title"]');
  }

  items() {
    return cy.get('[data-cy="task-item"]');
  }

  toggle(title) {
    this.task(title).find('[data-cy="task-toggle"]').click();
    return this;
  }

  edit(title, { newTitle, priority, description }) {
    this.task(title).find('[data-cy="task-edit"]').click();
    cy.getCy('edit-form').within(() => {
      if (newTitle !== undefined) cy.getCy('edit-title').clear().type(newTitle);
      if (priority) cy.getCy('edit-priority').select(priority);
      if (description !== undefined) cy.getCy('edit-description').clear().type(description);
    });
    return this;
  }

  saveEdit() {
    cy.getCy('edit-save').click();
    return this;
  }

  cancelEdit() {
    cy.getCy('edit-cancel').click();
    return this;
  }

  startDelete(title) {
    this.task(title).find('[data-cy="task-delete"]').click();
    return this;
  }

  confirmDelete(title) {
    this.task(title).find('[data-cy="confirm-delete"]').click();
    return this;
  }

  keep(title) {
    this.task(title).find('[data-cy="cancel-delete"]').click();
    return this;
  }

  emptyState() {
    return cy.getCy('empty-state');
  }

  toast() {
    return cy.getCy('toast');
  }

  // ---- stats ----
  stat(name) {
    return cy.getCy(`stat-${name}`).find('.stat-value');
  }

  // ---- filters ----
  showStatus(status) {
    cy.getCy(`filter-${status}`).click();
    return this;
  }

  search(text) {
    cy.getCy('filter-search').clear();
    if (text) cy.getCy('filter-search').type(text);
    return this;
  }

  filterPriority(value) {
    cy.getCy('filter-priority').select(value);
    return this;
  }

  sortBy(value) {
    cy.getCy('filter-sort').select(value);
    return this;
  }

  clearFilters() {
    cy.getCy('filter-reset').click();
    return this;
  }

  /** Assert the visible task titles, in order. */
  shouldShowTitles(expected) {
    if (expected.length === 0) {
      this.emptyState().should('be.visible');
      return this;
    }
    this.titles().should(($els) => {
      expect([...$els].map((e) => e.textContent.trim())).to.deep.equal(expected);
    });
    return this;
  }
}

export default new DashboardPage();
