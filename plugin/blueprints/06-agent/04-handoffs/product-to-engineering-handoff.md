# Product-to-Engineering Handoff

> Source: Ch. 29 §29.2.
> Where product intent becomes **buildable engineering work**. The goal is not to hand
> developers a vague idea and ask them to figure it out.

---

## Template (Ch. 29 §29.2)

```
Feature name:
Problem statement:
Target users:
User goals:

Must-have requirements:
  - 
  - 

Acceptance criteria:
  - 
  - 

Non-goals for this release:
  - 

Known constraints:
  - 

Risks and sensitive areas:
  - [security, privacy, reliability, usability, compliance]

Open questions:
  - 

Decision owner:
Date of handoff:
```

---

## Handoff items (Ch. 29 §29.2)

| Item | What it should contain | Question it answers | Common weakness |
|---|---|---|---|
| Problem statement | User pain, business reason, current limitation. | Why should this be built? | The problem is described as a feature request only. |
| User requirement | User goal, action, outcome, acceptance criteria. | What must the user be able to do? | The requirement has no pass/fail condition. |
| Priority and non-goals | Must-have, should-have, later, explicitly out of scope. | What should the team **not** build now? | The team overbuilds because boundaries are missing. |
| Risk notes | Security, privacy, reliability, usability, compliance concerns. | What could go wrong? | Risks are discovered after implementation. |
| Open questions | Unknowns that need a decision before or during design. | What needs clarification? | The AI agent fills gaps with guesses. |

> **An open question in a handoff is a CITATION.** `Q-` rows are DEFINED in
> `open-questions.md`, and only there. Cite the id inside prose — *"blocked on `Q-###` until
> the export format is decided"* — never as a table row whose first cell is the id with
> the question restated beside it. The register owns the question, its owner, and its status;
> a restated copy here disagrees with it the day either changes.

---

## What each role needs (Ch. 29 §29.1)

| Role | What the role needs | What goes wrong without specs | Spec artifact that helps |
|---|---|---|---|
| Product manager | Clear scope, user needs, priorities, acceptance criteria. | Features built that do not match the product goal. | PRD and change log. |
| Developer | Architecture, constraints, data model, APIs, tests. | Code works locally but breaks design, security, or maintainability. | Technical specification and task list. |
| AI agent | Bounded context, explicit instructions, examples, forbidden changes. | The agent guesses, overbuilds, or changes unrelated code. | Agent context pack and task brief. |
| Reviewer | Requirements, expected behavior, tests, risks, evidence. | Review becomes opinion-based instead of evidence-based. | Review checklist and traceability matrix. |
| Stakeholder | Visible progress, trade-offs, decisions, impact. | Feedback arrives late and causes major rework. | Decision log, demo notes, feedback register. |

> **Practical rule:** a shared specification should answer three questions for everyone:
> *What are we building? How will we know it works? What has changed since the last
> decision?*

---

## Downstream chain

```
Product handoff
    → 01-docs/requirements.md          (engineering converts intent to testable behavior)
    → 01-docs/technical-spec.md
    → 02-tasks/                          (bounded work)
    → 06-agent/developer-to-agent-handoff.md
    → 05-review/                        (team review of output)
    → 01-docs/spec-change-log.md        (updated source of truth)
```

---

## Handoff acceptance check

Engineering should refuse a handoff that cannot answer these:

- [ ] Is the problem stated, not just the feature?
- [ ] Are the users named?
- [ ] Does every must-have requirement have a pass/fail acceptance criterion?
- [ ] Are the non-goals written down?
- [ ] Are risks and sensitive areas identified?
- [ ] Are open questions listed with a decision owner?

---

# WORKED EXAMPLE — ProjectBoard, CSV export

```
Feature name:      Export project tasks to CSV
Problem statement: Consulting teams have to report progress to clients in spreadsheets.
                   Today they retype task lists by hand, which is slow and introduces
                   errors. Three of five pilot teams asked for this in week one.
Target users:      Project Owners and Admins preparing a client update.
User goals:        Get the current task list out of ProjectBoard and into a spreadsheet
                   without retyping it.

Must-have requirements:
  - An Owner or Admin can export the tasks of a project they can access.
  - The export respects the filters currently applied on screen.
  - The export contains: title, assignee, status, priority, due date, created date.

Acceptance criteria:
  - Given an Owner viewing a project with 12 tasks, when they export, then the file
    contains exactly those 12 rows plus a header row.
  - Given a filter showing only overdue tasks, when they export, then only those rows
    are included.
  - Given a Member or Viewer, when they attempt to export, then the request is refused
    with a safe message and no file is produced.
  - Given a project with 10,000 tasks, when they export, then the request returns
    immediately with a Pending status and the file appears when ready.

Non-goals for this release:
  - Scheduled or recurring exports
  - PDF or XLSX formats
  - Exporting across multiple projects at once
  - Emailing the export to anyone

Known constraints:
  - CON-006: no paid third-party services
  - ADR-005: no long-running work inside a request handler

Risks and sensitive areas:
  - Data exposure: an export must never contain tasks from another project.
  - Performance: a large export must not block the web process.
  - Privacy: assignee is a name and email; the file leaves our system entirely.

Open questions:
  - Q-007: should the export include the description field? (long free text, may contain
    client-confidential notes) - decision owner: Product owner

Decision owner: Product owner
Date of handoff: 2026-03-31
```

## What engineering did with it

| Handoff item | Became |
|---|---|
| Must-have requirements | REQ-F-007 in `01-docs/02-requirements/requirements.md` |
| Acceptance criteria | ATEST-007, STEST-008, PTEST-004 |
| "no long-running work in a handler" | ADR-005 (background job) |
| Data-exposure risk | STEST-008 — Member and Viewer denied |
| Performance risk | PTEST-004 — 10,000 tasks under 60 s, job stays pending |
| Q-007 | Blocked TASK-013 until answered (answer: exclude description from v1) |

## What made this handoff acceptable

| Check | Result |
|---|---|
| Is the problem stated, not just the feature? | ✔ "retype task lists by hand" — the pain, not "add an export button" |
| Are the users named? | ✔ Owners and Admins preparing a client update |
| Does every must-have have a pass/fail criterion? | ✔ four Given/When/Then criteria |
| Are the non-goals written down? | ✔ four exclusions, which stopped scheduled exports appearing later |
| Are risks identified? | ✔ exposure, performance, privacy |
| Are open questions listed with an owner? | ✔ Q-007 |

> **Contrast with the first draft**, which said only: *"Users want to export tasks to
> Excel."* That version had no actor, no filter behavior, no permission rule, no size
> limit, and no format decision — five different systems could have been built from it.
