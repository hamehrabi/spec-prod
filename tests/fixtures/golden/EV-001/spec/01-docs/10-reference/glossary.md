# Glossary of Key Terms

> Source: Appendix R. Practical definitions as used throughout the book.

| Term | Definition |
|---|---|
| **Acceptance criteria** | Clear conditions that prove a requirement has been met. |
| **Agent** | An AI system or assistant that performs a defined engineering task using context and instructions. |
| **Architecture decision record (ADR)** | A short document explaining an important technical decision and its trade-offs. |
| **Context pack** | A focused package of project information given to an AI agent for a specific task. |
| **Continuous integration** | A workflow that checks code changes with automated tests and validation. |
| **Database migration** | A controlled change to the database structure or data. |
| **Deployment** | The process of releasing software into an environment where users or systems can use it. |
| **Engineering intent** | The early statement of why a project exists and what outcome it should create. |
| **Integration test** | A test that checks whether connected components work together. |
| **Non-functional requirement** | A requirement about quality attributes such as security, reliability, performance, or usability. |
| **Product requirements document (PRD)** | A document describing what the product or feature must do and why it matters. |
| **Refactoring** | Improving code structure without changing intended behavior. |
| **Requirements traceability matrix (RTM)** | A table connecting requirements to specs, tasks, tests, code, and review evidence. |
| **Rollback** | A planned way to return to a safer previous state after a failed release. |
| **Spec drift** | The gap that appears when actual software behavior no longer matches the written specification. |
| **Technical specification** | A document explaining how approved product requirements will be designed and implemented. |
| **Unit test** | A test for one small piece of behavior, usually a function or class. |
| **Version control** | A disciplined way to track, review, and recover changes to files over time. |

---

## Additional terms used in this template

| Term | Definition |
|---|---|
| **Acceptance test** | A test written from the user or business view that proves a requirement works end to end. |
| **Business rule** | A policy decision the software must enforce, written separately from implementation. |
| **Constraint** | A fixed condition that limits the solution (budget, time, technology, compliance, device). |
| **Edge case** | An unusual but possible situation the system must still handle correctly. |
| **Failure condition** | A situation where the system cannot complete the request safely. |
| **Idempotency** | The property that repeating an operation produces no additional harmful effect — a prerequisite for safe retries. |
| **Modular monolith** | One deployable application organized internally into clear modules with respected boundaries. |
| **Non-goal** | Something the team deliberately chooses not to build in this release. |
| **Observability** | The ability to use logs, metrics, and traces together to understand *why* a system behaved as it did. |
| **Quality gate** | A condition that must be true before work is allowed to move to the next stage. |
| **RBAC** | Role-based access control: permissions defined per role instead of per user. |
| **Scope creep** | New features entering the work without being approved in the specification. |
| **Shallow test** | A test that confirms something happened without proving the behavior was correct. |
| **Smoke test** | A short check of core flows run immediately after deployment. |
| **Stage gate** | A checkpoint between lifecycle stages that prevents unfinished work from moving forward. |
| **Vibe coding** | Prompting an AI repeatedly until the result "feels right" — useful for exploration, unsafe for production. |

---

## Pantry's own terms

| Term | Definition |
|---|---|
| **Recipe** | A saved dish with a title and one or more ingredient lines, belonging to one account. |
| **Ingredient line** | One ingredient entry inside a recipe, with a stable position. |
| **Weekly plan** | The set of meals an account holder chooses to cook in one week. |
| **Planned meal** | One recipe placed into a weekly plan (BR-002: same account only). |
| **Shopping list** | The single list generated from one weekly plan, covering every ingredient line of that week (BR-001). |
| **Dish photo** | A private photo of a finished dish, visible only to its owner (SEC-Z-002). |

> Blueprint: blueprints/01-docs/10-reference/glossary.md
