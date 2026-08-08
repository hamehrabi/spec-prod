# ADR-001: Use a modular monolith for Pantry

> Source: Ch. 8 §8.8 + Appendix K.
> Derived from the ADR template (`ADR-000-template.md`). An accepted ADR is immutable —
> supersede it with a new one rather than editing it.

**ADR ID:** ADR-001
**Status:** Accepted
**Date:** 2026-08-08
**Decision owner:** Developer
**Review date:** Revisit trigger below.

---

## Context

Pantry's first version is built by one developer for one home cook and must ship a small,
finishable product (driver: simplicity / feasibility). It needs enough internal structure to
keep the competitive core — turning a week of chosen meals into one shopping list — isolated
and testable (`REQ-NF-005`), but it does not need independent deployment of features.

## Options considered

1. **Simple monolith** — fastest to write, but nothing stops the core list logic from
   tangling with recipe storage and auth; the module boundary lives only in someone's head.
2. **Modular monolith** — one deployment, named modules with boundaries respected by
   discipline; a small amount of structure to maintain.
3. **Microservices** — independent scaling and ownership, paid for in operations, deployment,
   and cross-network debugging that a single-user v1 has no use for.

*Compared on:* which keeps the core list logic isolated · which is cheapest to run for one
person · which is cheapest to reverse.

## Decision

Use a **modular monolith**: named domain modules (Recipes, Planning, ShoppingList — core;
Account/Auth — generic) behind an API layer and a data layer, deployed as one unit.

## Reason

It gives enough structure to keep the competitive core isolated and portable to Postgres
later, without the operational cost of distribution — the right fit for one developer and one
user, and the only option here that is cheap to reverse.

## Consequences

- **Positive:** the core list-generation logic is testable in isolation and portable; the app
  is stateless, so a restart is not an incident.
- **Trade-off or limitation:** module boundaries are held by discipline, not enforced by a
  network — they can be violated silently without a guard.
- **Rule the AI assistant must follow during implementation:** each feature area lives inside
  its named module; route handlers must not contain business rules; business logic goes in
  domain modules, never inside UI components; no module reaches another account's data.

## Compliance

| Enforced by | Where |
|---|---|
| FF-001 (no import cycles between UI, domain modules, and data layer) — not wired until Round 8 CI | [`../../04-technical-spec/fitness-functions.md`](../../04-technical-spec/fitness-functions.md) |

## Revisit when

A second developer or team needs to deploy a feature area independently, or one module needs
to scale separately from the rest.

## Impact

| Dimension | Impact |
|---|---|
| Security | Named boundaries keep Account/Auth isolated from domain modules. |
| Reliability | Stateless process; a restart loses no state and is not an incident. |
| Performance | Neutral at one user; no distribution overhead. |
| Cost | Single instance — the cheapest shape to run. |
| Maintainability | High — the core stays isolated and independently testable (the point of the choice). |

## Related

- Related requirements: `REQ-NF-005`, `REQ-F-004`.
- Related technical spec sections: [`technical-spec.md`](../../04-technical-spec/technical-spec.md) §2.
- Supersedes / superseded by: none.

---

> Blueprint: blueprints/01-docs/05-architecture/architecture-decisions/ADR-000-template.md
