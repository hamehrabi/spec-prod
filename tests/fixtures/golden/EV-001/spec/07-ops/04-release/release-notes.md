# Release Notes

> Source: Front Matter workspace (`changelog/release-notes.md`).
> What shipped, when, and which requirements it satisfied.

---

## [Unreleased]

### Added
### Changed
### Fixed
### Security
### Removed

---

## [1.0.0] — not yet released

**Release goal:** A home cook can save recipes with their ingredient lines, plan a week of
meals, generate one shopping list from that week, and search their saved recipes.

**Requirements delivered**

| Req ID | Requirement | Test IDs | Traceability status |
|---|---|---|---|
| REQ-F-001 | Save a recipe with its ingredient lines | ATEST-001 | Planned |
| REQ-F-002 | Plan which meals to cook in a week | ATEST-002 | Planned |
| REQ-F-003 | Generate one shopping list from a weekly plan | ATEST-003, ATEST-005 | Planned |
| REQ-F-004 | Search saved recipes | ATEST-004 | Planned |

### Added
- Fills at release.

### Changed
- Fills at release.

### Fixed
- Fills at release.

### Security
- Fills at release.

### Known issues
→ [`maintenance-log.md`](../03-maintenance/maintenance-log.md)

**Migrations applied:** MIG-001–004 planned (database-migration-plan.md)
**Rollback point:** the tag the first release creates (rollback-plan.md)
**Deployed by:** the developer · **Approved by:** the developer

---

## Entry template

```
## [version] — YYYY-MM-DD

Release goal:

Requirements delivered:
| Req ID | Requirement | Test IDs | Status |

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

> Blueprint: blueprints/07-ops/04-release/release-notes.md
