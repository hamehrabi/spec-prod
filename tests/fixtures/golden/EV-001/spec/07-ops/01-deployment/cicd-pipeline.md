# CI/CD Pipeline Plan

> Source: Ch. 23 §23.4.
> CI/CD is a **repeatable path that checks your code before release**. The concept does not
> depend on any one platform — focus on the workflow, not the hosted service.

**The question every pipeline answers:** *what must pass before the code is allowed to move
forward?*

---

## Stages

| Stage | Question it answers | Example command | Gate |
|---|---|---|---|
| Install | Can the project dependencies be installed? | `[TODO: install command (Q-018)]` | No missing dependencies. |
| Lint | Does the code follow basic rules? | `[TODO: lint command (Q-018)]` | No blocking style or syntax errors. |
| Test | Does expected behavior still work? | `[TODO: test command (Q-018)]` | Unit / integration / e2e suites (03-tests/) all pass. |
| Fitness functions | Do the architecture drivers still hold? | `[TODO: fitness-function runner command (Q-018)]` | FF-001, FF-002, FF-003 pass (thresholds in fitness-functions.md). |
| Build | Can the app be packaged for release? | `[TODO: build/container command (Q-018)]` | Container image builds without errors. |
| Migrate | Are schema changes applied safely? | `[TODO: migrate command (Q-018)]` | Migration reversible (ADR-002), tested on staging-like data. |
| Smoke test | Does the app start and respond? | `[TODO: smoke command (Q-018)]` | Health endpoint / core page works. |
| Verify | Are logs and behavior correct? | manual + checklist | Smoke evidence captured. |

> The three fitness functions (FF-001 Simplicity/feasibility, FF-002 Reliability,
> FF-003 Accessibility) are defined in `01-docs/04-technical-spec/fitness-functions.md`
> and are **wired into CI as merge-blocking gates this round**. Cite them by id here; do
> not restate their thresholds — those live in that file.

---

## Your pipeline

```
1. Install:   [TODO: install command (Q-018)]
2. Lint:      [TODO: lint command (Q-018)]
3. Test:      [TODO: run unit/integration/e2e from 03-tests/ (Q-018)]
4. Fitness:   [TODO: run FF-001, FF-002, FF-003 — merge-blocking (Q-018)]
5. Build:     [TODO: build container image (Q-018)]
6. Migrate:   [TODO: apply reversible migrations — ADR-002 (Q-018)]
7. Deploy:    [TODO: deploy the container — target undecided (Q-017)]
8. Smoke:     [TODO: smoke against /health (Q-018)]
9. Monitor:   structured logs + error alerts (baseline; monitoring appetite deferred — Q-016)
```

---

## Quality gates by environment (Ch. 27 §27.9)

Environments are only partly decided (Q-015): local + production are known; a test
environment between them is undecided.

| Stage | Required action | Quality gate | Rollback trigger |
|---|---|---|---|
| Prepare | Confirm environment variables and data sources (`APP_ENV`, `DATABASE_URL`, `APP_SECRET`). | Config checklist complete. | Missing or invalid configuration. |
| Test | Run unit / integration / e2e suites (03-tests/) and the three fitness functions. | All required tests pass **and** FF-001, FF-002, FF-003 pass. | Any failing test or failing fitness function. |
| Migrate | Apply database changes. | Migration reversible (ADR-002) and tested on staging-like data. | Migration error or data mismatch. |
| Build | Build the deployment container. | Image builds; nothing SQLite-only (ADR-002). | Failing build or unsafe warning. |
| Release | Deploy the stateless container with logging enabled. | Health check and core route (REQ-F-004, generate one list) pass. | High error rate or broken core route. |
| Verify | Check behavior and logs. | Smoke evidence captured. | Wrong result or severe performance issue. |

---

## Rules

- **Do not merge failing checks** (Appendix L). FF-001, FF-002, FF-003 are merge-blocking.
- A test that is skipped to make the pipeline pass is a **finding**, not a fix.
- Migrations run *before* the code that depends on them (Ch. 23 §23.6), and every migration is reversible (ADR-002).
- Secrets come from the environment, never from the repository (`APP_SECRET`, `DATABASE_URL`).
- Every pipeline failure that reaches production becomes a new test
  (`../review/debugging-specification.md`).

---

## Local-only alternative

You do not need a hosted platform to get the benefit. A single script that runs the same
stages in order gives you the same gate:

```bash
#!/usr/bin/env bash
set -e
echo "== install ==" && <install command>
echo "== lint ==="   && <lint command>
echo "== test ==="   && <test command>
echo "== build =="   && <build command>
echo "== smoke ==="  && <smoke command>
echo "ALL GATES PASSED"
```

`set -e` makes the script stop at the first failure — that is the gate.

---

> Blueprint: blueprints/07-ops/01-deployment/cicd-pipeline.md
