# Maintenance Log

> Source: Ch. 30 §30.2 (`07-ops/maintenance-log.md`) + Ch. 4 §4.3 (`07-ops/maintenance-notes.md`).
> Production learning captured as engineering record — not as informal memory.

---

## Log entries

| Date | Signal source | Observation | Classification | Root cause | Action taken | Spec updated | Test added | Owner |
|---|---|---|---|---|---|---|---|---|

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

---

## Operational notes

| Topic | Note |
|---|---|
| Capacity assumptions | Expected volume is unknown (Q-001); REQ-NF-001 states the only sized targets — 21 meals per plan, 500 recipes searched. |
| Recurring manual steps | None yet — backups must become automatic before the first release (backup-and-recovery.md). |
| Seasonal/traffic patterns | Unknown until there is traffic; weekly planning likely clusters around one day. |
| Dependencies with known instability | None — version one has no external dependencies (Round 6). |

Runbook → [`../ops/runbook.md`](../02-monitoring/runbook.md)

> Blueprint: blueprints/07-ops/03-maintenance/maintenance-log.md
