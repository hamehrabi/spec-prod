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
| One person builds a small first version | **Simplicity, feasibility** |
| Recipes must not be lost, and a failure must not lose the cook's input | Reliability, fault tolerance |
| Usable by anyone, including with a keyboard or screen reader | Accessibility |

A concern is an **architecture characteristic** only if all three hold:
it is **non-domain**, it **influences structure**, and it is **critical to success**.

Decompose composites: *agility* = deployability + modularity + testability.

## Step 2 — Candidates considered

Keep roughly seven. Preserve the rejected ones — that list is why the decision was sound.

| Candidate | Kept? | Reason |
|---|---|---|
| Simplicity / feasibility | ✅ | One person, a small first version — feasibility is a real limit. |
| Reliability / graceful failure | ✅ | The recipe library is years of handwritten cards; a failure that loses data or input ends the project. |
| Accessibility | ✅ | A consumer product used by anyone; keyboard and screen-reader support are part of "usable without training." |
| Security / access control | ❌ | Already a hard constraint (single account, private data) enforced by controls and deny tests — a driver slot buys nothing extra. |
| Performance | ❌ | "Speed of the core task" is the interface priority, but the data is one user's library; revisit if list generation is slow (`Q-010`). |
| Scalability | ❌ | One user in version one; revisit if the user count grows (`Q-001`). |
| Auditability | ❌ | Single user, no compliance need; nothing to reconstruct across actors. |

## Step 3 — The three drivers (unordered)

| # | Characteristic | Precise definition | Observable measure | Fitness function |
|---|---|---|---|---|
| 1 | **Simplicity / feasibility** | One person can add or change a feature end to end; the core list-generation logic does not depend on the UI or the store. | No import cycles between the UI, service, and data layers. | → `../04-technical-spec/fitness-functions.md` (FF-001) |
| 2 | **Reliability / graceful failure** | When an action fails, the cook sees a clear message and loses no input; failures are handled, never crashes. | Every defined failure state has a handler and a failure test; a simulated save failure preserves input. | FF-002 |
| 3 | **Accessibility** | Core screens are operable by keyboard and labelled for assistive technology. | Zero critical automated accessibility violations on core screens; flows completable by keyboard. | FF-003 |

> If you cannot state a **measure**, the definition is too vague. Rewrite it before
> moving to the technical spec.

## Step 4 — Explicitly NOT driving

| Characteristic | Why it is not a driver here |
|---|---|
| Security / access control | A hard constraint already, enforced as controls and deny tests (Round 6) — not a driver slot. |
| Performance | The interface priority is speed of the core task, but the data is small; revisit if the core flow is slow (`Q-010`). |
| Scalability | One user in version one; revisit at a real multi-user count (`Q-001`). |
| Auditability | No compliance obligation and one actor; nothing to audit across users. |

---

> Blueprint source: this file is new to the template — added from the architecture review.

---

> Blueprint: blueprints/01-docs/02-requirements/driving-characteristics.md
