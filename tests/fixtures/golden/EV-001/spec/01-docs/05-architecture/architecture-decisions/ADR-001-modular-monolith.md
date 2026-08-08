# ADR-001: Use a Modular Monolith for Pantry

> Source: Ch. 8 §8.8 + Appendix K.
> Copy this file to `ADR-001-short-title.md` and fill it in. Never edit an accepted ADR —
> supersede it with a new one.

**ADR ID:** ADR-001
**Status:** Accepted
**Date:** 2026-08-08
**Decision owner:** Developer (product owner)
**Review date:** None scheduled — see Revisit when.

---

## Context

Pantry is a single-user consumer web application with four capabilities and one core
subdomain (shopping-list generation). Simplicity/feasibility is a driving characteristic:
version one must be finishable, and the structure must not cost more than the product.
The architecture style shapes every file in this folder and the module layout of the code.

## Options considered

> **Design it twice** (Ousterhout Ch. 11). You must compare **at least two genuinely
> different** options — not one option and two strawmen. Make them radically different;
> that is where the learning is. The winner is often a third design you only found by
> seeing what was wrong with the first two.

1. **Simple monolith** — fastest start; the boundaries live in someone's head and decay as the code grows.
2. **Modular monolith** — one deployment with named internal modules; structure without operational cost; cheap to reverse.
3. **Service-based / serverless** — real independence per capability, paid for in operations, deployment, and debugging across a network that a one-person product does not need.

*Compared on:* which interface is simpler · which is more general · which forces callers
to do work that should be inside · which is cheaper to reverse.

## Decision

Use a **modular monolith**: one deployable application with named modules — accounts,
recipes, planning, and shopping-list generation (the core).

## Reason

The developer chose it, and it fits the drivers: structure without deployment complexity,
and the only option on the list that is cheap to reverse once more is known. Nothing in
the product needs independent scaling or deployment.

## Consequences

- **Positive:** one thing to build, run, and back up; module boundaries keep the core separable.
- **Trade-off or limitation:** module discipline is not enforced by deployment — it must be enforced by review and FF-001.
- **Rule the AI assistant must follow during implementation:** every feature area lives inside its named module; route handlers must not contain business rules; business logic goes in domain modules, never in UI components.

> **If no trade-off is visible, keep looking.** A choice with no downside was never a
> choice — you are comparing in the abstract instead of weighted for this context.

## Compliance

| Enforced by | Where |
|---|---|
| FF-001 (no import cycles between modules) — not wired yet | [`../../04-technical-spec/fitness-functions.md`](../../04-technical-spec/fitness-functions.md) |

## Revisit when

One module genuinely needs independent scaling or deployment, or Q-001 is answered with a
volume that a single deployment cannot serve.

## Impact

| Dimension | Impact |
|---|---|
| Security | One process, one boundary to defend; owner-scoping enforced in one service layer. |
| Reliability | One deployable to keep healthy; a restart is the whole system. |
| Performance | No network hops between modules; well within REQ-NF-001 at personal scale. |
| Cost | One small instance; no orchestration. |
| Maintainability | Named modules keep the core separable; discipline required (FF-001). |

## Related

- Related requirements: REQ-NF-005
- Related technical spec sections: `technical-spec.md` §2
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
