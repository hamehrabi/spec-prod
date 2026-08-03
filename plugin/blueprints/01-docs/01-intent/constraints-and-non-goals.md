# Constraints and Non-Goals

> Source: Ch. 30 §30.2, Ch. 5 §5.6, Ch. 6 §6.5.
> Out-of-scope decisions are as important as in-scope decisions — they protect focus and
> stop the agent from adding features you never approved.

## Constraints

A constraint is a fixed condition that limits the solution. State real-world limits before
implementation, because AI agents invent ideal solutions.

| ID | Type | Constraint |
|---|---|---|
| CON-001 | Technology | |
| CON-002 | Time | |
| CON-003 | Data | |
| CON-004 | Environment | |
| CON-005 | Integration | |
| CON-006 | Budget | |
| CON-007 | Compliance / privacy | |
| CON-008 | Team skill | |

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
| | | Possible later version / Deferred / Rejected |
| | | |
| | | |

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

# WORKED EXAMPLE — ProjectBoard

## Constraints

| ID | Type | Constraint |
|---|---|---|
| CON-001 | Technology | The first version must support web browsers only. |
| CON-002 | Time | The first working version must be small enough to build in one week. |
| CON-003 | Data | The system must not store payment card details. |
| CON-004 | Environment | The application must run on a single low-cost cloud instance. |
| CON-005 | Integration | Task data must be exportable as CSV. |
| CON-006 | Budget | No paid third-party services in v1. |
| CON-007 | Compliance / privacy | Only collect name and email; no other personal data. |
| CON-008 | Team skill | One developer; avoid microservices and orchestration tooling. |

## Non-goals / out of scope

| Item | Reason it is excluded now | Future status |
|---|---|---|
| Real-time chat | v1 focuses on task tracking, not conversation. | Possible later version. |
| Mobile app | v1 is web-only to reduce complexity. | After the web workflow is stable. |
| Advanced reporting | Basic task status is enough for v1. | After users request specific reports. |
| Multiple assignees per task | Single ownership is simpler for v1. | Revisit after testing real team workflows. |
| File uploads | Storage, scanning, and quotas add a week of work. | Deferred to v2. |
| Billing / subscriptions | No paying customers yet. | Rejected for v1. |

## Why each in-scope feature belongs now

| Feature | One-sentence justification |
|---|---|
| Create task | The product has no value if work cannot be captured. |
| Assign task | Team work requires visible ownership. |
| Update status | Progress tracking is the core product promise. |
| List tasks by project | Users need one place to see current work. |
