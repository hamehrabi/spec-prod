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
| Install | Can the project dependencies be installed? | decided with TASK-001's stack | No missing dependencies. |
| Lint | Does the code follow basic rules? | decided with TASK-001 | No blocking style or syntax errors. |
| Test | Does expected behavior still work? | one command over `03-tests/05-executable` | All required tests pass. |
| Build | Can the app be packaged for release? | container build (Round 8 posture) | Build completes without errors. |
| Migrate | Are schema changes applied safely? | decided with TASK-001 | Migration tested on staging-like data. |
| Smoke test | Does the app start and respond? | the smoke script against `/health` | Basic endpoint or page works. |
| Verify | Are metrics, permissions, and logs correct? | manual + checklist | Smoke evidence captured. |

The concrete commands are fixed by TASK-001's stack choice; the stages and their gates are
fixed now, which is the part that must not drift.

---

## Your pipeline

```
1. Install:   decided with TASK-001
2. Lint:      decided with TASK-001
3. Test:      the whole 03-tests/05-executable tree, one command
4. Build:     container image build (deployment target open — Q-018)
5. Migrate:   schema first, then code (database-migration-plan.md)
6. Deploy:    [TODO: where will this run? — Q-018]
7. Smoke:     production smoke test, end-to-end-tests.md
8. Monitor:   [TODO: what is your monitoring appetite? — Q-020]
```

---

## Quality gates by environment (Ch. 27 §27.9)

| Stage | Required action | Quality gate | Rollback trigger |
|---|---|---|---|
| Prepare | Confirm environment variables and data sources. | Config checklist complete. | Missing or invalid configuration. |
| Migrate | Apply database changes. | Migration tested on staging data. | Migration error or data mismatch. |
| Build | Run tests and create the deployment package. | All required tests pass. | Failing test or unsafe warning. |
| Release | Deploy with monitoring enabled. | Health checks and core route pass. | High error rate or broken core route. |
| Verify | Check data accuracy, permissions, and logs. | Smoke test evidence captured. | Data leak risk, wrong result, or severe performance issue. |

---

## Rules

- **Do not merge failing checks** (Appendix L).
- A test that is skipped to make the pipeline pass is a **finding**, not a fix.
- Migrations run *before* the code that depends on them (Ch. 23 §23.6).
- Secrets come from the environment, never from the repository.
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

`set -e` makes the script stop at the first failure — that is the gate. For a one-person
project with an undecided host, this script **is** the pipeline until Q-018 is answered.

> Blueprint: blueprints/07-ops/01-deployment/cicd-pipeline.md
