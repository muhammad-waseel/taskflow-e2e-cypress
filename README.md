# TaskFlow E2E Test Framework (Cypress)

End-to-end tests for **[TaskFlow](https://github.com/muhammad-waseel/taskflow)**, my full-stack task manager. The tests drive a real browser through sign-up, login, task management, filters, search and sorting, and run in **Chrome and Firefox** on every push.

![E2E tests](https://github.com/muhammad-waseel/taskflow-e2e-cypress/actions/workflows/e2e.yml/badge.svg)
![Production smoke test](https://github.com/muhammad-waseel/taskflow-e2e-cypress/actions/workflows/smoke.yml/badge.svg)

- **App under test:** https://taskflow-waseel-eac0.onrender.com
- **App source:** https://github.com/muhammad-waseel/taskflow

## What's covered (38 tests)

| Spec | Tests | What it checks |
|---|---|---|
| `auth.cy.js` | 11 | Login screen, switching to sign-up, registration, duplicate email, 3 data-driven validation cases, login, wrong password, staying logged in after a reload, logout |
| `tasks.cy.js` | 13 | Empty state, title validation, 3 data-driven "add task" cases, complete and un-complete, edit, cancel edit, cancel delete, delete, overdue and "due today" badges, tasks kept after a reload |
| `filters.cy.js` | 10 | Stats, Active and Completed tabs, priority filter, case-insensitive search, empty state and clearing filters, combined filters, sort by priority and by due date, privacy between users |
| `smoke.cy.js` | 4 | Read-only production checks: health endpoint, app loads, bad login rejected, API protected |

## How it's built

- **Page Object Model:** `cypress/support/pages/AuthPage.js` and `DashboardPage.js` hold every selector and action, so the specs read like user stories and a UI change only needs fixing in one place.
- **Stable selectors:** every element is found by a `data-cy` attribute that I built into TaskFlow, never by CSS classes or text that could change.
- **Data-driven tests:** sign-up validation cases, new tasks and the filter data set come from `cypress/fixtures/tasks.json`.
- **Fast, independent setup:** custom commands (`cy.loginAsNewUser`, `cy.registerViaApi`, `cy.createTaskViaApi`) create a fresh user and data through the API, so every test starts clean and doesn't depend on the others.
- **Real stack in CI:** GitHub Actions checks out the TaskFlow repo, starts a throwaway in-memory MongoDB 8, builds and runs the app, then runs Cypress in both browsers in parallel. Screenshots of any failures are uploaded as artifacts.
- **Daily production smoke test:** a scheduled workflow runs read-only checks against the live app, so it never creates accounts or data in production.

## Project structure

```
cypress/
  e2e/            auth, tasks, filters and smoke specs
  fixtures/       test data (tasks.json)
  support/
    commands.js   custom commands
    pages/        Page Objects
scripts/
  start-mongo.js  in-memory MongoDB for local and CI runs
.github/workflows/
  e2e.yml         Chrome + Firefox on every push
  smoke.yml       daily read-only production check
```

## Run it locally

```bash
# 1. Install the tests
git clone https://github.com/muhammad-waseel/taskflow-e2e-cypress.git
cd taskflow-e2e-cypress
npm install

# 2. Start a test database (terminal 1)
npm run db:start

# 3. Start TaskFlow against it (terminal 2)
git clone https://github.com/muhammad-waseel/taskflow.git app
npm run install:all --prefix app && npm run build --prefix app
MONGO_URI=mongodb://127.0.0.1:27017/taskflow_e2e JWT_SECRET=dev AUTH_RATE_LIMIT=1000 npm start --prefix app

# 4. Run the tests (terminal 3)
npm test                 # headless, Electron
npm run test:chrome      # or test:firefox
npm run cy:open          # interactive runner
```

To run only the read-only smoke test against the live site:

```bash
CYPRESS_BASE_URL=https://taskflow-waseel-eac0.onrender.com npm run test:smoke
```

---

Built by **Muhammad Waseel**. [Portfolio](https://muhammad-waseel.github.io) · [LinkedIn](https://www.linkedin.com/in/muhammad-waseel-dev) · [GitHub](https://github.com/muhammad-waseel)
