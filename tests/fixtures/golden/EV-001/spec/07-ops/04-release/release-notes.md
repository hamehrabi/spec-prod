# Release Notes

> Source: Front Matter workspace (`changelog/release-notes.md`).
> What shipped, when, and which requirements it satisfied.

---

## [Unreleased]

### Added
- The six v1 capabilities (REQ-F-001..006) are specced and building toward the first release.

### Changed
### Fixed
### Security
### Removed

---

## [1.0.0] — [TODO: release date — (Q-002)]

**Release goal:** A single home cook can keep their recipes and turn a week of chosen meals
into **one** shopping list (REQ-F-004 is the core capability).

**Requirements delivered**

| Req ID | Requirement | Test IDs | Traceability status |
|---|---|---|---|
| REQ-F-001 | Save a recipe with its ingredient lines | ATEST-001, UTEST-001, ITEST-001 | Proposed |
| REQ-F-002 | Search saved recipes | ATEST-005, UTEST-002, ITEST-002 | Proposed |
| REQ-F-003 | Plan which meals to cook in a week | ATEST-006, ITEST-003 | Proposed |
| REQ-F-004 | Generate ONE shopping list from a week's plan (core) | ATEST-002, UTEST-003, ITEST-004, ETEST-001 | Proposed |
| REQ-F-005 | Sign in to a private account | ATEST-007, STEST-002, ETEST-002 | Proposed |
| REQ-F-006 | Tick off shopping-list items | ATEST-008, ITEST-005 | Proposed |

### Added
- Save recipes with ingredient lines, with a private photo per recipe (REQ-F-001; Q-008).
- Search saved recipes (REQ-F-002).
- Weekly meal planning and one-list generation (REQ-F-003, REQ-F-004).
- Sign-in to the single private account (REQ-F-005).
- Tick shopping-list items off while shopping (REQ-F-006).

### Changed
- Nothing yet — first release.

### Fixed
- Nothing yet — first release.

### Security
- Authentication required for protected actions (SEC-A-001..004; `AUTH_REQUIRED` on breach).
- Never log passwords, tokens, reset links, secrets, recipe/plan content, or photos (REQ-NF-007; full leak list `[TODO: leak list — (Q-012)]`).

### Known issues
→ [`maintenance-log.md`](../03-maintenance/maintenance-log.md)

**Migrations applied:** none yet — first release brings up the initial schema (ADR-002).
**Rollback point:** None yet — this is the first release; the rollback tag is recorded when the release is cut.
**Deployed by:** Owner · **Approved by:** Owner
**Post-release verification:** confirm sign-in, a recipe save, and one list generated from a week of meals; confirm the four log events emit and error alerts fire.

---

## Rules

- Every release entry lists the **requirement IDs** it delivered — that is what makes it
  traceable back to `../../01-docs/08-traceability`.
- A behavior that shipped but is not in a spec is **spec drift** → log it in
  [`spec-drift-checklist.md`](../03-maintenance/spec-drift-checklist.md).
- Record the rollback point with every release, before you need it.

---

> Blueprint: blueprints/07-ops/04-release/release-notes.md
