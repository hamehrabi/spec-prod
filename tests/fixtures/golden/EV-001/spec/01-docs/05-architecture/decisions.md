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
| DD-001 | 2026-08-07 | Use a modular monolith. | Simple monolith; modular monolith; service-based; serverless. | Structure without deployment complexity for a one-person build; cheap to reverse. | All | **ADR-001** |
| DD-002 | 2026-08-07 | Relational database — SQLite now, schema kept Postgres-portable. | Relational (SQLite/Postgres); document store; embedded key-value. | Data is relational; SQLite fits one user with no server; nothing in the schema blocks Postgres later. | REQ-NF-005 | **ADR-002** |

> **Still open:** the authentication model is not decided (Q-006), and the pre-launch
> "safe to run for real" conditions were not asked at this depth — [TODO: what must be true
> before this is safe to run for real? — Q-013]. Those become production-readiness checks
> (Round 8) and fitness functions (`../04-technical-spec/fitness-functions.md`).

---

## Design decision format (Ch. 10 §10.3)

```
Design Decision ID: DD-###
Related requirement: REQ-###
Decision:
Reason:
Consequences:
```

## Design decision detail — DD-002

```
Design Decision ID: DD-002
Related requirement: REQ-NF-005, REQ-F-005
Decision:
  Use a relational database. Run on SQLite while Pantry is one person's, and keep the schema
  free of anything that would stop it becoming Postgres (generic types, standard SQL,
  reversible migrations).
Reason:
  The data is relational (account -> recipes -> ingredient lines; plan -> planned meals ->
  list). SQLite is the simplest thing that works for a single user and needs no server.
  Postgres is the growth path, so the schema avoids SQLite-only features.
Consequences:
  - Migrations must be reversible and portable (database-design.md §8).
  - No SQLite-specific SQL or column types in the schema.
  - The AI assistant must not use a feature only one of SQLite/Postgres supports.
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
