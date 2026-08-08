# Recommended Tools and Resources

> Source: Appendix S + Front Matter ("Recommended Tools and Development Environment").
> The workflow does not depend on a specific external platform. **The categories matter
> more than any single brand name.**

For Pantry, the concrete toolchain is **not yet decided** (Q-018). This file records the
categories Pantry needs and marks each unchosen brand/stack as a `[TODO]`. Do not invent a
stack; fill these in when Q-018 is answered.

---

## Tool categories (Appendix S)

| Category | What Pantry needs from it | Pantry choice |
|---|---|---|
| Writing and specs | A place for the PRD, technical spec, ADRs, and this devkit. | Markdown files in-repo (this workspace). |
| Version control | Track specs, tasks, tests, and code; support review and rollback. | Git. |
| AI coding assistant | Build thin vertical slices one task at a time from context. | AI coding agent (per project brief). |
| Code editor | Search, formatting, terminal, project navigation. | Any modern editor. |
| Test runner | Run the 6 test levels (ATEST/UTEST/ITEST/STEST/PTEST/FTEST). | [TODO: choose test runner (Q-018)]. |
| Container runtime | Package Pantry consistently; deployment target is a container. | Docker-compatible tooling (target = container; host TBD, Q-017). |
| Database tooling | Local dev, migrations, inspection for the relational store. | SQLite locally, Postgres-ready (ADR-002); migration tool [TODO: (Q-018)]. |
| CI/CD | Repeatable checks, build, test, deploy, rollback. | [TODO: choose CI/CD (Q-018)]. |
| Monitoring and logs | Visibility into errors, performance, production health. | [TODO: choose monitoring/logging (Q-016)]. |
| Security review | Dependency checks, secret detection, validation testing. | [TODO: choose scanners (Q-018)]; manual checklist meanwhile. |

---

## Development environment (Front Matter)

| Tool area | Pantry choice | Purpose |
|---|---|---|
| Text and specs | Markdown editor | Write intent, PRD, technical spec, checklists, review notes. |
| Code editor | Any modern code editor | Edit source, inspect generated code, run tests, review changes. |
| AI assistant | AI coding agent + chat assistant | Draft specs and tests in chat; build bounded task slices with the agent. |
| Version control | Git | Track specs, tasks, tests, code changes, review decisions. |
| Runtime | [TODO: choose application runtime (Q-018)] | Run the Pantry web app, APIs, tests, scripts. |
| Database | SQLite for dev; PostgreSQL-ready for production (ADR-002) | Model application data; practice migration planning. |
| API testing | Browser, terminal, or API testing client | Check endpoints, payloads, errors, authentication behavior. |
| Containerization | Docker-compatible tooling | Package Pantry as a container (deployment host TBD, Q-017). |

> **No external repository required.** The workflow can be practiced entirely locally.
> A hosting service is an optional collaboration layer.

---

## Choosing an AI assistant by stage (Ch. 4 §4.1)

| Assistant type | Best use | Watch out for |
|---|---|---|
| Chat assistant | Explaining concepts, drafting requirements, improving prompts, reviewing small snippets. | May not understand your full project unless you paste the right context. |
| Editor assistant | Suggesting code inside your editor; small implementation tasks. | Can produce local improvements while missing larger design rules. |
| Agentic coding assistant | Planning and changing multiple files under instruction. | Can overreach if task boundaries are weak. |
| Testing assistant | Drafting unit, integration, and failure test cases from requirements. | May generate shallow tests unless acceptance criteria are clear. |

> **Selection rule:** choose the *simplest* assistant that can help with the current stage.
> Pantry drafts specs and reviews in chat, and builds each thin slice with a bounded agent.

---

## Tool selection checklist (Appendix S)

- [ ] The tool supports your workflow without forcing unnecessary complexity.
- [ ] The team can use it consistently.
- [ ] It supports review, traceability, and rollback where needed.
- [ ] It does not require exposing private data unnecessarily (recipe photos are private, Q-008).
- [ ] It fits the project's budget, skill level, and deployment environment.

---

> **Final note (Appendix S):** tools will change, but the engineering discipline remains
> the same. Start with clear intent, write testable specs, connect specs to tasks and
> tests, review AI output carefully, deploy with rollback plans, and keep the specs alive
> after release.

> Blueprint: blueprints/01-docs/10-reference/recommended-tools.md
