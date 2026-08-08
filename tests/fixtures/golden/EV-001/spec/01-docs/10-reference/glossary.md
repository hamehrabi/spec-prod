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

## Pantry domain terms

| Term | Definition |
|---|---|
| **Account** | The single owner's identity in Pantry; one account per person, no sharing. |
| **Recipe** | A saved dish with a title, its ingredient lines, and optional private photo. |
| **IngredientLine** | One ingredient entry on a Recipe: name, quantity, and unit. |
| **WeeklyPlan** | A named week that groups the meals the home cook has chosen to cook. |
| **PlannedMeal** | A single Recipe placed into a WeeklyPlan for a chosen day or slot. |
| **ShoppingList** | The one consolidated list generated from a WeeklyPlan's planned meals. |
| **ShoppingListItem** | One line on a ShoppingList: a consolidated ingredient with quantity, tickable when bought. |
| **Home cook** | The single B2C user Pantry serves — a person planning meals for their household. |
| **Week** | The planning window a WeeklyPlan covers; the unit of meal selection turned into one list. |
| **Shopping list** | The consolidated buy-list output of the core capability (see ShoppingList). |
| **Core capability** | Turning a chosen week of meals into ONE consolidated shopping list (REQ-F-004). |

---

## Additional terms used in this template

| Term | Definition |
|---|---|
| **Acceptance test** | A test written from the user or business view that proves a requirement works end to end. |
| **ADR** | Architecture decision record (see above); Pantry cites ADR-001 modular monolith and ADR-002 relational store. |
| **Business rule** | A policy decision the software must enforce, written separately from implementation (BR-001…004). |
| **Constraint** | A fixed condition that limits the solution (budget, time, technology, compliance, device). |
| **Edge case** | An unusual but possible situation the system must still handle correctly. |
| **Failure condition** | A situation where the system cannot complete the request safely. |
| **Fitness function** | An automated check that guards a driver over time; Pantry uses FF-001 simplicity, FF-002 reliability, FF-003 accessibility. |
| **Idempotency** | The property that repeating an operation produces no additional harmful effect — a prerequisite for safe retries. |
| **Modular monolith** | One deployable application organized internally into clear modules with respected boundaries (ADR-001). |
| **Non-goal** | Something the team deliberately chooses not to build in this release. |
| **Observability** | The ability to use logs, metrics, and traces together to understand *why* a system behaved as it did. |
| **Quality gate** | A condition that must be true before work is allowed to move to the next stage. |
| **RBAC** | Role-based access control: permissions defined per role instead of per user (Pantry has one owner role, REQ-R-001). |
| **Scope creep** | New features entering the work without being approved in the specification. |
| **Shallow test** | A test that confirms something happened without proving the behavior was correct. |
| **Smoke test** | A short check of core flows run immediately after deployment. |
| **Stage gate** | A checkpoint between lifecycle stages that prevents unfinished work from moving forward. |
| **Vibe coding** | Prompting an AI repeatedly until the result "feels right" — useful for exploration, unsafe for production. |

> Blueprint: blueprints/01-docs/10-reference/glossary.md
