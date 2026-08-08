# Traceability Review

> Source: Ch. 30 §30.2 (`05-review/traceability-review.md`), Ch. 10, Appendix F.
> A periodic audit of [`../docs/traceability.md`](../../01-docs/08-traceability/traceability.md).
> Run it before a release, after a batch of agent work, and before any major change.

**Review date:**
**Reviewer:**
**Scope reviewed:** *(release / feature / sprint)*

---

## 1. Forward trace — every requirement leads somewhere

Mark ✔ / ✘ per cell during the audit against the RTM. Rows below list the Pantry **Must**
requirements to trace.

| Req ID | Has design decision? | Has task? | Has test? | Has code link? | Reviewed? | Gap |
|---|---|---|---|---|---|---|
| REQ-F-001 (save recipe) | ☐ | ☐ | ☐ | ☐ | ☐ | — |
| REQ-F-002 (search) | ☐ | ☐ | ☐ | ☐ | ☐ | — |
| REQ-F-003 (plan a week) | ☐ | ☐ | ☐ | ☐ | ☐ | — |
| REQ-F-004 (generate one list — core) | ☐ | ☐ | ☐ | ☐ | ☐ | — |
| REQ-F-005 (sign in / private account) | ☐ | ☐ | ☐ | ☐ | ☐ | — |
| REQ-F-006 (tick off items) | ☐ | ☐ | ☐ | ☐ | ☐ | — |
| REQ-R-001 (single owner role) | ☐ | ☐ | ☐ | ☐ | ☐ | — |

## 2. Backward trace — every change came from somewhere

| Changed file / module | Task ID | Requirement | Approved? | Action |
|---|---|---|---|---|

No entries yet — the first changed file traced back adds the first row.

> **Code with no requirement is suspicious until approved** (Ch. 10 §10.8).

---

## 3. Gap findings

Fill counts, items, owner, and due during the audit.

| Gap type | Count | Items | Action assigned to | Due |
|---|---|---|---|---|
| Requirement without design decision | not yet run | — | — | — |
| Design without task | not yet run | — | — | — |
| Task without test | not yet run | — | — | — |
| Test without code link | not yet run | — | — | — |
| **Code without requirement** | not yet run | — | — | — |
| Released behavior not in spec | not yet run | — | — | — |

---

## 4. Checklist (Appendix F)

- [ ] Every **Must** requirement has at least one task.
- [ ] Every **Must** requirement has at least one test.
- [ ] Every security rule maps to validation or authorization code (SEC-A-001…004, SEC-Z-001…002).
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

> Blueprint: blueprints/05-review/02-checklists/traceability-review.md
