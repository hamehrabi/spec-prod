# Decision Log

> Source: Ch. 4 §4.4 — `decisions.md`: "Records important design trade-offs. Whenever you
> choose one option over another."

This is the **lightweight** log. Use it for everyday choices that shape the work but do
not warrant a full record. When a decision affects architecture, security, reliability, or
performance in a lasting way, promote it to an ADR in
[`architecture-decisions/`](architecture-decisions) and link it here.

---

| ID | Date | Decision | Options considered | Why this one | Affects | Promoted to ADR? |
|---|---|---|---|---|---|---|
| DD-001 | 2026-08-08 | Use a modular monolith with named domain modules. | Simple monolith; modular monolith; microservices. | Structure without deployment complexity for one developer and one user; keeps the core list logic isolated (`REQ-NF-005`). | All modules | **ADR-001** |
| DD-002 | 2026-08-08 | Relational store — SQLite now, with nothing SQLite-only in the schema so it can become Postgres unchanged. | SQLite only; relational SQLite→Postgres-ready; document store. | Enforces the recipe/plan/list relationships (BR-001–BR-004) and lets a one-person store grow without a rewrite. | `REQ-F-001`–`REQ-F-004`, data model | **ADR-002** |
| DD-003 | 2026-08-08 | List generation lives in its own ShoppingList service, separate from recipe storage and account/auth. | Logic in route handlers; a dedicated service module. | Keeps the competitive core testable and portable; guards `REQ-NF-005` and FF-001. | `REQ-F-004`, `REQ-NF-005` | n/a |
| DD-004 | 2026-08-08 | Block deletion of a recipe while a weekly plan still references it. | Cascade delete; soft delete; block. | Prevents a deletion from silently breaking a planned week (BR-004). | BR-004 | n/a |

---

## Design decision format (Ch. 10 §10.3)

```
Design Decision ID: DD-###
Related requirement: REQ-###
Decision:
Reason:
Consequences:
```

---

## When does a requirement need a design decision? (Ch. 10 §10.3)

Ask: **"Can this requirement be implemented in more than one way?"**
If yes, document the chosen direction *before* creating tasks — otherwise the agent
picks a convenient implementation that may not match your intended architecture.

---

## Promote to an ADR when the decision…

- changes the architecture style or module boundaries,
- affects security or data-protection posture,
- affects reliability, failure behavior, or recovery,
- affects performance or cost at scale,
- would be expensive or risky to reverse later,
- creates a rule the AI assistant must follow during every future implementation.

---

> Blueprint: blueprints/01-docs/05-architecture/decisions.md
