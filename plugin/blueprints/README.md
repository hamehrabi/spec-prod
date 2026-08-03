# Spec-Driven AI Engineering — Reusable Project Template

Built from **"Spec-Driven AI Engineering: Build Reliable Software from Requirements to Code
with AI Agents, Tests, and Production Workflows"** by Gem Iroko — 408 pp., 30 chapters,
Appendices A–S.

**Layer 1** is the book's Recommended Workspace Template (Ch. 4 §4.9), numbered in book
order. **Layer 2** groups each folder's artifacts by lifecycle stage, also in book order.
Every artifact the book defines exists as its own file.

Copy this folder for each new project and rename it after the **product purpose**, not the
technology (Ch. 4 §4.2): `task-manager/`, not `react-fastapi-test/`.

> **The one rule to remember (Front Matter):**
> Before code, write the spec. Before accepting code, run the tests. Before release,
> review the risks. After release, update the spec when reality changes.

---

## Structure

```
project-name/
├── 01-docs/                        project direction and specifications   (Ch. 2, 5–10, 21, 22, 27, 30)
│   ├── 01-intent/                  project-brief · intent · constraints-and-non-goals · open-questions
│   │                               ⭐ subdomain-map
│   ├── 02-requirements/            requirements · ⭐ driving-characteristics
│   ├── 03-product-spec/            product-spec
│   ├── 04-technical-spec/          technical-spec · frontend-component-spec · ⭐ fitness-functions
│   │                               ⭐ runtime-and-scale
│   ├── 05-architecture/            decisions · architecture-decisions/ (ADR template + index)
│   ├── 06-api-and-data-design/     database-design · api-specification · data-and-integration-spec
│   ├── 07-security-and-reliability/ security-specification · reliability-specification
│   │                               ⭐ ai-boundary-spec
│   ├── 08-traceability/            traceability
│   ├── 09-change-control/          spec-change-log
│   └── 10-reference/               repeatable-system · glossary · recommended-tools · appendix-index
├── 02-tasks/                       small controlled work items            (Ch. 4, 14, 29)
│   ├── 01-planning/                task-index · agent-task-list
│   ├── 02-task-files/              TASK-001 (template)
│   └── 03-control/                 scope-change-log · task-handoff-notes
├── 03-tests/                       quality checks                         (Ch. 4, 17, 18)
│   ├── 01-plan/                    test-plan · test-specification
│   ├── 02-functional/              acceptance · unit · integration · end-to-end
│   ├── 03-non-functional/          security-tests · performance-tests · ⭐ ai-evals
│   ├── 04-failure/                 failure-tests · edge-cases-and-failures
│   └── 05-executable/              executable-tests + unit/ integration/ end-to-end/
├── 04-src/                         application code                       (Ch. 4, 8, 12, 20)
│   ├── 01-pages/  02-components/  03-api/  04-services/  05-data/
│   └── README.md                   layer boundaries + refactoring example
├── 05-review/                      review notes and decision records      (Ch. 15, 19, 20, 21, 29)
│   ├── 01-logs/                    change-log · review-log · feedback-register
│   ├── 02-checklists/              code-review · security-review · traceability-review · ⭐ risk-storming
│   ├── 03-version-control/         version-control-checklist · issue-template · pull-request-template
│   └── 04-debugging/               debugging-checklist · debugging-specification
├── 06-agent/                       AI assistant instructions and context  (Ch. 4, 11–13, 29, 30)
│   ├── 01-instructions/            AGENT.md · agent-rules-and-coding-standards
│   ├── 02-context/                 context-pack
│   ├── 03-prompts/                 prompt-library
│   └── 04-handoffs/                product-to-engineering · developer-to-agent · team-workflow-pack
├── 07-ops/                         deployment and maintenance notes       (Ch. 23, 24, 30)
│   ├── 01-deployment/              deployment-checklist · deployment-plan · environment-config
│   │                               cicd-pipeline · Dockerfile.example · database-migration-plan
│   │                               rollback-plan · production-readiness-checklist
│   │                               ⭐ backup-and-recovery
│   ├── 02-monitoring/              monitoring-plan · runbook
│   ├── 03-maintenance/             maintenance-notes · maintenance-log · spec-drift-checklist
│   └── 04-release/                 release-notes · engineering-quality-review
├── README.md  .gitignore  .env.example
```

| Layer-1 folder | Purpose (Ch. 4 §4.3) |
|---|---|
| `01-docs/` | Stores project direction and specifications. **The memory of the project.** |
| `02-tasks/` | Stores small controlled work items for you or the AI assistant. |
| `03-tests/` | Stores test plans, expected checks, and test cases. |
| `04-src/` | Stores the application code. |
| `05-review/` | Stores review notes and decision records. |
| `06-agent/` | Stores AI assistant instructions and context summaries. |
| `07-ops/` | Stores deployment and maintenance notes. |

> **Keep it simple (Ch. 4 §4.3):** you can add more folders later, but do not begin with a
> complex enterprise structure. The **bolded** files below are the Ch. 4 starter set —
> everything else is a deeper artifact you fill in when that stage arrives.

### ⭐ The eight additions

Eight files come from outside the book — six from an architecture review (Richards & Ford,
Ousterhout, Khononov, Hohpe), two from auditing the template against the thirteen
operational layers a production system actually has.

| ⭐ File | Answers |
|---|---|
| `01-intent/subdomain-map.md` | Which parts deserve effort, and which to buy |
| `02-requirements/driving-characteristics.md` | Which three qualities shape the structure |
| `04-technical-spec/fitness-functions.md` | How decisions stay true after they are written |
| `04-technical-spec/runtime-and-scale.md` | Rate limits, cache, scaling, cost ceiling |
| `07-security-and-reliability/ai-boundary-spec.md` | How the model stays replaceable |
| `03-tests/03-non-functional/ai-evals.md` | How you know a change improved the system |
| `05-review/02-checklists/risk-storming.md` | What will hurt you, found before it does |
| `07-ops/01-deployment/backup-and-recovery.md` | What happens when you lose the data |

Three existing files were extended rather than duplicated: `reliability-specification.md`
gained the **outbox pattern and transaction boundaries**, `code-review-checklist.md`
gained the **12 design red flags**, and `database-design.md` gained **file/object storage**.

### The thirteen operational layers

| Layer | Where it lives |
|---|---|
| Frontend | `04-technical-spec/frontend-component-spec.md` |
| APIs & backend logic | `06-api-and-data-design/api-specification.md` · tech-spec §4 |
| Database & storage | `06-api-and-data-design/database-design.md` (+ object storage) |
| Auth & authorization | `07-security-and-reliability/security-specification.md` |
| Hosting & deployment | `07-ops/01-deployment/` |
| Cloud & compute resources | `04-technical-spec/runtime-and-scale.md` §4 |
| CI/CD & version control | `07-ops/01-deployment/cicd-pipeline.md` · `05-review/03-version-control/` |
| Security & access control | security spec + review + tests |
| **Rate limiting** | `04-technical-spec/runtime-and-scale.md` §1 |
| **Cache & CDN** | `04-technical-spec/runtime-and-scale.md` §2 |
| **Load balancing & scalability** | `04-technical-spec/runtime-and-scale.md` §3 |
| Error tracking & logs | `07-ops/02-monitoring/monitoring-plan.md` |
| **Availability & recovery** | `07-ops/01-deployment/backup-and-recovery.md` |

> Most projects answer **"not needed"** to several rows of `runtime-and-scale.md`, and
> that is the point — an explicit *no, because…* is a decision; silence is an accident.

> **Deliberately not added:** bounded-context mapping, the eight sagas, event sourcing,
> CQRS, data mesh, and team topologies. All are in the source books; none earn their
> complexity until you are actually distributed. Reach for them when a specific pain
> appears — not before.

---

## Contents

### 01-docs/

| Sub-folder | File | Purpose | Source |
|---|---|---|---|
| 01-intent | `project-brief.md` | Raw idea, vision vs. implementation, problem-statement formula. | Ch. 2, 16 |
| | **`intent.md`** | Problem, users, goals, scope, constraints. | Ch. 2, App. A |
| | `constraints-and-non-goals.md` | Constraint table and out-of-scope decisions. | Ch. 2, 5, 6 |
| | `open-questions.md` | Unresolved questions; the ambiguity test. | Ch. 2 §2.6 |
| | ⭐ `subdomain-map.md` | Core / generic / supporting — where effort goes, build vs. buy. | *Khononov Ch. 1* |
| 02-requirements | **`requirements.md`** | Functional + non-functional, roles, business rules, acceptance criteria. | Ch. 5 |
| | ⭐ `driving-characteristics.md` | The **three** quality attributes that shape the structure, with measures. | *Richards & Ford Ch. 4–6* |
| 03-product-spec | **`product-spec.md`** | PRD: goals, personas, scope, stories, flows, priorities. | Ch. 6, App. B |
| 04-technical-spec | **`technical-spec.md`** | Architecture, frontend, backend, data, APIs, security, performance, errors. | Ch. 7, 8, App. C |
| | ⭐ `fitness-functions.md` | Automated checks that the architecture still holds. Wired into CI. | *Richards & Ford Ch. 6* |
| | ⭐ `runtime-and-scale.md` | Rate limiting, cache/CDN, scaling, compute & cost ceiling. | *13-layer review* |
| | `frontend-component-spec.md` | Components, props, the five UI states, accessibility. | Ch. 7 §7.4, 27 §27.6 |
| 05-architecture | **`decisions.md`** | Lightweight design-decision log. | Ch. 4 §4.4 |
| | `architecture-decisions/` | ADR template + index. | Ch. 8 §8.8, App. K |
| 06-api-and-data-design | `database-design.md` | Entities, fields, relationships, constraints, indexes, retention. **+ file/object storage.** | Ch. 9, App. E |
| | `api-specification.md` | Endpoints, contracts, status codes, validation, versioning. | Ch. 9, App. D |
| | `data-and-integration-spec.md` | External services, failure behavior, versioning rules. | Ch. 9 §9.7–9.9 |
| 07-security-and-reliability | `security-specification.md` | Auth, RBAC matrix, validation, data protection, secrets, safe errors. | Ch. 21 |
| | `reliability-specification.md` | Failure states, recovery, timeouts, retries, queues, logging. **+ outbox & transaction boundaries.** | Ch. 22 · *Khononov Ch. 9* |
| | ⭐ `ai-boundary-spec.md` | Model replaceability, budgets, guardrails, human-in-the-loop. *(AI only)* | *Richards & Ford Ch. 26* |
| 08-traceability | **`traceability.md`** | Requirements Traceability Matrix + gap analysis. | Ch. 10, App. F |
| 09-change-control | `spec-change-log.md` | Versioning of PRD / tech spec / test spec / agent rules. | Ch. 30 §30.3 |
| 10-reference | `repeatable-system.md` | The reusable process, template library, quality loop, final guidance. | Ch. 30 |
| | `glossary.md` | Key terms. | App. R |
| | `recommended-tools.md` | Tool categories and selection checklist. | App. S |
| | `appendix-index.md` | Where every appendix A–S lives. | App. index |

### 02-tasks/

| Sub-folder | File | Purpose | Source |
|---|---|---|---|
| 01-planning | **`task-index.md`** | Task register, priorities (P0–P3), dependency map. | Ch. 4, 14 §14.5 |
| | `agent-task-list.md` | Feature → task breakdown, agent-friendly task rules. | Ch. 14, 25 §25.8 |
| 02-task-files | **`TASK-001.md`** | Task file template + worked examples. | Ch. 4 §4.5, 14, 16 §16.5 |
| 03-control | `scope-change-log.md` | Scope-change decision trail. | Ch. 14 §14.7, 29 §29.6 |
| | `task-handoff-notes.md` | Prepare / implement / report handoffs and checkpoints. | Ch. 11 §11.7, 29 |

### 03-tests/

| Sub-folder | File | Purpose | Source |
|---|---|---|---|
| 01-plan | **`test-plan.md`** | Overall testing strategy and coverage matrix. | Ch. 4 §4.6, 17 |
| | `test-specification.md` | Per-test fields; reviewing AI-generated tests. | Ch. 17 §17.8, App. G |
| 02-functional | **`acceptance-tests.md`** | Given–When–Then checks from acceptance criteria. | Ch. 4 §4.6 |
| | **`unit-tests.md`** | Logic tested in isolation. | Ch. 4 §4.6, 17 §17.2 |
| | **`integration-tests.md`** | Connected parts + API contract tests. | Ch. 4 §4.6, 17 §17.3 |
| | `end-to-end-tests.md` | Complete user flows + production smoke test. | Ch. 17 §17.4 |
| 03-non-functional | `security-tests.md` | Negative cases, isolation, enumeration, leakage. | Ch. 17 §17.5, 21 |
| | `performance-tests.md` | Targets, data volumes, review risks. | Ch. 17 §17.6, 24 §24.5 |
| | ⭐ `ai-evals.md` | Golden set, scorers, quality floor, regression triggers. *(AI only)* | *architecture review* |
| 04-failure | **`failure-tests.md`** | Invalid input, permissions, missing data, error paths. | Ch. 4 §4.6, 22 |
| | `edge-cases-and-failures.md` | Discovery worksheet: the seven questions. | Ch. 17 §17.7, 30 |
| 05-executable | `executable-tests.md` | How plans map to runnable test code. | Front Matter, Ch. 12 |
| | `unit/ integration/ end-to-end/` | The runnable tests themselves. | Front Matter |

### 04-src/

`README.md` documents layer boundaries and the Ch. 20 §20.8 refactoring example.
Subfolders follow the Ch. 12 §12.4 file map.

### 05-review/

| Sub-folder | File | Purpose | Source |
|---|---|---|---|
| 01-logs | **`change-log.md`** | Dated record of every important change and decision. | Ch. 4 §4.8–4.9 |
| | **`review-log.md`** | Review entries + the five team review layers. | Ch. 4 §4.3, 29 §29.4 |
| | `feedback-register.md` | Feedback → requirement mapping. | Ch. 24 §24.6, 29 §29.5 |
| 02-checklists | `code-review-checklist.md` | Seven review layers + safe refactoring. **+ the 12 design red flags.** | Ch. 20, App. P · *Ousterhout* |
| | `security-review.md` | Auth, authorization, validation, secrets pass. | Ch. 21, App. M |
| | `traceability-review.md` | Forward/backward trace audit. | Ch. 10, 30 |
| | ⭐ `risk-storming.md` | Impact × likelihood — score alone, then reach consensus. | *Richards & Ford Ch. 22* |
| 03-version-control | `version-control-checklist.md` | Branch, commit, PR, merge discipline. | Ch. 15, App. L |
| | `issue-template.md` | Work request tied to a requirement. | Ch. 15 §15.5 |
| | `pull-request-template.md` | Review packet format. | Ch. 15 §15.6, 28 §28.10 |
| 04-debugging | `debugging-checklist.md` | Evidence-first debugging for AI code. | Ch. 19, App. O |
| | `debugging-specification.md` | Bug log, root causes, prevention ledger. | Ch. 19 §19.7 |

### 06-agent/

| Sub-folder | File | Purpose | Source |
|---|---|---|---|
| 01-instructions | **`AGENT.md`** | Project rules, source-of-truth order, boundaries, output format. | Ch. 4 §4.7, 11 §11.8, App. H |
| | `agent-rules-and-coding-standards.md` | Coding standards and rule versioning. | Ch. 30 §30.5 |
| 02-context | **`context-pack.md`** | Per-task context; the context slice pattern. | Ch. 12, App. I |
| 03-prompts | **`prompt-library.md`** | 25+ prompts across the lifecycle. | Ch. 13, App. J |
| 04-handoffs | `product-to-engineering-handoff.md` | Product intent → buildable work. | Ch. 29 §29.2 |
| | `developer-to-agent-handoff.md` | Bounded task briefs for agents. | Ch. 11 §11.4, 29 §29.3 |
| | `team-workflow-pack.md` | Eight-step team workflow, alignment rhythm. | Ch. 29 §29.8 |

### 07-ops/

| Sub-folder | File | Purpose | Source |
|---|---|---|---|
| 01-deployment | **`deployment-checklist.md`** | The release gate you run every time. | Ch. 4 §4.3, 23 §23.8 |
| | `deployment-plan.md` | Full release plan template. | Ch. 23 §23.9 |
| | `environment-config.md` | Config keys, per-environment values, secret inventory. | Ch. 23 §23.3 |
| | `cicd-pipeline.md` | Install → lint → test → build → smoke gates. | Ch. 23 §23.4 |
| | `Dockerfile.example` | Container starting point. | Ch. 23 §23.5 |
| | `database-migration-plan.md` | Reversibility, backfill, deploy order. | Ch. 23 §23.6 |
| | `rollback-plan.md` | Stable version, triggers, owner, comms. | Ch. 23 §23.7 |
| | `production-readiness-checklist.md` | Full readiness pass and sign-off. | App. N, 28 §28.13 |
| | ⭐ `backup-and-recovery.md` | Availability target, RTO/RPO, backup, **restore test log**. | *13-layer review* |
| 02-monitoring | `monitoring-plan.md` | Signals, logging, error tracking, performance. | Ch. 24 |
| | `runbook.md` | Incident procedure and failure playbooks. | App. N |
| 03-maintenance | **`maintenance-notes.md`** | Operational facts, known issues, maintenance loop. | Ch. 4 §4.3, 24 |
| | `maintenance-log.md` | Dated production-learning entries. | Ch. 24, 30 §30.2 |
| | `spec-drift-checklist.md` | After every release + monthly review. | Ch. 24 §24.8, App. Q |
| 04-release | `release-notes.md` | What shipped, when, which requirements. | Front Matter |
| | `engineering-quality-review.md` | Quality metrics and the improvement loop. | Ch. 30 §30.7 |

---

## Start here — the seven startup steps (Ch. 4 §4.9)

| Step | Do this |
|---|---|
| 1 | Create the project root folder, named for the product purpose. |
| 2 | Create the seven folders: docs, tasks, tests, src, review, agent, ops. |
| 3 | Write the Engineering Intent Document in `01-docs/01-intent/intent.md`. |
| 4 | Create `06-agent/01-instructions/AGENT.md` with project rules and boundaries. |
| 5 | Create `02-tasks/01-planning/task-index.md` so every future task has a record. |
| 6 | Create `03-tests/01-plan/test-plan.md` **before** implementation begins. |
| 7 | Use `05-review/01-logs/change-log.md` to record important changes and decisions. |

Then commit a clean baseline before any agent touches the project (Ch. 15 §15.2):
```
git init
git add .
git commit -m "chore(project): create initial spec-driven workspace"
```

---

## Fill order

```
01-docs/01-intent/project-brief.md
        ↓
01-docs/01-intent/intent.md                          ← App. A
        ↓
01-docs/02-requirements/requirements.md              ← Ch. 5
        ↓
01-docs/03-product-spec/product-spec.md              ← App. B
        ↓
01-docs/04-technical-spec/technical-spec.md          ← App. C
   ├─ 01-docs/05-architecture/architecture-decisions/ ← App. K
   ├─ 01-docs/06-api-and-data-design/                 ← App. D, E
   └─ 01-docs/07-security-and-reliability/            ← Ch. 21, 22
        ↓
01-docs/08-traceability/traceability.md              ← App. F  (kept current from here on)
        ↓
03-tests/01-plan/                                    ← App. G
        ↓
02-tasks/01-planning/ + 02-task-files/               ← Ch. 14
        ↓
06-agent/02-context/context-pack.md → code in 04-src/ ← Ch. 12, 16
        ↓
05-review/                                           ← App. L, M, O, P
        ↓
07-ops/                                              ← App. N, Q
        ↓
back to 01-docs (update the spec)                    ← Ch. 24
```

---

## The lifecycle (Ch. 3)

| Stage | Main question | Main artifact | Move forward when |
|---|---|---|---|
| Intent | Why should this exist? | `01-docs/01-intent/intent.md` | Problem, users, goals, scope, constraints are clear. |
| Requirements | What must it do? | `01-docs/02-requirements/requirements.md` | Each requirement is specific and testable. |
| Product spec | How should it work for users? | `01-docs/03-product-spec/product-spec.md` | User flows and feature boundaries are clear. |
| Technical design | How should it be built? | `01-docs/04-technical-spec/technical-spec.md` | Architecture, data, APIs, security, errors are defined. |
| Tasks | What should be built next? | `02-tasks/01-planning/agent-task-list.md` | Tasks are small, ordered, reviewable. |
| Tests | How will it be verified? | `03-tests/01-plan/test-plan.md` | Expected behavior and failure cases are covered. |
| Implementation | What code should change? | `04-src/` | The task is completed within its boundaries. |
| Review / deployment | Is it ready to run? | `05-review/`, `07-ops/` | Code matches the spec and deployment risks are handled. |
| Maintenance | How will it stay correct? | `07-ops/03-maintenance/` | Changes are reflected in the right artifacts. |

### Stage gates — do not pass until true

| Gate | Condition | Book |
|---|---|---|
| Intent → Requirements | Problem, users, goals, constraints, non-goals are written. | Ch. 2 |
| Requirements → PRD | Every requirement is testable and has acceptance criteria. | Ch. 5 |
| PRD → Tech spec | Main user flows and first-version scope are clear. | Ch. 3 §3.3 |
| Tech spec → Tasks | Architecture, data, APIs, security, errors are defined. | Ch. 7 |
| Tasks → Tests | Each task is small, bounded, and has done criteria. | Ch. 14 |
| Tests → Code | You can answer: "How will I know this works without trusting the agent blindly?" | Ch. 16 §16.6 |
| Code → Review | Only approved files changed; tests added or updated. | Ch. 20 |
| Review → Deploy | Requirements met, tests pass, rollback written. | Ch. 23 |
| Deploy → Maintain | Monitoring is live and specs match deployed behavior. | Ch. 24 |

---

## Where does this information belong?

| If you are writing about… | Put it in |
|---|---|
| The problem, users, non-goals | `01-docs/01-intent/` |
| A behavior the system must have | `01-docs/02-requirements/requirements.md` (REQ-…) |
| User journeys, personas, priorities | `01-docs/03-product-spec/product-spec.md` (US-…) |
| Architecture, modules, data flow | `01-docs/04-technical-spec/technical-spec.md` |
| A design choice and its trade-offs | `01-docs/05-architecture/architecture-decisions/` |
| Endpoints, contracts, status codes | `01-docs/06-api-and-data-design/api-specification.md` |
| Entities, fields, indexes, retention | `01-docs/06-api-and-data-design/database-design.md` |
| Who can do what | `01-docs/07-security-and-reliability/security-specification.md` |
| What happens when something fails | `01-docs/07-security-and-reliability/reliability-specification.md` |
| The next unit of work for an agent | `02-tasks/02-task-files/TASK-###.md` |
| How a requirement will be proven | `03-tests/01-plan/test-specification.md` |
| Whether generated code is acceptable | `05-review/02-checklists/code-review-checklist.md` |
| How the release ships and rolls back | `07-ops/01-deployment/` |
| Rules the AI agent must always follow | `06-agent/01-instructions/AGENT.md` |
| The context an agent gets for one task | `06-agent/02-context/context-pack.md` |

---

## Rules that apply at every stage

- **Do not ask an AI agent to build a feature** until you can explain the requirement,
  acceptance criteria, expected tests, failure states, and review standard. *(How to Use This Book)*
- **Do not ask an agent to "build the whole app."** One bounded task at a time. *(Ch. 11 §11.1)*
- **Exploration is not implementation.** Brainstorm freely, then write the requirement
  before asking for code. *(Ch. 1 §1.2)*
- **The ambiguity test:** could two competent developers build two different things from
  this instruction? If yes, add detail. *(Ch. 2 §2.6)*
- **The one-outcome rule:** if a task has more than one major outcome, split it. *(Ch. 14 §14.3)*
- **Testability is the first quality filter.** If you cannot test a requirement, rewrite it. *(Ch. 1 §1.5)*
- **No new code without a matching approved reason.** *(Ch. 14 §14.7)*
- **Refactor only after tests exist.** Behavior change ≠ refactoring. *(Ch. 20 §20.6)*
- **A fix is incomplete** until code, tests, and specification agree. *(Ch. 19 §19.6)*
- **When behavior changes, update the spec.** *(Ch. 3 §3.9, Ch. 24 §24.8)*

### The central question (Ch. 1 §1.9)

> Can this feature be traced from requirement → specification → task → test → code →
> review → deployment?
>
> If yes, you are practicing Spec-Driven AI Engineering. If no, there is a gap to fix.

---

## Appendix map

Full mapping in [`01-docs/10-reference/appendix-index.md`](01-docs/10-reference/appendix-index.md).

| App. | Title | File |
|---|---|---|
| A | Engineering Intent Document | `01-docs/01-intent/intent.md` |
| B | Product Requirements Document | `01-docs/03-product-spec/product-spec.md` |
| C | Technical Specification | `01-docs/04-technical-spec/technical-spec.md` |
| D | API Specification | `01-docs/06-api-and-data-design/api-specification.md` |
| E | Database Design | `01-docs/06-api-and-data-design/database-design.md` |
| F | Requirements Traceability Matrix | `01-docs/08-traceability/traceability.md` |
| G | Test Specification | `03-tests/01-plan/test-specification.md` |
| H | AI Agent Instruction | `06-agent/01-instructions/AGENT.md` |
| I | Project Context Pack | `06-agent/02-context/context-pack.md` |
| J | Prompt Library | `06-agent/03-prompts/prompt-library.md` |
| K | Architecture Decision Record | `01-docs/05-architecture/architecture-decisions/ADR-000-template.md` |
| L | GitHub Workflow Checklist | `05-review/03-version-control/version-control-checklist.md` |
| M | Security Review Checklist | `05-review/02-checklists/security-review.md` |
| N | Production Readiness Checklist | `07-ops/01-deployment/production-readiness-checklist.md` |
| O | Debugging Checklist for AI Code | `05-review/04-debugging/debugging-checklist.md` |
| P | Code Review Checklist | `05-review/02-checklists/code-review-checklist.md` |
| Q | Maintenance and Spec Drift Checklist | `07-ops/03-maintenance/spec-drift-checklist.md` |
| R | Glossary of Key Terms | `01-docs/10-reference/glossary.md` |
| S | Recommended Tools and Resources | `01-docs/10-reference/recommended-tools.md` |

---

## Adopting this on a team (Ch. 30 §30.8)

| Step | Do | Avoid | Proof of progress |
|---|---|---|---|
| Start small | Use the process on one feature. | Forcing a heavy process on every team at once. | One feature moves spec → tested code cleanly. |
| Create examples | Show completed specs, tasks, tests, reviews. | Handing out blank templates. | Team copies good examples. |
| Make review visible | Review AI output against specs in the open. | Accepting AI output privately. | Review comments become specific. |
| Improve templates | Update templates after real use. | Treating templates as permanent. | Repeated confusion decreases. |
| Train through work | Teach during actual delivery. | Long abstract training. | People use the workflow unprompted. |

After every project, ask one question: **which template should be improved so the same
confusion does not happen again?** *(Ch. 30 §30.4)*
