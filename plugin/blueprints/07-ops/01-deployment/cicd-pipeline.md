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
| Install | Can the project dependencies be installed? | `npm install` | No missing dependencies. |
| Lint | Does the code follow basic rules? | `npm run lint` | No blocking style or syntax errors. |
| Test | Does expected behavior still work? | `npm test` | All required tests pass. |
| Build | Can the app be packaged for release? | `npm run build` | Build completes without errors. |
| Migrate | Are schema changes applied safely? | `npm run migrate` | Migration tested on staging data. |
| Smoke test | Does the app start and respond? | `npm run smoke` | Basic endpoint or page works. |
| Verify | Are metrics, permissions, and logs correct? | manual + checklist | Smoke evidence captured. |

*Replace the example commands with your project's real ones.*

---

## Your pipeline

```
1. Install:   
2. Lint:      
3. Test:      
4. Build:     
5. Migrate:   
6. Deploy:    
7. Smoke:     
8. Monitor:   
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

`set -e` makes the script stop at the first failure — that is the gate.

---

# WORKED EXAMPLE — ProjectBoard

## Stages as configured

| Stage | Command | Gate | Typical time |
|---|---|---|---|
| Install | `npm ci && pip install -r requirements.txt` | No missing dependencies | 40 s |
| Lint | `npm run lint && ruff check src` | No blocking errors | 8 s |
| Test | `pytest 03-tests/05-executable -q` | **All 61 tests pass** | 55 s |
| Build | `npm run build` | Build completes | 25 s |
| Migrate | `python manage.py migrate` | Applied on staging data first | 3 s |
| Smoke | `./scripts/smoke.sh` | `/health` 200 + core flow works | 12 s |

## The local gate script actually used

```bash
#!/usr/bin/env bash
set -e
echo "== install ==" && npm ci && pip install -r requirements.txt
echo "== lint =="    && npm run lint && ruff check src
echo "== test =="    && pytest 03-tests/05-executable -q
echo "== build =="   && npm run build
echo "== smoke =="   && ./scripts/smoke.sh
echo "ALL GATES PASSED"
```

`set -e` **is** the gate. Without it the script prints "ALL GATES PASSED" even when the
tests fail.

## Quality gates by stage — the v1.0.0 run

| Stage | Required action | Quality gate | Result |
|---|---|---|---|
| Prepare | Confirm env vars and data sources | Config checklist complete | ✅ 11 keys verified |
| Migrate | Apply MIG-003, MIG-004 | Tested on staging data | ✅ both reversible |
| Build | Run tests, create package | All required tests pass | ✅ 61/61 |
| Release | Deploy with monitoring enabled | Health check + core route pass | ✅ |
| Verify | Check permissions and logs | Smoke evidence captured | ✅ 7/7 steps |

## The run that failed the gate

```
== install ==  ok
== lint ==     ok
== test ==
FAILED tests/05-executable/integration/test_STEST-002_viewer_cannot_patch_task.py
  assert 200 == 403
1 failed, 60 passed
```

The pipeline stopped at the test stage. The proposal on the table was to mark STEST-002
`xfail` "to unblock the release". It was refused — a skipped test is a **finding**, not a
fix. BUG-003 was fixed instead and the release moved by four hours.

> **The rule that held:** do not merge failing checks. Every mechanism in this pipeline is
> worthless the first time it is bypassed.
