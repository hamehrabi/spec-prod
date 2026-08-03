# Recommended Tools and Resources

> Source: Appendix S + Front Matter ("Recommended Tools and Development Environment").
> The workflow does not depend on a specific external platform. **The categories matter
> more than any single brand name.**

---

## Tool categories (Appendix S)

| Category | What you need from it | Examples or options |
|---|---|---|
| Writing and specs | A place to create PRDs, technical specs, templates, decision records. | Word processor, Markdown editor, internal wiki, shared document folder. |
| Version control | Track changes, review work, recover older versions. | Local Git, GitHub-compatible platforms, internal VCS. |
| AI coding assistant | Work from project context, generate code, explain changes, help review tests. | Chat-based assistant, IDE assistant, agentic coding tool. |
| Code editor | Search, formatting, terminal access, project navigation. | Any modern IDE or code editor. |
| Test runner | Repeatably run unit, integration, e2e, security, regression tests. | Language-specific frameworks and CLI test tools. |
| Container runtime | Package and run applications consistently across environments. | Docker-compatible tooling or platform-native containers. |
| Database tooling | Local development, migrations, backup, restore, inspection. | Database clients, migration scripts, admin consoles. |
| CI/CD | Repeatable checks, builds, tests, deployment, rollback. | Platform pipeline, local scripts, internal build system. |
| Monitoring and logs | Visibility into errors, performance, usage, production health. | Logging system, metrics dashboard, error tracker, uptime checks. |
| Security review | Dependency checks, secret detection, access review, validation testing. | Static analysis, dependency scanner, secrets scanner, manual checklist. |

---

## Development environment (Front Matter)

| Tool area | Recommended choice | Purpose |
|---|---|---|
| Text and specs | Any document or Markdown editor | Write intent documents, PRDs, technical specs, checklists, review notes. |
| Code editor | Any modern code editor | Edit source, inspect generated code, run tests, review changes. |
| AI assistant | Any AI coding or chat assistant | Generate drafts, propose tests, explain errors, assist implementation. |
| Version control | Local Git or another change-tracking method | Track specs, tasks, tests, code changes, review decisions. |
| Runtime | Python and/or Node.js, depending on the project | Run examples, simple APIs, tests, scripts. |
| Database | SQLite for learning; PostgreSQL for production-style thinking | Model application data; practice migration planning. |
| API testing | Browser, terminal, or API testing client | Check endpoints, payloads, errors, authentication behavior. |
| Containerization | Docker-compatible tooling (optional) | Package and test deployment behavior repeatably. |

> **No external repository required.** The workflow can be practiced entirely locally.
> GitHub or another hosting service is an optional collaboration layer.

---

## Choosing an AI assistant by stage (Ch. 4 §4.1)

| Assistant type | Best use | Watch out for |
|---|---|---|
| Chat assistant | Explaining concepts, drafting requirements, improving prompts, reviewing small snippets. | May not understand your full project unless you paste the right context. |
| Editor assistant | Suggesting code inside your editor; small implementation tasks. | Can produce local improvements while missing larger design rules. |
| Agentic coding assistant | Planning and changing multiple files under instruction. | Can overreach if task boundaries are weak. |
| Testing assistant | Drafting unit, integration, and failure test cases from requirements. | May generate shallow tests unless acceptance criteria are clear. |

> **Selection rule:** choose the *simplest* assistant that can help with the current stage.
> You do not need an agentic tool for every task — a normal chat assistant is often safer
> for requirements and review.

---

## Tool selection checklist (Appendix S)

- [ ] The tool supports your workflow without forcing unnecessary complexity.
- [ ] The team can use it consistently.
- [ ] It supports review, traceability, and rollback where needed.
- [ ] It does not require exposing private data unnecessarily.
- [ ] It fits the project's budget, skill level, and deployment environment.

---

> **Final note (Appendix S):** tools will change, but the engineering discipline remains
> the same. Start with clear intent, write testable specs, connect specs to tasks and
> tests, review AI output carefully, deploy with rollback plans, and keep the specs alive
> after release.

---

# WORKED EXAMPLE — ProjectBoard tool choices

Chosen under CON-004 (single low-cost instance), CON-006 (no paid services in v1), and a
one-developer team.

| Category | Chosen | Why this one here |
|---|---|---|
| Writing and specs | Markdown files inside the repo | Specs version with the code; the agent can read them directly. No second system to drift. |
| Version control | Local Git, no remote for the first 3 weeks | Isolation, review, and rollback were needed from day one; a hosting platform was not. |
| AI coding assistant | Chat assistant for specs and review; agentic tool for bounded tasks | Ch. 4 §4.1 — the simplest assistant that fits the stage. Specs were drafted in chat, never by an agent with file access. |
| Code editor | Any modern editor | No constraint. |
| Test runner | `pytest` | One command for all 6 test levels; test IDs map to file names. |
| Container runtime | Docker | Closed the gap between the dev SQLite setup and the production Postgres instance. |
| Database tooling | SQLite locally, Postgres in test and production | SQLite for speed; Postgres wherever a migration must be proven (MIG-003 lock behavior). |
| CI/CD | A local `set -e` shell script | CON-006 blocked paid CI. The gate is the script, not the platform. |
| Monitoring and logs | Structured JSON to stdout + an aggregator | `request_id` on every line is what made INC-001 solvable. |
| Security review | Manual checklist + a secrets scanner in the gate script | The scanner caught `.env` in history; the checklist caught BUG-003. |

## Tool selection checklist, applied

| Check | Verdict |
|---|---|
| Supports the workflow without unnecessary complexity | ✅ Kubernetes and a managed CI platform were both rejected as over-scale for one developer. |
| The team can use it consistently | ✅ One command (`./scripts/gate.sh`) for the whole pipeline. |
| Supports review, traceability, and rollback | ✅ Git tags gave the rollback point; commit messages carry requirement IDs. |
| Does not expose private data unnecessarily | ✅ No remote repository for the first three weeks; logs carry IDs, never emails. |
| Fits budget, skill level, and environment | ✅ Zero paid services in v1 (CON-006). |

## The choice that was reconsidered

> **CI.** The first instinct was to add a hosted pipeline. CON-006 forbade it, so the gate
> became a 7-line shell script with `set -e`. It ran the identical stages, blocked the
> STEST-002 failure exactly as a hosted runner would have, and cost nothing.
>
> The discipline came from the **stages and the gate**, not from the platform — which is
> precisely Appendix S's point: *tools will change, but the engineering discipline remains
> the same.*
