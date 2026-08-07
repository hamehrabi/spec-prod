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
| ADR-001 | Use a modular monolith for Pantry | Accepted | 2026-08-07 | — |
| ADR-002 | Relational store — SQLite now, Postgres-portable | Accepted | 2026-08-07 | — |

> ADR-001 and ADR-002 are recorded in [`../decisions.md`](../decisions.md) (DD-001, DD-002).
> Expand either into a full `ADR-###-short-title.md` from the template when more context is
> needed; the numbers are already reserved.

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

## Rules the ADRs impose on the AI assistant

These must also appear in `06-agent/01-instructions/AGENT.md`.

| ADR | Rule the agent must follow |
|---|---|
| ADR-001 | Each feature area (recipes, planning, shopping-list) lives in a named module. Route handlers must not contain business rules. Business logic goes in domain modules, never inside UI components. |
| ADR-002 | Use portable relational SQL only — no SQLite-only or Postgres-only features. Migrations must be reversible. |

---

> Blueprint: blueprints/01-docs/05-architecture/architecture-decisions/adr-index.md
