import dashboard from '../support/pages/DashboardPage';

describe('Managing tasks', () => {
  beforeEach(() => {
    cy.loginAsNewUser();
  });

  it('shows an empty state for a new user', () => {
    dashboard.emptyState().should('contain', 'No tasks yet');
    dashboard.stat('total').should('have.text', '0');
  });

  it('will not add a task without a title', () => {
    cy.getCy('add-task').click();
    dashboard.formError().should('have.text', 'Please enter a task title');
    dashboard.items().should('have.length', 0);
  });

  // Data-driven: add every task from the fixture and check what appears.
  describe('adding tasks from fixture data', () => {
    beforeEach(function () {
      cy.fixture('tasks').then((data) => {
        this.tasks = data.newTasks;
      });
    });

    [0, 1, 2].forEach((i) => {
      it(`adds task #${i + 1} with its details`, function () {
        const t = this.tasks[i];
        const add = (due) => {
          dashboard.addTask({ title: t.title, description: t.description, priority: t.priority, due });
        };
        if (t.dueOffset === null) add();
        else cy.isoDate(t.dueOffset).then(add);

        dashboard.task(t.title).within(() => {
          cy.getCy('task-item-priority').should('have.text', t.priority);
          if (t.description) cy.getCy('task-item-description').should('have.text', t.description);
          if (t.dueOffset === null) cy.getCy('task-item-due').should('not.exist');
          else if (t.dueOffset === 1) cy.getCy('task-item-due').should('have.text', 'Due tomorrow');
          else cy.getCy('task-item-due').should('contain', 'Due');
        });
        dashboard.toast().should('have.text', 'Task added');
        dashboard.stat('total').should('have.text', '1');
      });
    });
  });

  it('marks a task complete and active again', () => {
    dashboard.addTask({ title: 'Finish unit tests' });
    dashboard.toggle('Finish unit tests');
    dashboard.task('Finish unit tests').should('have.class', 'done');
    dashboard.stat('completed').should('have.text', '1');
    dashboard.stat('active').should('have.text', '0');
    cy.contains('All caught up', { matchCase: false }).should('exist');

    dashboard.toggle('Finish unit tests');
    dashboard.task('Finish unit tests').should('not.have.class', 'done');
    dashboard.stat('active').should('have.text', '1');
  });

  it('edits a task title and priority', () => {
    dashboard.addTask({ title: 'Draft proposal', priority: 'low' });
    dashboard.edit('Draft proposal', { newTitle: 'Draft client proposal', priority: 'high' }).saveEdit();
    dashboard.task('Draft client proposal').within(() => {
      cy.getCy('task-item-priority').should('have.text', 'high');
    });
    dashboard.titles().should('not.contain', 'Draft proposal');
  });

  it('cancels an edit without saving changes', () => {
    dashboard.addTask({ title: 'Book flights' });
    dashboard.edit('Book flights', { newTitle: 'Something else' }).cancelEdit();
    dashboard.shouldShowTitles(['Book flights']);
  });

  it('keeps a task when delete is cancelled', () => {
    dashboard.addTask({ title: 'Call the bank' });
    dashboard.startDelete('Call the bank').keep('Call the bank');
    dashboard.shouldShowTitles(['Call the bank']);
  });

  it('deletes a task after confirming', () => {
    dashboard.addTask({ title: 'Old reminder' });
    dashboard.startDelete('Old reminder').confirmDelete('Old reminder');
    dashboard.toast().should('have.text', 'Task deleted');
    dashboard.emptyState().should('be.visible');
    dashboard.stat('total').should('have.text', '0');
  });

  it('flags overdue tasks and counts them', () => {
    cy.isoDate(-2).then((due) => {
      dashboard.addTask({ title: 'Submit expense claim', due });
    });
    dashboard.task('Submit expense claim').should('have.class', 'is-overdue');
    dashboard.task('Submit expense claim').find('[data-cy="task-item-due"]').should('contain', 'Overdue');
    dashboard.stat('overdue').should('have.text', '1');
  });

  it('labels a task due today', () => {
    cy.isoDate(0).then((due) => {
      dashboard.addTask({ title: 'Stand-up notes', due });
    });
    dashboard.task('Stand-up notes').find('[data-cy="task-item-due"]').should('have.text', 'Due today');
    dashboard.stat('overdue').should('have.text', '0');
  });

  it('keeps tasks after a page reload', () => {
    dashboard.addTask({ title: 'Persisted task' });
    cy.reload();
    dashboard.shouldShowTitles(['Persisted task']);
  });
});
