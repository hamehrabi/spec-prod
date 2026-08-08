# Pantry — specification workspace map

This folder is a specification workspace. It is a map, not a manual: every rule,
requirement, and schema lives in exactly one file below, and this page only points.

## Start here

| What you need | Which file |
|---|---|
| The idea, the problem, and the goal | [01-docs/01-intent/intent.md](01-docs/01-intent/intent.md) |
| What must be built, and its acceptance criteria | [01-docs/02-requirements/requirements.md](01-docs/02-requirements/requirements.md) |
| How the product behaves, screen by screen | [01-docs/03-product-spec/product-spec.md](01-docs/03-product-spec/product-spec.md) |
| Technical decisions and failure states | [01-docs/04-technical-spec/technical-spec.md](01-docs/04-technical-spec/technical-spec.md) |
| Architecture decisions (ADR index) | [01-docs/05-architecture/architecture-decisions/adr-index.md](01-docs/05-architecture/architecture-decisions/adr-index.md) |
| The data model and schema | [01-docs/06-api-and-data-design/database-design.md](01-docs/06-api-and-data-design/database-design.md) |
| The API contract | [01-docs/06-api-and-data-design/api-specification.md](01-docs/06-api-and-data-design/api-specification.md) |
| Security rules and deny expectations | [01-docs/07-security-and-reliability/security-specification.md](01-docs/07-security-and-reliability/security-specification.md) |
| What is still undecided | [01-docs/01-intent/open-questions.md](01-docs/01-intent/open-questions.md) |
| The task list and what is blocked | [02-tasks/01-planning/task-index.md](02-tasks/01-planning/task-index.md) |
| The test plan and every test ID | [03-tests/01-plan/test-specification.md](03-tests/01-plan/test-specification.md) |
| Requirement → task → test chains | [01-docs/08-traceability/traceability.md](01-docs/08-traceability/traceability.md) |
| What changed, and every accepted stage | [01-docs/09-change-control/spec-change-log.md](01-docs/09-change-control/spec-change-log.md) |

## Working a task

1. Read [06-agent/01-instructions/AGENT.md](06-agent/01-instructions/AGENT.md) first.
   The working rules live there; this map does not restate them.
2. Take the next unblocked task from
   [02-tasks/01-planning/task-index.md](02-tasks/01-planning/task-index.md) — TASK-001 first.
3. Load [06-agent/02-context/context-pack.md](06-agent/02-context/context-pack.md) plus the
   task's own file under [02-tasks/02-task-files/](02-tasks/02-task-files/).
4. Use the prompts in [06-agent/03-prompts/prompt-library.md](06-agent/03-prompts/prompt-library.md).
5. Record the result in [02-tasks/03-control/task-handoff-notes.md](02-tasks/03-control/task-handoff-notes.md).

## Never

- Never start a task that is blocked on an open question. An unresolved question is a
  decision nobody made, not an assumption you may fill in.
- Never let code move ahead of this specification — the requirement, test, and task change
  first, in [01-docs/09-change-control/spec-change-log.md](01-docs/09-change-control/spec-change-log.md).
- Never commit or log a secret. `.env` is excluded by [.gitignore](.gitignore) and stays that way.
- Never cross account scope. REQ-R-001 and its deny tests are the boundary.

## Commands

| Action | Command |
|---|---|
| install | [TODO: ask the team - what installs dependencies? No stack is chosen yet; TASK-001 establishes the project structure.] |
| test | [TODO: ask the team - what runs the test suite? Follows the stack chosen in TASK-001.] |
| lint | [TODO: ask the team - what runs the linter? Follows the stack chosen in TASK-001.] |
| run | [TODO: ask the team - what starts the app locally? Follows the stack chosen in TASK-001.] |
| gate | [TODO: ask the team - the local gate script in [07-ops/01-deployment/cicd-pipeline.md](07-ops/01-deployment/cicd-pipeline.md) is the pipeline until Q-018 is answered; fill its command slots with the stack's real commands.] |

## Where things stand

- **Stage:** all eight intake rounds are accepted and validated; the workspace is complete.
- **Next task:** TASK-001 — create project structure and config loading.
- **Blocked tasks:** TASK-002 (on Q-009, authentication model), TASK-012 (on Q-011, the
  shared-ingredient rule — the core capability's central decision), TASK-017 (on Q-023,
  photo storage rules). Answer those three in
  [01-docs/01-intent/open-questions.md](01-docs/01-intent/open-questions.md) to unblock them.
- **Produced by:** spec-driven-devkit v0.1.0.
