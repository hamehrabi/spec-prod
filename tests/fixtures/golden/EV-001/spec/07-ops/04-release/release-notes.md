# Release Notes

> Source: Front Matter workspace (`changelog/release-notes.md`).
> What shipped, when, and which requirements it satisfied.

---

## [Unreleased]

### Added
- Save a recipe with ingredients; search recipes (REQ-F-002, REQ-F-003)
- Plan a week of meals (REQ-F-004)
- Generate one shopping list from a plan (REQ-F-005) — pending the combine rule (Q-009)
- Account and sign-in (REQ-F-001) — pending the auth model (Q-006)
- Private dish-photo upload

### Changed
### Fixed
### Security
### Removed

---

## [1.0.0] — not yet released

**Release goal:** One home cook can save recipes, plan a week, and generate one shopping list.

**Requirements delivered**

| Req ID | Requirement | Tests | Traceability status |
|---|---|---|---|
| REQ-F-001 | Account and sign-in | STEST-002 | Planned (blocked on Q-006) |
| REQ-F-002 | Save a recipe with ingredients | ITEST-001, E2E-001 | Planned |
| REQ-F-003 | Search recipes | ITEST-002 | Planned |
| REQ-F-004 | Plan a week | ITEST-003 | Planned |
| REQ-F-005 | Generate one shopping list | ATEST-001, E2E-002 | Planned (blocked on Q-009) |

### Added
- The first version of Pantry.

### Changed
- —

### Fixed
- —

### Security
- Single-account scoping; passwords hashed and never logged.

### Known issues
→ [`maintenance-log.md`](../03-maintenance/maintenance-log.md)

**Migrations applied:** MIG-001
**Rollback point:** *(first release — no prior tag)*
**Deployed by:** Developer · **Approved by:** Developer

---

## Entry template

```
## [version] — YYYY-MM-DD

Release goal:

Requirements delivered:
| Req ID | Requirement | Tests | Status |

### Added
### Changed
### Fixed
### Security
### Removed
### Known issues

Migrations applied:
Rollback point:
Deployed by / Approved by:
Post-release verification:
```

---

## Rules

- Every release entry lists the **requirement IDs** it delivered — that is what makes it
  traceable back to `../docs/traceability.md`.
- A behavior that shipped but is not in a spec is **spec drift** → log it in
  [`spec-drift-checklist.md`](../03-maintenance/spec-drift-checklist.md).
- Record the rollback point with every release, before you need it.

---

> Blueprint: blueprints/07-ops/04-release/release-notes.md
