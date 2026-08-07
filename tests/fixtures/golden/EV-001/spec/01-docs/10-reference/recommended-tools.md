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
| Runtime | The stack chosen for Pantry (TASK-001) | Run the app, tests, and scripts. |
| Database | SQLite for one person; PostgreSQL as the growth path (ADR-002) | Model application data; practice migration planning. |
| API testing | Browser, terminal, or API testing client | Check endpoints, payloads, errors, authentication behavior. |
| Containerization | Docker-compatible tooling (deployment target undecided, Q-012) | Package and test deployment behavior repeatably. |

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

> Blueprint: blueprints/01-docs/10-reference/recommended-tools.md
