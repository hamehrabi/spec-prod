# Version Control Checklist

> Source: Ch. 26.
> Branches and commits are part of traceability. A commit that does not name a requirement
> breaks the chain at the last link.

---

## Branch naming

```
<type>/<REQ-or-TASK-id>-<short-kebab-description>
```

| Type | Use | Example |
|---|---|---|
| `feat` | New behaviour, from a task | `feat/TASK-004-boundary-layer` |
| `fix` | A defect with a regression test | `fix/BUG-001-path-prefix-collision` |
| `spec` | Specification only — no plugin change | `spec/Q-007-licence-position` |
| `test` | Tests only | `test/TASK-007-resume-eight-stages` |
| `ops` | CI, release, maintenance | `ops/RISK-004-scheduled-install-test` |
| `chore` | Housekeeping with no behaviour change | `chore/tidy-fixture-layout` |

- [ ] The branch name carries a `TASK-###`, `REQ-###`, `BUG-###`, `Q-###`, or `RISK-###`
- [ ] One branch = one task. **The one-task-at-a-time rule applies to branches too**

## Commit format

```
type(scope): action for REQ-###

Optional body: what changed and WHY. The what is in the diff; the why is not.
```

| Example | |
|---|---|
| `feat(boundary): normalise before path check for REQ-F-024` | ✅ |
| `fix(fill): strip worked example whole for BR-002` | ✅ |
| `spec(intent): record Q-002 telemetry conflict` | ✅ |
| `test(resume): add stage 5 interrupt case for REQ-F-028` | ✅ |
| `update stuff` | ❌ no scope, no requirement |
| `fix bug` | ❌ which bug, which requirement |
| `WIP` | ❌ |

- [ ] Every commit names a requirement, task, or defect ID
- [ ] The subject line says what **changed**, not what was worked on
- [ ] The body says **why**, when it is not obvious

## Before committing

- [ ] Only files the task allowed were changed
- [ ] Any file outside that list is **called out in the commit body**
- [ ] No secret, token, or credential — including in an example
- [ ] No `.env` file
- [ ] No script, package manifest, or lockfile in the plugin payload (ADR-002)
- [ ] No state, progress, or cache file (ADR-004)
- [ ] Tests updated alongside behaviour
- [ ] `traceability.md` updated

## Before pushing

- [ ] The gate passes locally, or you are pushing a branch expecting CI to run it
- [ ] **Push at least daily** — this *is* the RPO (`backup-and-recovery.md` §2). A stated RPO of one day and a weekly push habit means a real RPO of a week

## Before merging

- [ ] All 14 fitness functions green
- [ ] Every new denial test has been **seen to fail** without the change
- [ ] [`code-review-checklist.md`](../02-checklists/code-review-checklist.md) applied
- [ ] `change-log.md` updated
- [ ] `release-notes.md` `[Unreleased]` updated if user-visible
- [ ] **If a blueprint path changed: the migration note exists**

---

## What is committed, and what is not

| Committed | Not committed |
|---|---|
| Everything in `spec/` — **it is the source of truth** | Anything containing a credential |
| Blueprints, instruction modules, the manifest | Local editor and OS files |
| Tests, CI configuration, golden fixtures | Generated artifacts that are cheaply regenerable |
| `.env.example` (empty, with its explanation) | `.env` — there is none, and the rule stands anyway |

**`spec/` is committed deliberately** (REQ-F-035 for the developer's workspace; the same
reasoning here). A git history of specification changes is the closest thing to observability
this project can honestly have — every other signal is forbidden by CON-007.

---

## History rules

- **Never rewrite pushed history.** With one contributor the temptation is high and the value
  is low — and the specification history is a record, not a draft.
- **Never force-push a branch someone else has installed from.** A published tag is immutable.
- A revert is a commit. It gets a message naming what it reverses and why.

> Blueprint: ../../../spec-driven-template/05-review/03-version-control/version-control-checklist.md
