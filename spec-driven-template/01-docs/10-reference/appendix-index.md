# Appendices A–S — Where Each Template Lives

> Source: Appendix Index (pp. 384–385).
> The appendices are **working documents**, not back-matter. In this template each one has
> been placed at the lifecycle stage where you actually use it.

---

## How to use them (Appendix "How to Use These Appendices")

- Start with **Appendix A** when the project idea is still rough.
- Move through **Appendices B–G** *before code generation begins*.
- Use **Appendices H–J** to control how AI agents receive context and instructions.
- Use **Appendices K–Q** to protect architecture decisions, quality, deployment, debugging,
  and maintenance.
- Use **Appendices R and S** as quick reference while building.

---

## Mapping

| App. | Title | File in this template | Stage |
|---|---|---|---|
| **A** | Engineering Intent Document | [`01-docs/01-intent/intent.md`](../01-intent/intent.md) | Intent |
| **B** | Product Requirements Document | [`01-docs/03-product-spec/product-spec.md`](../03-product-spec/product-spec.md) | Specs |
| **C** | Technical Specification | [`01-docs/04-technical-spec/technical-spec.md`](../04-technical-spec/technical-spec.md) | Specs |
| **D** | API Specification | [`01-docs/06-api-and-data-design/api-specification.md`](../06-api-and-data-design/api-specification.md) | Specs |
| **E** | Database Design | [`01-docs/06-api-and-data-design/database-design.md`](../06-api-and-data-design/database-design.md) | Specs |
| **F** | Requirements Traceability Matrix | [`01-docs/08-traceability/traceability.md`](../08-traceability/traceability.md) | Specs → Release |
| **G** | Test Specification | [`03-tests/01-plan/test-specification.md`](../../03-tests/01-plan/test-specification.md) | Tests |
| **H** | AI Agent Instruction | [`06-agent/01-instructions/AGENT.md`](../../06-agent/01-instructions/AGENT.md) | Agent control |
| **I** | Project Context Pack | [`06-agent/02-context/context-pack.md`](../../06-agent/02-context/context-pack.md) | Agent control |
| **J** | Prompt Library | [`06-agent/03-prompts/prompt-library.md`](../../06-agent/03-prompts/prompt-library.md) | Agent control |
| **K** | Architecture Decision Record | [`01-docs/05-architecture/architecture-decisions/ADR-000-template.md`](../05-architecture/architecture-decisions/ADR-000-template.md) | Specs |
| **L** | GitHub Workflow Checklist | [`05-review/03-version-control/version-control-checklist.md`](../../05-review/03-version-control/version-control-checklist.md) | Review |
| **M** | Security Review Checklist | [`05-review/02-checklists/security-review.md`](../../05-review/02-checklists/security-review.md) | Review |
| **N** | Production Readiness Checklist | [`07-ops/01-deployment/production-readiness-checklist.md`](../../07-ops/01-deployment/production-readiness-checklist.md) | Release |
| **O** | Debugging Checklist for AI-Generated Code | [`05-review/04-debugging/debugging-checklist.md`](../../05-review/04-debugging/debugging-checklist.md) | Review |
| **P** | Code Review Checklist | [`05-review/02-checklists/code-review-checklist.md`](../../05-review/02-checklists/code-review-checklist.md) | Review |
| **Q** | Maintenance and Spec Drift Checklist | [`07-ops/03-maintenance/spec-drift-checklist.md`](../../07-ops/03-maintenance/spec-drift-checklist.md) | Release |
| **R** | Glossary of Key Terms | [`01-docs/10-reference/glossary.md`](glossary.md) | Reference |
| **S** | Recommended Tools and Resources | [`01-docs/10-reference/recommended-tools.md`](recommended-tools.md) | Reference |

---

## Chapter → file map (artifacts the chapters define outside the appendices)

| Chapter | Artifact | File |
|---|---|---|
| Ch. 2 | Project brief, constraints, non-goals, open questions | [`01-docs/01-intent/`](../01-intent/) |
| Ch. 5 | Requirements document | [`01-docs/02-requirements/requirements.md`](../02-requirements/requirements.md) |
| Ch. 8 | ADR index and architecture guidance | [`01-docs/05-architecture/`](../05-architecture/) |
| Ch. 9 | Data, API, and integration specification | [`01-docs/06-api-and-data-design/data-and-integration-spec.md`](../06-api-and-data-design/data-and-integration-spec.md) |
| Ch. 21 | Security specification | [`01-docs/07-security-and-reliability/security-specification.md`](../07-security-and-reliability/security-specification.md) |
| Ch. 22 | Reliability specification | [`01-docs/07-security-and-reliability/reliability-specification.md`](../07-security-and-reliability/reliability-specification.md) |
| Ch. 27 §27.6 | Frontend component specification | [`01-docs/04-technical-spec/frontend-component-spec.md`](../04-technical-spec/frontend-component-spec.md) |
| Ch. 14 | Agent task list and scope-change control | [`02-tasks/`](../../02-tasks/) |
| Ch. 15 | Issue and pull-request templates | [`05-review/03-version-control/`](../../05-review/03-version-control/) |
| Ch. 19 §19.7 | Debugging specification | [`05-review/04-debugging/debugging-specification.md`](../../05-review/04-debugging/debugging-specification.md) |
| Ch. 23 | Deployment plan, CI/CD, migration, rollback, container, config | [`07-ops/01-deployment/`](../../07-ops/01-deployment/) |
| Ch. 24 | Monitoring plan, maintenance log | [`07-ops/02-monitoring/`](../../07-ops/02-monitoring/), [`07-ops/03-maintenance/`](../../07-ops/03-maintenance/) |
| Ch. 29 | Handoffs, feedback register, team workflow pack | [`06-agent/04-handoffs/`](../../06-agent/04-handoffs/), [`05-review/01-logs/feedback-register.md`](../../05-review/01-logs/feedback-register.md) |
| Ch. 30 | Reusable process, template library, quality metrics, final guidance | [`repeatable-system.md`](repeatable-system.md), [`07-ops/04-release/engineering-quality-review.md`](../../07-ops/04-release/engineering-quality-review.md) |
| Ch. 30 §30.3 | Specification change log | [`01-docs/09-change-control/spec-change-log.md`](../09-change-control/spec-change-log.md) |

---

## Closing rule (Appendix "In Summary")

- Use **templates** *before* code generation so agents have clear boundaries.
- Use **checklists** *during* review so quality is not left to memory.
- Use **traceability** *after* release so software does not drift away from the approved
  specification.
- Use the **prompt library** to keep AI work focused on evidence, requirements, and tests.
- Use the **glossary and resources** as quick references while practicing the workflow.

---

# WORKED EXAMPLE — which appendix ProjectBoard reached for, and when

| Date | Situation | Appendix used | What it produced |
|---|---|---|---|
| 2026-03-01 | Idea was still a sentence in a chat message | **A** Engineering Intent | Problem, users, non-goals, success measures |
| 2026-03-04 | Needed testable behavior | **B** PRD | 11 requirements with acceptance criteria |
| 2026-03-06 | Agent kept guessing the architecture | **C** Technical Spec | 13 sections; guardrail checklist run before any code |
| 2026-03-06 | Two architecture options, no way to choose | **K** ADR | ADR-001 modular monolith, with consequences |
| 2026-03-07 | Endpoints were being invented per feature | **D** API Spec | One contract block per endpoint, error table |
| 2026-03-07 | Fields appearing in code but not the schema | **E** Database Design | Entity model before tables; ownership rules |
| 2026-03-10 | "How will we know it works?" | **G** Test Spec | 61 tests across 6 levels, written before code |
| 2026-03-08 | Agent changed unrelated files | **H** Agent Instruction | AGENT.md; later v1.1–v1.3 after real incidents |
| 2026-03-08 | Prompts were too long and still vague | **I** Context Pack | One-page per-task brief with restrictions |
| 2026-03-09 | Rewriting the same instructions daily | **J** Prompt Library | 13 reusable prompts |
| 2026-03-20 | Agent output looked fine, was not | **P** Code Review | 11 findings across 5 passes; 4 were scope creep |
| 2026-03-22 | Changes hard to trace after an incident | **L** Version Control | Branch per REQ, commits carrying requirement IDs |
| 2026-03-29 | 500 instead of 401 on expired session | **O** Debugging | Evidence-first prompt → root cause in one pass |
| 2026-04-01 | Viewer could edit via the API | **M** Security Review | Release blocked; BUG-003 fixed |
| 2026-04-04 | Was v1.0 actually ready? | **F** Traceability + **N** Readiness | rc1 **held** — a requirement had no implementation |
| 2026-04-30 | Production taught things the specs missed | **Q** Spec Drift | 5 drift items; 4 closed, 1 still open |
| throughout | New contributor onboarding | **R** Glossary, **S** Tools | Shared vocabulary; tool choices justified against constraints |

## The order that actually happened

The book's advice — *A first; B–G before code; H–J to control agents; K–Q to protect
quality* — held, with one deviation worth recording:

> **Appendix M (Security Review) was run too late.** It was treated as a pre-release gate
> and first executed on 2026-04-01, three weeks after auth shipped. It immediately found a
> **critical** authorization hole that had been live the entire time. On the next project
> it moves to *per-feature*, not *per-release*.

## Appendices that earned their place

| Appendix | Concrete thing it caught |
|---|---|
| **F** Traceability | `csv.py` in the codebase with no requirement behind it |
| **N** Readiness | A requirement with a passing test and no implementation |
| **M** Security | A Viewer able to change any task's status via the API |
| **O** Debugging | A missing null check whose real cause was an unwritten requirement |
| **Q** Spec Drift | A requirement that was never a decision — only an accident |
