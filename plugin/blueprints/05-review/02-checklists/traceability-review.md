# Traceability Review

> Source: Ch. 30 §30.2 (`05-review/traceability-review.md`), Ch. 10, Appendix F.
> A periodic audit of [`../docs/traceability.md`](../../01-docs/08-traceability/traceability.md).
> Run it before a release, after a batch of agent work, and before any major change.

**Review date:**
**Reviewer:**
**Scope reviewed:** *(release / feature / sprint)*

---

## 1. Forward trace — every requirement leads somewhere

| Req ID | Has design decision? | Has task? | Has test? | Has code link? | Reviewed? | Gap |
|---|---|---|---|---|---|---|
| REQ-001 | ✔ / ✘ | ✔ / ✘ | ✔ / ✘ | ✔ / ✘ | ✔ / ✘ | |
| REQ-002 | | | | | | |

## 2. Backward trace — every change came from somewhere

| Changed file / module | Task ID | Requirement | Approved? | Action |
|---|---|---|---|---|
| | | | Yes / **No** | Keep / Document + approve / **Remove** |

> **Code with no requirement is suspicious until approved** (Ch. 10 §10.8).

---

## 3. Gap findings

| Gap type | Count | Items | Action assigned to | Due |
|---|---|---|---|---|
| Requirement without design decision | | | | |
| Design without task | | | | |
| Task without test | | | | |
| Test without code link | | | | |
| **Code without requirement** | | | | |
| Released behavior not in spec | | | | |

---

## 4. Checklist (Appendix F)

- [ ] Every **Must** requirement has at least one task.
- [ ] Every **Must** requirement has at least one test.
- [ ] Every security rule maps to validation or authorization code.
- [ ] Every released feature maps back to a PRD requirement.
- [ ] Every changed behavior is reflected in updated specs.
- [ ] Every blank matrix cell has been reviewed and explained.
- [ ] Any code without a requirement has been removed, documented, or approved.

---

## 5. Outcome

- [ ] **Chain complete** — safe to proceed.
- [ ] **Gaps logged** — tasks created, non-blocking.
- [ ] **Blocked** — release cannot proceed until listed gaps close.

**Follow-up tasks created:**

---

> **Traceability rule (Ch. 30 §30.6):** every accepted code change should point back to a
> requirement and a test. Every requirement should point forward to at least one task and
> one reviewable proof.

---

# WORKED EXAMPLE — ProjectBoard, pre-v1.0 audit

**Review date:** 2026-04-04 · **Reviewer:** Tech lead
**Scope reviewed:** release v1.0 (REQ-AUTH-001, REQ-F-001…007, REQ-NF-001, BR-003, BR-004)

## 1. Forward trace

| Req ID | Design? | Task? | Test? | Code link? | Reviewed? | Gap |
|---|---|---|---|---|---|---|
| REQ-AUTH-001 | ✔ | ✔ | ✔ | ✔ | ✔ | — |
| REQ-F-001 | ✔ | ✔ | ✔ | ✔ | ✔ | — |
| REQ-F-005 | ✔ | ✔ | ✔ | ✔ | ✔ | — |
| REQ-F-006 | ✔ | ✔ | ✔ | ✔ | ✔ | — |
| REQ-F-007 (CSV) | ✔ | ✔ | ✔ | ✔ | ✔ | Was code-first; corrected via SC-001 |
| REQ-NF-001 | ✔ | ✔ | ✔ | ✔ | ✘ | Re-review after PTEST-003 passes |
| BR-003 | ✔ | ✔ | ✔ | ✔ | ✔ | — |
| BR-004 | ✔ | ✔ | ✔ | ✔ | ✔ | — |
| **SEC-A-002** | ✔ | ✘ | ✔ | ✘ | ✘ | **No task, no code — expiry is specified but not built** |

## 2. Backward trace

| Changed file / module | Task ID | Requirement | Approved? | Action |
|---|---|---|---|---|
| `services/tasks/create_task.py` | TASK-006 | REQ-F-001 | Yes | Keep |
| `services/tasks/update_status.py` | TASK-008 | REQ-F-005 | Yes | Keep |
| `api/tasks/list_handler.py` | TASK-007 | REQ-F-006 | Yes | Keep |
| `services/exports/csv.py` | — | — | **No** | Documented + approved retroactively (SC-001 → REQ-F-007) |
| `data/users_repo.py` (helper) | — | — | **No** | **Removed** — reverted in review |

## 3. Gap findings

| Gap type | Count | Items | Action assigned to | Due |
|---|---|---|---|---|
| Requirement without design decision | 0 | — | — | — |
| Design without task | 1 | SEC-A-002 | Tech lead | Before v1.0 |
| Task without test | 0 | — | — | — |
| Test without code link | 1 | SEC-A-002 / FTEST-007 | Developer | Before v1.0 |
| **Code without requirement** | 2 | `csv.py`, `users_repo.py` helper | Product owner / reviewer | Closed |
| Released behavior not in spec | 0 | — | — | — |

## 4. Outcome

- [x] **Blocked** — release cannot proceed until SEC-A-002 has a task and an implementation.

**Follow-up tasks created:** TASK-015 (implement session expiry), TASK-011 (index for PTEST-003).

> **What the backward trace caught that nothing else did:** two files with no requirement
> behind them. Both were *useful*. Neither was *approved*. One became a real requirement;
> one was deleted. Without this pass, both would have shipped as accidental product.
