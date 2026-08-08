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
| DD-001 | 2026-08-08 | Use a modular monolith. | Simple monolith; modular monolith; service-based; serverless. | Structure without deployment complexity, and the only option that is cheap to reverse once more is known. | All | **ADR-001** |
| DD-002 | 2026-08-08 | Relational database — SQLite while it is one person's, with a Postgres-compatible schema. | SQLite; Postgres from day one; a document store. | The entities have relationships worth enforcing; one person's data does not need a server yet; the growth path stays open. | All entities | **ADR-002** |

---

## Design decision format (Ch. 10 §10.3)

```
Design Decision ID: DD-###
Related requirement: REQ-###
Decision:
Reason:
Consequences:
```

The worked example at the end of this file shows the same block filled in.

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

> Blueprint: blueprints/01-docs/05-architecture/decisions.md
