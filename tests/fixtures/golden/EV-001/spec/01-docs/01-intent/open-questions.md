# Open Questions

> Source: Appendix A, Ch. 7 §7.11, Appendix C.
> Open questions must be **captured**, not hidden. An unresolved question that reaches an
> AI agent becomes a silent assumption — and silent assumptions become defects.

> **Technical spec guardrail (Appendix C):** open questions must not be treated as
> assumptions.

| ID | Question | Why it matters | Decision owner | Must be answered before | Status | Answer / decision |
|---|---|---|---|---|---|---|
| Q-001 | How many people will use Pantry in the first six months? | Sets the scaling, backup, and uptime expectations; changes what runtime and storage work is justified. | Developer | Runtime & scale (Round 8) | Open | Deferred at express depth — not asked. |
| Q-002 | What is the build horizon for version one? | Forces scope to be decided rather than deferred, and shapes how work is sequenced. | Developer | Task planning (Round 7) | Open | Deferred at express depth — not asked. |
| Q-003 | Which capabilities must exist in version one? | It is the subject of the whole specification; requirements, the data model, and the task plan are all derived from it. | Developer | Requirements (Round 2) | Answered | Save a recipe with its ingredients; plan which meals to cook in a week; generate one shopping list from that week; search saved recipes. Core: generating one shopping list from a chosen week. (Round 2) |
| Q-004 | What is explicitly out of scope for version one? | An unstated exclusion is assumed back in by the next reader; scope silence becomes scope creep. | Developer | Requirements (Round 2) | Open | Deferred at express depth — not asked. |
| Q-005 | What hard constraints already exist (budget, single small server, data-storage limits, mandated technology)? | A constraint changes the architecture, so it must not be inferred — it has to be stated. | Developer | Architecture (Round 5) | Open | Deferred at express depth — not asked. |
| Q-006 | Does data need to be isolated between accounts, and to what guarantee level? | Baseline `account_id` scoping is in the schema, but the formal isolation posture (row scoping vs stronger tenant separation) shapes every query and the security tests. | Developer | Security spec (Round 6) | Open | Deferred at express depth — not asked (Round 3 Q3). |
| Q-007 | Which external services will version one depend on? | Settles whether the data-and-integration spec has any external blocks and whether rate-limit/timeout rules are needed. | Developer | Security & integrations (Round 6) | Answered | None in version one. (Round 6) |
| Q-008 | Does the system store files that users upload or generate? | "Yes" adds storage, size limits, access control, and retention — a body of work no other answer implies. | Developer | Security & reliability (Round 6) | Answered | Yes — photos of finished dishes, private to the one account. (Round 6) |
| Q-009 | Which authentication model? | The API auth field and the session/failure tests depend on it. | Developer | Architecture (Round 5) | Open | Deferred at express depth — not asked (Round 5 Q3). |
| Q-010 | What does success look like in the first month — the 3–5 measurable signs, including the speed target for the core flow? | Turns "speed of the core task" into a testable number and gives the product a first-month yardstick. | Developer | Product spec / performance target | Open | Deferred at express depth — not asked (Round 4 Q1). |
| Q-011 | What must be true before this is safe to run for real? | These become production-readiness checks and any fitness functions beyond FF-001–003. | Developer | Production readiness (Round 8) | Open | Deferred at express depth — not asked (Round 5 Q4). |
| Q-012 | What must never leak or be logged? | Fixes the exact sensitive-data classification; the baseline (passwords, tokens, secrets, email address) is already enforced, but the full list is unstated. | Developer | Security spec | Open | Deferred at express depth — not asked (Round 6 Q1). |
| Q-013 | When something is slow or fails, what should the user see (clear message + retry / queued / silent retry)? | Sets the user-facing failure UX; the baseline (clear message, preserve input, retry) follows from REQ-NF-003, but the policy is unstated. | Developer | Reliability spec | Open | Deferred at express depth — not asked (Round 6 Q3). |
| Q-014 | How thorough should the test plan be (minimal / standard / thorough)? | Decides how much beyond the driver-led baseline is tested (e.g. full negative RBAC, performance). | Developer | Test plan | Open | Deferred at express depth — not asked (Round 7 Q2). |
| Q-015 | Which environments will exist (is there a test environment between local and production)? | Shapes the deployment pipeline and config-by-environment. | Developer | Deployment | Open | Deferred at express depth — not asked (Round 8 Q2). |
| Q-016 | What is the monitoring appetite (logs only / structured logs + error alerts / full metrics & tracing)? | Sets what is wired before users depend on the app; baseline is structured logs + error alerts. | Developer | Production readiness | Open | Deferred at express depth — not asked (Round 8 Q3). |
| Q-017 | Where will Pantry run (the deployment target)? | Constrains the runtime, secrets mechanism, backup location, and what a rollback means. | Developer | Deployment | Open | Answered "not decided yet" (Round 8 Q1) → recorded as an open question; plan for a container so the choice stays open. |
| Q-018 | What are the concrete toolchain commands (install / test / lint / run / gate)? | The entry point and CI need real commands; the stack is chosen in TASK-001 within ADR-001/002. | Developer | Implementation / CI | Open | Not blocking — set once the stack is chosen in TASK-001. |

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
