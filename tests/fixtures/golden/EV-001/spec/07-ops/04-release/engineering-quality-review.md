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

---

## Repeatable system checklist (Ch. 30)

| Area | Question | Ready? |
|---|---|---|
| Process | Can you explain the path from idea to production review? | Yes |
| Documentation | Can a new human or AI agent find the current source of truth? | Yes |
| Versioning | Are requirement and spec changes named, dated, and explained? | Yes |
| Templates | Do projects reuse proven briefs, specs, test plans, review checklists? | Yes |
| Agent rules | Do agents receive clear constraints, coding standards, completion rules? | Yes |
| Traceability | Can each feature be traced requirement → task → test → code → review → release? | Partly — code, review, and release links begin with implementation |
| Quality metrics | Do you measure defects, rework, review findings, drift, stability? | No — measurement begins with the first build cycle |
| Adoption | Does the workflow help the team work with less confusion and better evidence? | To be judged after the first cycle |

> Blueprint: blueprints/07-ops/04-release/engineering-quality-review.md
