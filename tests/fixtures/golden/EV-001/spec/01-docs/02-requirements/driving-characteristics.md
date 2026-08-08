# driving-characteristics.md — Pick Three

> **Purpose:** choose the small set of quality attributes that will shape the structure.
> **When you use it:** after requirements, before the technical spec.
> **Source:** Richards & Ford, *Fundamentals of Software Architecture*, Ch. 4–6.

> **Pick three. More than three and you have prioritised nothing.**
> Every characteristic you support adds effort, complexity, and interaction effects.

---

## Step 1 — Translate business concerns into candidates

| Business concern (their words) | Candidate characteristics |
|---|---|
| Time to market | Agility, testability, deployability |
| User satisfaction | Performance, availability, fault tolerance |
| Competitive advantage | Agility, scalability, availability |
| Mergers / acquisitions | Interoperability, extensibility, adaptability |
| Tight time / budget | **Simplicity, feasibility** |

A concern is an **architecture characteristic** only if all three hold:
it is **non-domain**, it **influences structure**, and it is **critical to success**.

Decompose composites: *agility* = deployability + modularity + testability.

## Step 2 — Candidates considered

Keep roughly seven. Preserve the rejected ones — that list is why the decision was sound.

| Candidate | Kept? | Reason |
|---|---|---|
| Simplicity / feasibility | ✅ | Chosen by the developer — it keeps a version one finishable. |
| Reliability / graceful failure | ✅ | Chosen by the developer — what happens when something breaks, rather than whether it does. |
| Accessibility | ✅ | Chosen by the developer. |
| Performance | ❌ | Not one of the three. The interface priority is "speed of the core task", so speed is held as a measured interface requirement (REQ-NF-001), not a driver slot. |
| Scalability | ❌ | User volume is unknown (Q-001); a driver cannot rest on an unanswered question. Revisit when Q-001 is answered. |
| Security | ❌ | Already a hard boundary elsewhere: one role, owner-only scoping (REQ-R-001), deny tests. A driver slot would buy nothing more. |
| Auditability | ❌ | Not chosen; a single-user tool has one author of every change. |

## Step 3 — The three drivers (unordered)

| # | Characteristic | Precise definition | Observable measure | Fitness function |
|---|---|---|---|---|
| 1 | Simplicity / feasibility | One person (or one agent task) can carry a feature slice end to end; the first design that works is the right one. | No import cycles between modules; a slice touches only its own module plus the shared layer. | FF-001 → [`../04-technical-spec/fitness-functions.md`](../04-technical-spec/fitness-functions.md) |
| 2 | Reliability / graceful failure | When something fails, the user is told the truth, keeps what they typed, and the system never reports success for work that did not happen. | Every failure state named in the technical spec §9 has a test; zero false-success paths. | FF-002 |
| 3 | Accessibility | The whole core flow — save a recipe, plan the week, generate the list — is completable with a keyboard alone and usable with a screen reader. | Zero critical violations from an automated accessibility scan of the core screens; a keyboard-only end-to-end test passes. | FF-003 |

> If you cannot state a **measure**, the definition is too vague. Rewrite it before
> moving to the technical spec.

## Step 4 — Explicitly NOT driving

| Characteristic | Why it is not a driver here |
|---|---|
| Performance | The interface priority "speed of the core task" is real but bounded: it is measured by REQ-NF-001 and guarded by FF-004, without shaping the architecture the way a driver would. |
| Scalability | User volume is an open question (Q-001). Revisit when it is answered, or when usage exceeds a personal-library scale. |
| Security | A hard constraint, not a driver: single-user scoping is enforced by REQ-R-001 and its deny tests. |
| Auditability | Not chosen — one user, one author of every change. |

---

> Blueprint source: this file is new to the template — added from the architecture review.

> Blueprint: blueprints/01-docs/02-requirements/driving-characteristics.md
