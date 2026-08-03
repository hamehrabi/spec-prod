# Architecture Decision Records

> Source: Ch. 8 §8.8, Appendix K.
> An ADR is a short document explaining an important architecture decision: the context,
> the options considered, the decision made, and the consequences.

**Why ADRs matter with AI agents:** they become *durable instructions*. Instead of
explaining the same decision repeatedly in every prompt, include the ADR in the project
context and tell the assistant to follow it.

## Index

| ID | Title | Status | Date | Supersedes |
|---|---|---|---|---|
| [ADR-000](ADR-000-template.md) | Template — copy me | — | — | — |
| ADR-001 | | Proposed | | |

## Conventions

- File name: `ADR-###-short-kebab-title.md`
- Numbers are sequential and never reused.
- An accepted ADR is **immutable**. To change direction, write a new ADR and mark the old
  one `Superseded`.
- Every ADR lists at least one **rule the AI assistant must follow during implementation** —
  that rule belongs in `06-agent/AGENT.md` too.

## Status values

| Status | Meaning |
|---|---|
| Proposed | Written, not yet agreed. |
| Accepted | Agreed; binding on implementation. |
| Rejected | Considered and declined; kept for the record. |
| Replaced / Superseded | A later ADR governs instead. |

---

# WORKED EXAMPLE — ProjectBoard ADR index

| ID | Title | Status | Date | Supersedes |
|---|---|---|---|---|
| ADR-001 | Use a modular monolith for ProjectBoard | Accepted | 2026-03-02 | — |
| ADR-002 | Store task status as a controlled enum | Accepted | 2026-03-05 | — |
| ADR-003 | Paginate task lists at 50 items | Accepted | 2026-03-06 | — |
| ADR-004 | Use synchronous email sending | **Superseded** | 2026-03-11 | superseded by ADR-005 |
| ADR-005 | Send notification email from a background job | Accepted | 2026-04-02 | supersedes ADR-004 |

## Rules the ADRs impose on the AI assistant

These must also appear in `06-agent/01-instructions/AGENT.md`.

| ADR | Rule the agent must follow |
|---|---|
| ADR-001 | Each feature area lives inside a named module. Route handlers must not contain complex business rules. Business logic goes in domain modules, never inside UI components. |
| ADR-002 | Never accept a status value outside `todo`, `in_progress`, `done`. Do not add new statuses without a new ADR. |
| ADR-003 | Every list endpoint must be paginated. Do not return unbounded result sets. |
| ADR-005 | Never call the email provider inside a request handler. Enqueue a job instead. |

## Example of superseding

ADR-004 was accepted, then reversed once Ch. 22 reliability planning showed that a slow
email provider would block task creation. ADR-004 was **not edited** — it was marked
`Superseded` and ADR-005 was written with the new context, decision, and consequences.
That history is why the rule exists, and it is what a future reviewer (or agent) needs.
