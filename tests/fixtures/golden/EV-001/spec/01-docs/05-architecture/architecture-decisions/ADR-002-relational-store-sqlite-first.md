# ADR-002: Relational Store — SQLite First, Postgres Path Kept Open

> Source: Ch. 8 §8.8 + Appendix K.
> Copy this file to `ADR-001-short-title.md` and fill it in. Never edit an accepted ADR —
> supersede it with a new one.

**ADR ID:** ADR-002
**Status:** Accepted
**Date:** 2026-08-08
**Decision owner:** Developer (product owner)
**Review date:** None scheduled — see Revisit when.

---

## Context

Pantry's entities have relationships worth enforcing — recipes own ingredient lines, plans
own meals, a list belongs to exactly one plan (BR-001) — so the store must offer foreign
keys, uniqueness, and transactions. Today the data is one person's; the deployment target
is undecided (Q-018).

## Options considered

> **Design it twice** (Ousterhout Ch. 11). You must compare **at least two genuinely
> different** options — not one option and two strawmen. Make them radically different;
> that is where the learning is. The winner is often a third design you only found by
> seeing what was wrong with the first two.

1. **SQLite now, Postgres-compatible schema** — zero operational cost while the data is one person's; the growth path stays open.
2. **Postgres from day one** — full power immediately; a server to run, secure, and back up before anyone needs it.
3. **A document store** — flexible shapes; gives up the foreign keys and constraints the entity rules depend on.

*Compared on:* which interface is simpler · which is more general · which forces callers
to do work that should be inside · which is cheaper to reverse.

## Decision

A **relational database — SQLite while it is one person's, with nothing in the schema that
would stop it becoming Postgres** (the developer's words).

## Reason

The entity rules need relational constraints; one person's data does not need a database
server; and keeping the schema Postgres-compatible means the decision is cheap to reverse
the day it stops being one person's.

## Consequences

- **Positive:** no server to run or back up separately; the whole store is one file, which suits the backup posture.
- **Trade-off or limitation:** one writer at a time; a future migration to Postgres is real work, bounded by keeping the schema portable.
- **Rule the AI assistant must follow during implementation:** use only column types, constraints, and SQL that work identically on SQLite and Postgres; no SQLite-only features; every migration reversible (database-design §8).

> **If no trade-off is visible, keep looking.** A choice with no downside was never a
> choice — you are comparing in the abstract instead of weighted for this context.

## Compliance

| Enforced by | Where |
|---|---|
| Manual review by the developer at every schema change | [`../../04-technical-spec/fitness-functions.md`](../../04-technical-spec/fitness-functions.md) |

## Revisit when

The data stops being one person's (Q-008 answered "isolated customers"), or the deployment
target (Q-018) offers managed Postgres, or write concurrency becomes real.

## Impact

| Dimension | Impact |
|---|---|
| Security | The store is a file — filesystem permissions and backups become the perimeter. |
| Reliability | Fewer moving parts; the backup unit is one file. |
| Performance | Ample at personal-library scale (REQ-NF-001 targets). |
| Cost | Zero while SQLite; a managed Postgres bill only when the move is earned. |
| Maintainability | Portability rule keeps the exit cheap; migrations stay reversible. |

## Related

- Related requirements: REQ-F-001, REQ-F-003, BR-001
- Related technical spec sections: `technical-spec.md` §5; `database-design.md` §3, §8
- Supersedes / superseded by: —

---

## Why each field matters (Appendix K)

| Field | Why it matters |
|---|---|
| Context | Prevents future reviewers from judging the decision without knowing the problem. |
| Decision | States the actual choice clearly. |
| Alternatives | Shows that the team considered other options. |
| Consequences | Makes trade-offs visible. |
| Related requirements | Keeps architecture tied to product value. |

> Blueprint: blueprints/01-docs/05-architecture/architecture-decisions/ADR-000-template.md
