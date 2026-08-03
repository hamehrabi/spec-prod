# Issue Template

> Source: Ch. 26.
> Copy per issue. **An issue with no requirement is a scope change** — route it through
> [`scope-change-log.md`](../../02-tasks/03-control/scope-change-log.md) instead.

---

```markdown
## Requirement

REQ-###  /  BR-###  /  SEC-###  /  Q-###
<!-- If none applies, STOP. This is a scope change, not an issue.
     Go to 02-tasks/03-control/scope-change-log.md. -->

## What must be true when this is done

<!-- The acceptance criterion, in Given-When-Then. Copy it from requirements.md §6
     if it exists; if it does not, write it HERE and add it there. -->

Given
When
Then

## Likely files

<!-- Best guess at what will change. Not binding - the task file's allowed list is. -->

## Out of scope

<!-- What must NOT change. Be specific: name modules, not "unrelated things".
     Every issue in this project starts with the same first line. -->
- spec/ in this repository
-

## Tests

| Test ID | Level | What it proves |
|---|---|---|
|         |       |                |

<!-- For a DEFECT, at least one test must FAIL against the current version
     before the fix. A regression test that has never failed proves nothing. -->

## Stop condition

<!-- What would mean this issue is wrong rather than hard.
     The three standing ones for this project: -->
- It appears to require executable code        -> ADR-002; the issue is wrong
- It appears to require a state file           -> ADR-004; the issue is wrong
- It appears to require editing spec/          -> the direction is reversed
```

---

## Issue types

| Type | Must name | Extra requirement |
|---|---|---|
| **Task** | A `TASK-###` from the index | Nothing extra |
| **Defect** | The `REQ-###` violated | A failing test **before** the fix; a row in `debugging-specification.md` |
| **Question** | The `Q-###` it resolves | Names the decision owner and what is blocked |
| **Risk** | The `RISK-###` | Names impact, likelihood, and an owner |
| **Scope change** | — | **Does not belong here.** Goes to `scope-change-log.md` first |

---

## Why the requirement field is first

An issue that starts with a proposed solution has already made the decision. An issue that
starts with a requirement leaves it open.

With an AI agent it matters more: an issue body **is** effectively a prompt. "Add caching to
speed up resume" will produce caching. "REQ-F-028: resume must derive stage from artifacts —
currently it re-reads more than it needs to" will produce a question about ADR-004, which is
the correct outcome, because caching here is a forbidden state file wearing a different hat.

> Blueprint: ../../../spec-driven-template/05-review/03-version-control/issue-template.md
