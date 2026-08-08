# ADR-002: Relational store — SQLite now, Postgres-ready schema

> Source: Ch. 8 §8.8 + Appendix K.
> Derived from the ADR template (`ADR-000-template.md`). An accepted ADR is immutable —
> supersede it with a new one rather than editing it.

**ADR ID:** ADR-002
**Status:** Accepted
**Date:** 2026-08-08
**Decision owner:** Developer
**Review date:** Revisit trigger below.

---

## Context

Pantry must remember accounts, recipes, ingredient lines, weekly plans, planned meals,
shopping lists, and list items, with relationships that must stay consistent (a planned meal
references a saved recipe of the same account, BR-003; a list is generated from exactly one
week, BR-001). It is one person's data today, but the recipe library is years of handwritten
cards and must be able to grow without a rewrite.

## Options considered

1. **SQLite only** — zero-setup and perfect for one user, but tying the schema and code to
   SQLite-only features would force a rewrite to ever move off it.
2. **Relational, SQLite now with a Postgres-ready schema** — SQLite while it is one person's,
   with nothing SQLite-only in the schema or queries, so the same schema runs on Postgres
   unchanged.
3. **Document store** — flexible shape, but the data's relationships are exactly what must be
   enforced, and a document store pushes that enforcement into application code.

*Compared on:* which enforces the relationships · which runs cheapest for one user · which is
cheapest to grow later.

## Decision

Use a **relational database — SQLite in version one, with nothing in the schema, types, or
queries that is SQLite-only**, so the store can become Postgres unchanged.

## Reason

The data is relational and its constraints (BR-001–BR-004) are the point; a relational store
enforces them. SQLite costs nothing to run for one person, and keeping the schema
store-neutral preserves the path to Postgres without a migration rewrite.

## Consequences

- **Positive:** relationships and ownership are enforced by the database, not by hope; the
  path to Postgres stays open at no cost today.
- **Trade-off or limitation:** no SQLite-only convenience may be used, even when it is
  tempting — that is the price of the portability.
- **Rule the AI assistant must follow during implementation:** use only portable SQL and
  types; no SQLite-specific feature, function, or extension; every migration is reversible.

## Compliance

| Enforced by | Where |
|---|---|
| Manual review by Developer against the database design; migration reversibility is checked in Round 8 | [`../../06-api-and-data-design/database-design.md`](../../06-api-and-data-design/database-design.md) |

## Revisit when

The single-user assumption ends (a real multi-user count, `Q-001`), or a workload appears that
SQLite cannot serve — at which point the Postgres-ready schema is migrated as planned.

## Impact

| Dimension | Impact |
|---|---|
| Security | Ownership is enforced by `account_id`-scoped queries in the store. |
| Reliability | A single-file database is simple to back up; recovery must not lose the recipe library (Round 8). |
| Performance | Ample for one cook's library; revisit if list generation is slow (`Q-010`). |
| Cost | No database service to pay for in version one. |
| Maintainability | Store-neutral schema keeps the migration path open. |

## Related

- Related requirements: `REQ-F-001`–`REQ-F-004`, `REQ-NF-005`.
- Related technical spec sections: [`technical-spec.md`](../../04-technical-spec/technical-spec.md) §5; [`database-design.md`](../../06-api-and-data-design/database-design.md).
- Supersedes / superseded by: none.

---

> Blueprint: blueprints/01-docs/05-architecture/architecture-decisions/ADR-000-template.md
