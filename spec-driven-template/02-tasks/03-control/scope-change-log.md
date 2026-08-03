# Scope Change Log

> Source: Ch. 14 §14.7 (Preventing Scope Creep) + Ch. 29 §29.6 (Handling Scope Changes).
> Scope changes are not automatically bad. They become dangerous when they enter the
> project **without a decision trail**.

> **Scope control rule:** a scope change is not accepted until the relevant requirement,
> design, tests, tasks, and review checklist are updated. Otherwise the change is only a
> conversation, not a controlled decision.

---

## Change requests

```
Change ID:
Date:
Requested by:
Requested change:
Reason / evidence:

Evaluation:
  Does it support the project goal?         [yes/no + why]
  Does it affect existing requirements?     [which REQ IDs]
  Does it affect architecture?              [ADR needed?]
  Does it affect release timing?            [impact]
  Does it require new tests?                [which TEST IDs]

Decision:      Accept / Reject / Defer
Decision owner:
Date decided:

Artifacts updated:
  [ ] 01-docs/constraints-and-non-goals.md
  [ ] 01-docs/requirements.md
  [ ] 01-docs/product-spec.md
  [ ] 01-docs/technical-spec.md
  [ ] 01-docs/architecture-decisions/ADR-###
  [ ] 01-docs/traceability.md
  [ ] 02-tasks/task-index.md
  [ ] 03-tests/test-specification.md
  [ ] 05-review/code-review-checklist.md
  [ ] 07-ops/deployment-plan.md
```

| Change ID | Date | Requested change | Decision | Owner | Artifacts updated |
|---|---|---|---|---|---|
| SC-001 | | | Accept / Reject / Defer | | |
| SC-002 | | | | | |

---

## Evaluation questions (Ch. 29 §29.6)

| Question | Why it matters | Decision option | Artifact to update | Risk if ignored |
|---|---|---|---|---|
| Does it support the project goal? | Prevents attractive but distracting work. | Accept / reject / defer. | Project vision and PRD. | The team builds low-value features. |
| Does it affect existing requirements? | Prevents hidden behavior changes. | Revise requirement or create new one. | Requirements and traceability matrix. | Tests no longer match expected behavior. |
| Does it affect architecture? | Prevents rushed design damage. | Update design or create an ADR. | Technical spec and ADR log. | The code becomes inconsistent. |
| Does it affect release timing? | Prevents false delivery promises. | Move release, reduce scope, or defer. | Roadmap and task plan. | The team ships unfinished work. |
| Does it require new tests? | Prevents unverified changes. | Add test cases before implementation. | Test spec and checklist. | New behavior breaks silently. |

---

## Preventing scope creep from the agent (Ch. 14 §14.7)

Scope creep happens quickly with AI agents because they may "helpfully" add extra fields,
extra screens, or extra logic that was never requested.

**Rule:** every task must point back to an approved requirement or design decision. If a
requested change has no matching spec entry, **pause the implementation** — reject it,
defer it, or update the spec first.

> **No new code without a matching approved reason.**

New ideas must pass *through the specification* before they become implementation tasks:

```
new idea → evaluate against intent & goals → accept/defer/reject
                  ↓ (accepted)
        update requirement + spec + tests
                  ↓
             create task
                  ↓
           implementation
```

---

# WORKED EXAMPLE — ProjectBoard

| Change ID | Date | Requested change | Decision | Owner | Artifacts updated |
|---|---|---|---|---|---|
| SC-001 | 2026-03-30 | CSV export of project tasks | **Accept** | Product owner | REQ-F-007, tech spec, FTEST-010, TASK-013, RTM |
| SC-002 | 2026-04-01 | Slack notification on task assignment | **Defer** | Product owner | Non-goals list only |
| SC-003 | 2026-04-02 | Multiple assignees per task | **Reject** | Product owner | Non-goals list only |

## Change detail — SC-001

```
Change ID:      SC-001
Date:           2026-03-30
Requested by:   Team lead (after a client asked for the task list in a spreadsheet)
Requested change: Export the current project's tasks to CSV.
Reason / evidence: Three of five pilot teams asked for it in week one.

Evaluation:
  Does it support the project goal?      Yes - "see current work" extends to sharing it.
  Does it affect existing requirements?  No change to REQ-F-001..006; adds REQ-F-007.
  Does it affect architecture?           Yes - export must be a background job (ADR-005).
  Does it affect release timing?         +2 days; v1 date moves from 04-08 to 04-10.
  Does it require new tests?             Yes - FTEST-010, PTEST-004, STEST-008.

Decision:       Accept
Decision owner: Product owner
Date decided:   2026-03-31

Artifacts updated:
  [x] docs/01-intent/constraints-and-non-goals.md   (removed from "later")
  [x] docs/02-requirements/requirements.md          (REQ-F-007 added)
  [x] docs/04-technical-spec/technical-spec.md      (§4 background job)
  [x] docs/08-traceability/traceability.md          (new row)
  [x] tasks/01-planning/task-index.md               (TASK-013)
  [x] tests/04-failure/failure-tests.md             (FTEST-010)
  [x] 07-ops/... deployment checklist               (new job to monitor)
```

## Why SC-001 mattered

The CSV code **already existed** when this request was logged — the agent had added it
while working on TASK-005 (task listing). The traceability review flagged "code with no
requirement". Two options were possible: delete it, or approve it properly. The team chose
to approve it — but only **after** writing REQ-F-007 and its tests.

> **Scope control rule applied:** the change was not accepted until the requirement,
> design, tests, tasks, and checklist were all updated. Until then it was a conversation,
> not a decision.

## Rejected and deferred, with reasons recorded

| ID | Request | Decision | Reason kept on record |
|---|---|---|---|
| SC-002 | Slack notification on assignment | Defer | Needs an external integration; CON-006 blocks paid services in v1. Revisit in v2. |
| SC-003 | Multiple assignees per task | Reject | Single ownership is the product's core idea (see intent). Reversing it changes the data model and the dashboard. |
