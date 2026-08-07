# Maintenance Log

> Source: Ch. 30 §30.2 (`07-ops/maintenance-log.md`) + Ch. 4 §4.3 (`07-ops/maintenance-notes.md`).
> Production learning captured as engineering record — not as informal memory.

---

## Log entries

| Date | Signal source | Observation | Classification | Root cause | Action taken | Spec updated | Test added | Owner |
|---|---|---|---|---|---|---|---|---|

No maintenance entries yet — the build has not started.

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

No known issues yet.

---

## Operational notes

| Topic | Note |
|---|---|
| Capacity assumptions | Single user, small dataset. |
| Recurring manual steps | Dish-photo orphan cleanup runs on a schedule, if photos are stored. |
| Seasonal/traffic patterns | Likely peaks around weekly meal planning. |
| Dependencies with known instability | None — no external services in v1 (Q-007). |

Runbook → [`../ops/runbook.md`](../02-monitoring/runbook.md)

---

> Blueprint: blueprints/07-ops/03-maintenance/maintenance-log.md
