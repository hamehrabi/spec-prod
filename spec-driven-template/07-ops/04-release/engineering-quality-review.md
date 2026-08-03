# Engineering Quality Review

> Source: Ch. 30 §30.7.
> Measure the quality of the **engineering system**, not the amount of AI usage. AI can
> generate many files quickly, but speed alone does not prove quality.

---

## Metrics (Ch. 30 §30.7)

| Metric | What it shows | How to measure simply | Healthy direction |
|---|---|---|---|
| Requirement clarity | Whether specs are usable before coding. | Count questions raised during task handoff. | Fewer basic clarifying questions over time. |
| Rework rate | How often generated work must be heavily corrected. | Track tasks reopened after review. | Lower reopen rate. |
| Test usefulness | Whether tests catch real problems. | Track bugs found by tests before release. | More meaningful failures before production. |
| Review findings | Where AI or humans commonly miss issues. | Tag review comments by category. | Repeated categories decrease. |
| Spec drift | Whether code and specs stay aligned. | Check if released behavior is reflected in docs. | Fewer undocumented behavior changes. |
| Production stability | Whether releases behave reliably. | Track errors, incidents, rollback events, response time. | Fewer incidents, faster recovery. |

---

## Monthly review template (Ch. 30 §30.7)

```
Period reviewed:
Projects or features shipped:
Requirements that changed:
Tasks completed with AI support:
Defects found before release:
Defects found after release:
Most common review issue:
Most common AI mistake:
Template that needs improvement:
Agent rule that needs improvement:
Spec drift found:
Action items for next month:
```

---

## Tracking table

| Period | Clarifying questions | Tasks reopened | Bugs caught pre-release | Bugs found post-release | Incidents | Rollbacks | Drift items |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

---

## Review-finding categories

Tag each review comment so patterns become visible.

| Category | Example |
|---|---|
| `requirement-gap` | Behavior implemented that no requirement asked for. |
| `architecture-drift` | Business logic placed in a route handler. |
| `missing-validation` | Input accepted without a boundary check. |
| `security` | Missing authorization check on a protected action. |
| `shallow-test` | Test asserts that something happened, not that it was correct. |
| `scope-creep` | Files changed outside the task boundary. |
| `unsafe-error` | Internal detail exposed in a user-facing message. |

---

## Improvement loop (Ch. 30 §30.4)

After every project, answer one question:

> **Which template should be improved so the same confusion does not happen again?**

| Recurring problem | Template / rule to improve | Change made | Date |
|---|---|---|---|
| | `06-agent/AGENT.md` / `01-docs/…` / checklist | | |

---

## Repeatable system checklist (Ch. 30)

| Area | Question | Ready? |
|---|---|---|
| Process | Can you explain the path from idea to production review? | Yes / No |
| Documentation | Can a new human or AI agent find the current source of truth? | Yes / No |
| Versioning | Are requirement and spec changes named, dated, and explained? | Yes / No |
| Templates | Do projects reuse proven briefs, specs, test plans, review checklists? | Yes / No |
| Agent rules | Do agents receive clear constraints, coding standards, completion rules? | Yes / No |
| Traceability | Can each feature be traced requirement → task → test → code → review → release? | Yes / No |
| Quality metrics | Do you measure defects, rework, review findings, drift, stability? | Yes / No |
| Adoption | Does the workflow help the team work with less confusion and better evidence? | Yes / No |

---

# WORKED EXAMPLE — ProjectBoard, April review

```
Period reviewed:                 2026-03-01 to 2026-04-30
Projects or features shipped:    ProjectBoard v1.0.0 (11 requirements)
Requirements that changed:       5 (CHG-001 to CHG-005)
Tasks completed with AI support: 14 of 16
Defects found before release:    9
Defects found after release:     1 (KI-002, cosmetic)
Most common review issue:        scope-creep (4 of 11 findings)
Most common AI mistake:          implementing the allow path, omitting the deny path
Template that needs improvement: TASK-001 - the allowed-files list was optional; it is
                                 now mandatory, which is what stopped repeat scope creep
Agent rule that needs improvement: none this month (v1.3 rules held)
Spec drift found:                5 items, 4 closed, 1 open (Q-003 / REQ-F-006)
Action items for next month:     answer Q-003; run MIG-005 staged backfill; add
                                 due-date sort (KI-002)
```

## Tracking table

| Period | Clarifying questions | Tasks reopened | Bugs caught pre-release | Bugs found post-release | Incidents | Rollbacks | Drift items |
|---|---|---|---|---|---|---|---|
| March | 14 | 5 | 6 | 2 | 2 | 1 | 3 |
| April | 6 | 2 | 3 | 1 | 1 | 0 | 5 |
| **Direction** | ↓ good | ↓ good | ↓ *(fewer bugs to catch)* | ↓ good | ↓ good | ↓ good | ↑ *see note* |

**Note on drift going up:** more drift items is not a regression here — March had no drift
audit at all. Finding 5 items in April means the audit started working. The number to
watch next month is how many are still **open**.

## Metrics against healthy direction

| Metric | March | April | Healthy direction | Verdict |
|---|---|---|---|---|
| Requirement clarity (questions at handoff) | 14 | 6 | Fewer basic questions | ✅ |
| Rework rate (tasks reopened) | 5/8 | 2/8 | Lower reopen rate | ✅ |
| Test usefulness (bugs caught by tests pre-release) | 6 | 3 | Meaningful failures before production | ✅ |
| Review findings by category | scope 4, req 3, sec 2, test 2 | scope 1, test 1 | Repeated categories decrease | ✅ |
| Spec drift | not measured | 5 found, 4 closed | Fewer undocumented changes | ⚠ watch |
| Production stability | 2 incidents, 1 rollback | 1 incident, 0 rollbacks | Fewer incidents, faster recovery | ✅ |

## Review findings tagged

| Category | March | April | What changed |
|---|---|---|---|
| `scope-creep` | 4 | 1 | Allowed-files list became mandatory in the task template |
| `missing-validation` | 2 | 0 | Validation moved to a named layer (ADR-001) |
| `security` | 2 | 0 | Deny-path rule added to AGENT.md v1.2 |
| `shallow-test` | 2 | 1 | Test review step added before code review |
| `requirement-gap` | 3 | 0 | "Clarify before building" prompt used on every new requirement |

## Improvement loop

| Recurring problem | Template / rule improved | Change made | Date |
|---|---|---|---|
| Agent edits files outside the task | `02-tasks/02-task-files/TASK-001.md` | "Expected files" and "Do not change" became required fields, not optional | 2026-03-28 |
| Allow path built, deny path forgotten | `06-agent/01-instructions/AGENT.md` | v1.2 rule: implement and test the denial path in the same task | 2026-04-01 |
| Null assumptions causing 500s | `AGENT.md` | v1.3 rule: handle the null path and confirm the spec states the behavior | 2026-04-04 |

> **The question that drives this file (Ch. 30 §30.4):** which template should be improved
> so the same confusion does not happen again? Three answers this quarter — and the
> scope-creep count dropped from 4 to 1 as a direct result.
