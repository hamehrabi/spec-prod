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

# WORKED EXAMPLE — the terms as ProjectBoard used them

Every definition above, pointing at the real artifact that embodies it.

| Term | ProjectBoard instance |
|---|---|
| **Engineering intent** | "Small teams lose track of task ownership, due dates, and progress…" — written 2026-03-01, before any code request. |
| **Non-functional requirement** | REQ-NF-001: "The task list must load within two seconds for up to 500 tasks." |
| **Acceptance criteria** | AC-002: *Given* a signed-in member, *when* they submit a valid task form, *then* the task is saved and shown in the list. |
| **Product requirements document** | `product-spec.md` — goal, 4 personas, in/out of scope, 8 user stories, must/should/could. |
| **Technical specification** | `technical-spec.md` — 13 sections from system boundary to open decisions. |
| **Architecture decision record** | ADR-001: use a modular monolith. ADR-004 superseded by ADR-005 (email as a background job). |
| **Unit test** | UTEST-005: a 120-character title is accepted; 121 is rejected. |
| **Integration test** | TEST-006: `POST /tasks` creates the row **and** returns 201. |
| **Requirements traceability matrix** | 11 rows; caught `csv.py` shipping with no requirement behind it. |
| **Database migration** | MIG-003: add index `tasks(project_id, status)` — reversible, schema before code. |
| **Continuous integration** | A 7-line `set -e` shell script. It blocked the release when STEST-002 failed. |
| **Deployment** | v1.0.0 on 2026-04-05, after v1.0-rc1 was held for a missing implementation. |
| **Rollback** | Tag `v0.9.3`. Used for real on 2026-03-22 when the 5xx rate hit 6%. |
| **Refactoring** | TASK-006 second pass: validation split from persistence, behavior unchanged, all 6 tests still green. |
| **Spec drift** | Members could only see their own tasks — because an early implementation, not a decision, wrote the requirement. |
| **Context pack** | The one-page brief handed to the agent for TASK-006: requirement, API rule, file map, restrictions. |
| **Agent** | The coding assistant that completed 14 of 16 tasks — and edited a file outside its boundary until rule 3 was tightened. |
| **Version control** | Local Git, no remote for three weeks. Branch per requirement ID; commit messages carry REQ IDs. |

## Terms used in one paragraph

> The **engineering intent** named the problem. It became **acceptance criteria**, which
> became a **unit test** and an **integration test** — written *before* the **agent** got a
> **context pack**. The **requirements traceability matrix** later found code with no
> requirement, and the **spec drift** review found a requirement that had never been a
> decision. A **database migration** shipped schema-first, **continuous integration**
> blocked a release when a security test failed, and a **rollback** tag stood ready the one
> time it was needed.

> Vocabulary is not decoration here: "we have spec drift on REQ-F-006" is a precise,
> actionable sentence. "The docs are a bit out of date" is not.
