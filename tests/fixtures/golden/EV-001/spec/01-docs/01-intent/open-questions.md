# Open Questions

> Source: Appendix A, Ch. 7 §7.11, Appendix C.
> Open questions must be **captured**, not hidden. An unresolved question that reaches an
> AI agent becomes a silent assumption — and silent assumptions become defects.

> **Technical spec guardrail (Appendix C):** open questions must not be treated as
> assumptions.

| ID | Question | Why it matters | Decision owner | Must be answered before | Status | Answer / decision |
|---|---|---|---|---|---|---|
| Q-001 | How many people will use Pantry in the first six months? | Decides whether scaling, caching and backup frequency are needed; shapes runtime-and-scale and the backup design. | Developer (product owner) | Design | Open | |
| Q-002 | What is the build horizon for version one? | Decides how much scope version one can hold and how the task plan is sequenced. | Developer | Design | Open | |
| Q-003 | Which capabilities are explicitly out of scope for version one? | Prevents the build agent assuming an un-ruled-out feature is in scope. | Developer (product owner) | Design | Open | |
| Q-004 | What hard constraints already exist (technology, data, environment, budget, compliance, team)? | Constraints change the architecture; inference forbids guessing one, so they must be stated. | Developer | Design | Open | |
| Q-005 | Does data need to be isolated between customers (multi-tenancy)? | Reaches every query; retrofitting isolation is materially harder than designing for it. | Developer | Design | Open | |
| Q-006 | Which authentication model (email+password sessions, third-party, OAuth, magic link)? | Needed by the API auth field and every protected endpoint. | Developer | Implementation | Open | |
| Q-007 | Which external services will version one depend on? | Settles the integration specification and rate-limit handling. | Developer | Design | Answered | None in version one (Round 6). No integration blocks; no paid-API rate limit. |
| Q-008 | Does the system store uploaded or generated files, and under what storage rules? | Adds storage, size limits, access control, and a retention rule. | Developer | Design | Answered | Yes — private dish photos, in private storage, with size/type limits, content-type verification, and orphan cleanup (Round 6). |
| Q-009 | When generating a shopping list, should identical ingredients across meals be merged into one line, and how are units combined? | A genuine ambiguity in the core capability; two builders would do it differently. | Developer (product owner) | Design | Open | |
| Q-010 | What does success look like in the first month? | Turns the product goal into an observable metric to steer by. | Developer (product owner) | Release | Open | |
| Q-011 | Which architecture style and data store? | Everything in the architecture folder and the schema types is written against this. | Developer | Design | Answered | Modular monolith (ADR-001); relational store — SQLite now, kept Postgres-portable (ADR-002). |
| Q-012 | Where will this run (deployment/hosting target)? | Constrains the runtime, the secrets mechanism, and what a rollback means. | Developer | Release | Answered | Not decided yet (Round 8) — plan for a container so the choice stays open at no cost; pick a host before release. |
| Q-013 | What must be true before this is safe to run for real? | Turns the chosen qualities into checkable pre-launch conditions. | Developer | Release | Open | |
| Q-014 | What must never leak or be logged? | A leaked credential or personal field turns a log file into an incident. | Developer | Implementation | Open | |
| Q-015 | When something is slow or fails, what should the user see? | Decides the failure UX — a clear message and retry, a queued status, or silent retry. | Developer (product owner) | Implementation | Open | |
| Q-016 | How thorough should the test plan be (standard, minimal, or thorough)? | Sets how much test effort v1 carries; the plan defaults to standard until decided. | Developer | Implementation | Open | |
| Q-017 | Which environments will exist (local, test, production)? | Decides where the release gate runs and what "production" means. | Developer | Release | Open | |
| Q-018 | What is the monitoring appetite (logs + alerts, logs only, or full metrics)? | Sets how much observability v1 builds; the plan defaults to structured logs plus error alerts. | Developer | Release | Open | |

**Status values:** Open · Answered · Deferred · Rejected

---

## The ambiguity test (Ch. 2 §2.6)

Before moving forward, ask: *Could two competent developers build two different things
from this instruction?* If yes, it belongs in this table.

| Ambiguous statement | Why it is dangerous | Clarified version |
|---|---|---|
| "Users can create tasks." | Does not define fields, ownership, deadlines, or permissions. | "A signed-in user can create a task with title, description, due date, priority, and assignee." |
| "Admins can manage users." | Does not say what *manage* means. | "An admin can view users, deactivate accounts, reset roles, and see account status." |
| "The app should be secure." | Too broad to test. | "The app requires login, role-based access, input validation, and safe error messages." |

---

> Blueprint: blueprints/01-docs/01-intent/open-questions.md
