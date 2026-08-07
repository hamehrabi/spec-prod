# Constraints and Non-Goals

> Source: Ch. 30 §30.2, Ch. 5 §5.6, Ch. 6 §6.5.
> Out-of-scope decisions are as important as in-scope decisions — they protect focus and
> stop the agent from adding features you never approved.

## Constraints

A constraint is a fixed condition that limits the solution. State real-world limits before
implementation, because AI agents invent ideal solutions.

> **Not asked at express depth.** Hard constraints change the architecture, and inference
> forbids guessing one, so every row below is an open `[TODO]` rather than a default that
> would "probably" apply. See Q-004 (and Q-002 for the build horizon).

| ID | Type | Constraint |
|---|---|---|
| CON-001 | Technology | [TODO: any mandated or forbidden technology? — Q-004] |
| CON-002 | Time | [TODO: build horizon for version one — Q-002] |
| CON-003 | Data | [TODO: is any data forbidden from being stored? — Q-004] |
| CON-004 | Environment | [TODO: any environment ceiling — server size, region? — Q-004] |
| CON-005 | Integration | [TODO: any required integration or export format? — Q-004] |
| CON-006 | Budget | [TODO: any budget limit, e.g. no paid services? — Q-004] |
| CON-007 | Compliance / privacy | [TODO: any compliance or privacy constraint? — Q-004] |
| CON-008 | Team skill | [TODO: any team-skill constraint? — Q-004] |

**Examples (Ch. 5 §5.6)**

| Type | Example |
|---|---|
| Technology | The frontend must be built with plain HTML, CSS, and JavaScript for v1. |
| Time | The first working version must be small enough to build in one week. |
| Data | The system must not store payment card details. |
| Environment | The application must run on a low-cost cloud instance. |
| Integration | The system must export task data as CSV. |

> **Warning:** do not let a constraint become an excuse for poor design. A constraint
> guides the solution; it does not lower the quality standard.

---

## Non-goals / out of scope

State whether each item is excluded **permanently**, **deferred**, or **waiting for
information**.

| Item | Reason it is excluded now | Future status |
|---|---|---|
| [TODO: which capabilities are explicitly out of scope for version one? — Q-003] | Out-of-scope was not asked at express depth. | Waiting for information |

**Example (Ch. 6 §6.5)**

| Out-of-scope item | Reason | Future status |
|---|---|---|
| Real-time chat | v1 focuses on task tracking, not conversation. | Possible later version. |
| Mobile app | v1 will be web-only to reduce complexity. | After web workflow is stable. |
| Advanced reporting | Basic task status is enough for v1. | After users request specific reports. |
| Multiple assignees per task | Single ownership is simpler for v1. | Revisit after testing real team workflows. |

---

## Scope control habit (Ch. 6 §6.4)

For every feature you include, write one sentence explaining why it belongs in **this**
version. If you cannot explain the value, move it to the table above.

**Prioritization test (Ch. 6 §6.8):** if this feature is missing, can you still test the
main product idea? If yes, it is probably not a must-have for v1.

---

> Blueprint: blueprints/01-docs/01-intent/constraints-and-non-goals.md
