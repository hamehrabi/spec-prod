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
| DD-001 | | | | | REQ-### | ADR-### / n/a |
| DD-002 | | | | | | |

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

---

# WORKED EXAMPLE — ProjectBoard

| ID | Date | Decision | Options considered | Why this one | Affects | Promoted to ADR? |
|---|---|---|---|---|---|---|
| DD-001 | 2026-03-02 | Use a modular monolith. | Simple monolith; modular monolith; microservices. | Structure without deployment complexity for a one-developer team. | All | **ADR-001** |
| DD-AUTH-001 | 2026-03-04 | Server-side email/password auth; passwords stored as hashes; successful login returns a short-lived session token. | Session cookies; JWT; third-party identity provider. | No external dependency in v1 (CON-006); simplest thing that satisfies REQ-AUTH-001. | REQ-AUTH-001 | n/a |
| DD-002 | 2026-03-05 | Status is a controlled enum (`todo`, `in_progress`, `done`), not free text. | Free text; enum; lookup table. | Makes invalid data harder to store; enables a simple dashboard count. | REQ-F-005 | n/a |
| DD-003 | 2026-03-06 | Task lists are paginated at 50 items. | No pagination; cursor; offset pages. | Protects REQ-NF-001 (2 s for 500 tasks) without caching work. | REQ-NF-001 | n/a |
| DD-004 | 2026-03-09 | Deleting a project is blocked while open tasks exist. | Cascade delete; soft delete; block. | Prevents silent data loss; answers Q-002. | BR-004 | n/a |

## Design decision detail — DD-AUTH-001

```
Design Decision ID: DD-AUTH-001
Related requirement: REQ-AUTH-001
Decision:
  Use server-side email/password authentication.
  Passwords must be stored as hashes.
  A successful login returns a short-lived session token.
Reason:
  No third-party identity provider is allowed in v1 (CON-006), and the team needs a
  path that can be tested without external accounts.
Consequences:
  - Session expiry must be specified (see Q-004).
  - Password reset becomes its own requirement, not a hidden assumption.
  - The agent must never log the token or the password hash.
```
