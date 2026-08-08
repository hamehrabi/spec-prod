# Open Questions

> Source: Appendix A, Ch. 7 §7.11, Appendix C.
> Open questions must be **captured**, not hidden. An unresolved question that reaches an
> AI agent becomes a silent assumption — and silent assumptions become defects.

> **Technical spec guardrail (Appendix C):** open questions must not be treated as
> assumptions.

| ID | Question | Why it matters | Decision owner | Must be answered before | Status | Answer / decision |
|---|---|---|---|---|---|---|
| Q-001 | How many people will use Pantry in the first six months? | Decides whether scaling, caching and backup posture are design inputs or deferred work. Dropped at express depth. | Developer (product owner) | Design | Open | |
| Q-002 | What is the build horizon for version one? | Scope and the task plan need a forcing function to be sequenced against. Dropped at express depth. | Developer (product owner) | Implementation | Open | |
| Q-003 | Which capabilities must exist in version one? | Every later stage derives from this list — requirements, data model, tasks. | Developer (product owner) | Design | Answered | Save a recipe with its ingredients; plan which meals to cook in a week; generate one shopping list from that week; search saved recipes. The one competed on: turning a week of chosen meals into one shopping list. |
| Q-004 | Which capabilities are explicitly out of scope for version one? | An explicit "no" is a decision; a capability nobody ruled out gets assumed in. Dropped at express depth. | Developer (product owner) | Design | Open | |
| Q-005 | What hard constraints already exist? | A constraint changes the architecture, and cannot be inferred. Dropped at express depth. | Developer (product owner) | Design | Open | |
| Q-006 | What does success look like in the first month? | Success measures cannot be tested until they are stated. Dropped at express depth. | Developer (product owner) | Release | Open | |
| Q-007 | What could make the project fail? | Risks decide where review and test effort concentrate. Not part of the interview; captured as an open question. | Developer (product owner) | Design | Open | |
| Q-008 | Does data need to be isolated between customers? | Reaches every query if yes; retrofitting isolation is materially harder than designing for it. Dropped at express depth. | Developer (product owner) | Design | Open | |
| Q-009 | Which authentication model? | The API's auth header, the account schema, and session behaviour all hang on it. Dropped at express depth (Round 5). | Developer (product owner) | Implementation | Open | |
| Q-010 | Which qualities drive the design, and what measurable limits follow for the non-functional requirements? | The non-functional table cannot be tested until its limits are numbers. Asked in Round 4. | Developer (product owner) | Design | Answered | Drivers: simplicity/feasibility, reliability/graceful failure, accessibility. Interface priority: speed of the core task. Limits recorded in REQ-NF-001–006; thresholds proposed by the kit, in FF-001–FF-004. |
| Q-011 | When two planned recipes share an ingredient, does the shopping list combine them into one line, or list them separately? | It is the core capability's central rule — two competent developers would build two different lists. | Developer (product owner) | Design | Open | |
| Q-012 | What must never leak or be logged? | The wrong answer turns a log file into an incident. Dropped at express depth (Round 6). | Developer (product owner) | Implementation | Open | |
| Q-013 | What are the retention and deletion rules — hard or soft delete, and do generated lists outlive their plan? | Deletion behaviour must be enforced by the schema, not improvised in code. | Developer (product owner) | Design | Open | |
| Q-014 | Which external services will you depend on? | Every dependency is an outage and a bill; the integration spec is empty until answered. Asked in Round 6. | Developer (product owner) | Design | Answered | None in version one. The integration specification has no external blocks, and no paid-API rate limit is needed. |
| Q-015 | Does the system store files that users upload or generate? | Files bring storage, size limits, scanning, and retention — a body of work no other answer implies. Asked in Round 6. | Developer (product owner) | Design | Answered | Yes — photos of finished dishes, private to one user. The storage rules the answer does not settle are Q-023. |
| Q-016 | Which architecture style? | Everything in the architecture folder is written against this answer; shape cannot be inferred. Asked in Round 5. | Developer (product owner) | Design | Answered | Modular monolith (ADR-001). |
| Q-017 | Which data store? | The store decides what the data model can promise — transactions, constraints, joins, migrations. Asked in Round 5. | Developer (product owner) | Design | Answered | A relational database — SQLite while it is one person's, with nothing in the schema that would stop it becoming Postgres (ADR-002). |
| Q-018 | Where will this run? | The deployment target constrains the runtime, the store's managed options, secrets, and rollback. Asked in Round 8. | Developer (product owner) | Release | Open | Deliberately deferred in Round 8 ("not decided yet"); the deployment documents plan for a container so the decision stays open at no cost. |
| Q-019 | Which environments will exist? | The gate needs somewhere to run that is not a laptop and not production. Dropped at express depth (Round 8). | Developer (product owner) | Release | Open | |
| Q-020 | What is your monitoring appetite? | Decides whether "did it break?" is answerable without building an observability practice. Dropped at express depth (Round 8). | Developer (product owner) | Release | Open | |
| Q-021 | What must be true before this is safe to run for real? | Turns the chosen qualities into a checkable go-live bar. Dropped at express depth (Round 5). | Developer (product owner) | Release | Open | |
| Q-022 | When something is slow or fails, what should the user see? | The failure-state user messages in the reliability specification cannot be written without it. Dropped at express depth (Round 6). | Developer (product owner) | Implementation | Open | |
| Q-023 | What are the photo storage rules — where stored, maximum size, allowed image types, malware scanning, retention, and which entity a photo attaches to? | The Round 6 answer to Q-015 says photos exist and are private; these are the rules that answer does not settle, and the row and the file can disagree without them. | Developer (product owner) | Implementation | Open | |
| Q-024 | How thorough should the test plan be? | Decides the overall test bar — minimal, standard, or thorough. The plan follows the depth rule (full pyramid for the core, acceptance level for supporting areas) until this is set. Dropped at express depth (Round 7). | Developer (product owner) | Implementation | Open | |

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

> Blueprint: blueprints/01-docs/01-intent/open-questions.md
