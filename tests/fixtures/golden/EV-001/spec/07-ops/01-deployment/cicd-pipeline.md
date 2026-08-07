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
| Install | Can the project dependencies be installed? | install for the chosen stack | No missing dependencies. |
| Lint | Does the code follow basic rules? | run the linter | No blocking style or syntax errors. |
| Test | Does expected behavior still work? | run `03-tests/05-executable` | All required tests pass. |
| Build | Can the app be packaged for release? | build command | Build completes without errors. |
| Migrate | Are schema changes applied safely? | run migrations | Migration tested on a copy first. |
| Smoke test | Does the app start and respond? | call `/health` + core flow | Basic endpoint and flow work. |
| Verify | Are permissions and logs correct? | manual + checklist | Smoke evidence captured. |

The exact commands are set when the stack is chosen (TASK-001).

---

## Your pipeline

```
1. Install:   install dependencies
2. Lint:      run linter / static checks
3. Test:      run the executable test suite
4. Build:     build the production app
5. Migrate:   apply migrations (schema before code)
6. Deploy:    deploy the built app
7. Smoke:     call /health and run the core flow
8. Monitor:   watch logs for the first release window
```

---

## Quality gates by environment (Ch. 27 §27.9)

| Stage | Required action | Quality gate | Rollback trigger |
|---|---|---|---|
| Prepare | Confirm environment variables and data sources. | Config checklist complete. | Missing or invalid configuration. |
| Migrate | Apply database changes. | Migration tested on a copy. | Migration error or data mismatch. |
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

`set -e` makes the script stop at the first failure — that is the gate.

---

> Blueprint: blueprints/07-ops/01-deployment/cicd-pipeline.md
