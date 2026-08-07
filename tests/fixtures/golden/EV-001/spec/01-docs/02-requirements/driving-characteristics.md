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
| Simplicity / feasibility | ✅ | Version one must be finishable; keeps scope and structure small. |
| Reliability / graceful failure | ✅ | Losing the recipe library would end the project; failures must be safe and recoverable. |
| Accessibility | ✅ | A consumer web app for all home cooks must be usable by keyboard and screen reader. |
| Security / access control | ❌ | Already a hard constraint (single-user privacy) with deny tests; a driver slot buys nothing more. |
| Performance | ❌ | Single user, small data. Speed of the core task matters but is not a structural driver — revisit if scale grows (Q-001). |
| Scalability | ❌ | One cook, one dataset. Revisit if it becomes multi-user (Q-005). |
| Auditability | ❌ | No compliance or multi-actor history need in a single-user tool. |

## Step 3 — The three drivers (unordered)

| # | Characteristic | Precise definition | Observable measure | Fitness function |
|---|---|---|---|---|
| 1 | **Simplicity / feasibility** | One builder can add a feature end to end in a day; modules stay decoupled. | Cyclomatic complexity < 10; 0 import cycles between layers. | → `../04-technical-spec/fitness-functions.md` FF-001, FF-002 |
| 2 | **Reliability / graceful failure** | A failed action shows a clear error and never loses the recipe library or the weekly plan. | 0 stack traces reach users; every core write path has a failure-path test. | FF-003 |
| 3 | **Accessibility** | The interface is operable by keyboard and usable with a screen reader. | 0 critical automated accessibility violations on key screens. | FF-004 |

> If you cannot state a **measure**, the definition is too vague. Rewrite it before
> moving to the technical spec.

## Step 4 — Explicitly NOT driving

| Characteristic | Why it is not a driver here |
|---|---|
| Security / access control | A hard constraint with deny tests (FF-005), not a driver — the slot is better spent elsewhere. |
| Performance | Single user, small data; speed of the core task is a UX priority, not a structural driver. Revisit at scale (Q-001). |
| Scalability | One cook, one dataset. Revisit if multi-user (Q-005). |
| Auditability | No multi-actor or compliance history need in a single-user tool. |

---

> Blueprint source: this file is new to the template — added from the architecture review.

> Blueprint: blueprints/01-docs/02-requirements/driving-characteristics.md
