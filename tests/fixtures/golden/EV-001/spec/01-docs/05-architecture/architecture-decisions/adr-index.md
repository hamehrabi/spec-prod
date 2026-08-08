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
| [ADR-001](ADR-001-modular-monolith.md) | Use a modular monolith for Pantry | Accepted | 2026-08-08 | — |
| [ADR-002](ADR-002-relational-store-sqlite-first.md) | Relational store — SQLite first, Postgres path kept open | Accepted | 2026-08-08 | — |

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

> Blueprint: blueprints/01-docs/05-architecture/architecture-decisions/adr-index.md
