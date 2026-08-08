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

## [1.0.0] — YYYY-MM-DD

**Release goal:**

**Requirements delivered**

| Req ID | Requirement | Test IDs | Traceability status |
|---|---|---|---|
| REQ-### | | TEST-### | Approved |

### Added
-

### Changed
-

### Fixed
-

### Security
-

### Known issues
→ [`maintenance-log.md`](../03-maintenance/maintenance-log.md)

**Migrations applied:** MIG-###
**Rollback point:** *(tag / commit)*
**Deployed by:** · **Approved by:**

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

---

# WORKED EXAMPLE — ProjectBoard

## [1.0.0] — 2026-04-05

**Release goal:** Authenticated users can create projects and tasks, assign owners, track
status, and export a project to CSV.

**Requirements delivered**

| Req ID | Requirement | Test IDs | Traceability status |
|---|---|---|---|
| REQ-AUTH-001 | Sign in with email and password | TEST-AUTH-001…003 | Approved |
| REQ-AUTH-006 | Lock the account after 5 failed attempts | TEST-AUTH-010…011 | Approved |
| SEC-A-002 | Session expires after 30 minutes idle | FTEST-007 | Approved |
| REQ-F-001 | Create a task | TEST-006, FTEST-001, ATEST-002 | Approved |
| REQ-F-003 | Create a project | ETEST-002 | Approved |
| REQ-F-005 | Update task status | TEST-007, STEST-002 | Approved |
| REQ-F-006 | List tasks by project | TEST-008, STEST-007 | Approved |
| REQ-F-007 | Export a project to CSV | FTEST-010, PTEST-004 | Approved |
| REQ-NF-001 | Task list under 2 s for 500 tasks | PTEST-003 | Approved |
| BR-003 | No past due dates at creation | FTEST-002 | Approved |
| BR-004 | Cannot delete a project with open tasks | FTEST-011 | Approved |

### Added
- Email/password login with failed-attempt lockout
- Projects, tasks, assignment, and status tracking
- CSV export as a background job
- Task list pagination (50 per page)

### Changed
- Task list is now paginated; the endpoint no longer returns all tasks
- Invite email moved out of the request path into a background job

### Fixed
- BUG-001: 404 response no longer confirms another user's task exists
- BUG-002: expired session returns 401 and redirects instead of 500
- BUG-003: a Viewer could change task status through the API

### Security
- Session expiry enforced server-side (SEC-A-002)
- Role checks moved into the service layer, not only the UI
- `.env` removed from version control; signing key rotated

### Known issues
KI-001 (export excludes description), KI-002 (no due-date sort), KI-003 (312 unassigned
legacy tasks) → [`../03-maintenance/maintenance-notes.md`](../03-maintenance/maintenance-notes.md)

**Migrations applied:** MIG-003, MIG-004
**Rollback point:** tag `v0.9.3` (`a4f19c2`)
**Deployed by:** Tech lead · **Approved by:** Tech lead, Reviewer (security)
**Post-release verification:** smoke 7/7; no critical errors in the 30-minute window

---

## [0.9.3] — 2026-03-29

### Added
- Task creation and listing (REQ-F-001, REQ-F-006)

### Fixed
- BUG-004: application now fails fast on a missing required environment variable

**Rollback point:** tag `v0.9.0`

> **Why every entry lists requirement IDs.** Six months from now, "what shipped in 1.0?"
> has a traceable answer, and any behavior *not* on this list is a drift candidate.
