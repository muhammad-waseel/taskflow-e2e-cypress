import dashboard from '../support/pages/DashboardPage';

// Seeds the same four tasks (via the API) before each test, then checks filters, search and sorting.
describe('Filtering, searching and sorting', () => {
  beforeEach(() => {
    cy.fixture('tasks').then(({ filterSet }) => {
      cy.newUser().then((user) =>
        cy.registerViaApi(user).then((token) => {
          filterSet.forEach((t) => {
            const create = (dueDate) =>
              cy.createTaskViaApi(token, { title: t.title, priority: t.priority, dueDate }).then((task) => {
                if (t.completed) {
                  cy.request({
                    method: 'PATCH',
                    url: `/api/tasks/${task.id}`,
                    headers: { Authorization: `Bearer ${token}` },
                    body: { completed: true },
                  });
                }
              });
            if (t.dueOffset === null) create(null);
            else cy.isoDate(t.dueOffset).then(create);
          });
          cy.visit('/', { onBeforeLoad: (win) => win.localStorage.setItem('taskflow_token', token) });
        })
      );
    });
    dashboard.items().should('have.length', 4);
  });

  it('shows correct stats for the seeded tasks', () => {
    dashboard.stat('total').should('have.text', '4');
    dashboard.stat('active').should('have.text', '3');
    dashboard.stat('completed').should('have.text', '1');
    dashboard.stat('overdue').should('have.text', '1');
  });

  it('shows only active tasks', () => {
    dashboard.showStatus('active');
    dashboard.items().should('have.length', 3);
    dashboard.titles().should('not.contain', 'Read React docs');
  });

  it('shows only completed tasks', () => {
    dashboard.showStatus('completed');
    dashboard.shouldShowTitles(['Read React docs']);
  });

  it('filters by priority', () => {
    dashboard.filterPriority('high');
    dashboard.items().should('have.length', 2).each(($el) => {
      cy.wrap($el).find('[data-cy="task-item-priority"]').should('have.text', 'high');
    });
  });

  it('searches task titles, ignoring case', () => {
    dashboard.search('DEMO');
    dashboard.shouldShowTitles(['Prepare client demo']);
  });

  it('shows a helpful empty state and clears filters', () => {
    dashboard.search('zzz-no-match');
    dashboard.emptyState().should('contain', 'No tasks match your filters');
    dashboard.clearFilters();
    dashboard.items().should('have.length', 4);
    cy.getCy('filter-search').should('have.value', '');
  });

  it('combines status and priority filters', () => {
    dashboard.showStatus('active').filterPriority('medium');
    dashboard.shouldShowTitles(['Pay electricity bill']);
  });

  it('sorts by priority (high to low)', () => {
    dashboard.sortBy('priority');
    cy.get('[data-cy="task-item-priority"]').should(($els) => {
      expect([...$els].map((e) => e.textContent.trim())).to.deep.equal(['high', 'high', 'medium', 'low']);
    });
  });

  it('sorts by due date with undated tasks last', () => {
    dashboard.sortBy('due');
    dashboard.shouldShowTitles(['Pay electricity bill', 'Send weekly report', 'Prepare client demo', 'Read React docs']);
  });

  it("never shows another user's tasks", () => {
    cy.loginAsNewUser();
    dashboard.emptyState().should('contain', 'No tasks yet');
    dashboard.stat('total').should('have.text', '0');
  });
});
