# Maintenance Log

> Source: Ch. 30 §30.2 (`07-ops/maintenance-log.md`) + Ch. 4 §4.3 (`07-ops/maintenance-notes.md`).
> Production learning captured as engineering record — not as informal memory.

---

## Log entries

| Date | Signal source | Observation | Classification | Root cause | Action taken | Spec updated | Test added | Owner |
|---|---|---|---|---|---|---|---|---|

No entries yet — the first maintenance action adds the first row.

---

## Entry template

```
Date:
Signal source:      [monitoring / user feedback / error tracker / support / QA]
Observation:        [what was seen, with evidence]
Evidence:           [log line, metric, screenshot description, ticket]

Classification:     Bug / Missing requirement / Performance issue / Security issue / Spec drift

Compared with spec: [what the spec says vs. what production does]
Root cause:

Action taken:       [narrow fix / new requirement / spec update / accepted limitation]
Task created:       TASK-###
Spec updated:       CHG-###
Test added:         TEST-###

Follow-up needed:
Owner:
```

---

## Known issues and limitations

| ID | Issue | Impact | Workaround | Planned fix | Documented for support |
|---|---|---|---|---|---|

No entries yet — no known issues recorded before first production use.

---

## Operational notes

| Topic | Note |
|---|---|
| Capacity assumptions | Single B2C user, one account, no sharing — sized for one home cook. |
| Recurring manual steps | Nightly backup verification and periodic restore test (see [`maintenance-notes.md`](maintenance-notes.md)). |
| Seasonal/traffic patterns | Evening use (meal planning); no 24/7 demand. |
| Dependencies with known instability | None — no external services in v1 (Q-007). |

Runbook → [`../ops/runbook.md`](../02-monitoring/runbook.md)

---

> Blueprint: blueprints/07-ops/03-maintenance/maintenance-log.md
