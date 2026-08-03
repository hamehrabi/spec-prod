# Maintenance Log

> Source: Ch. 30 §30.2 (`07-ops/maintenance-log.md`) + Ch. 4 §4.3 (`07-ops/maintenance-notes.md`).
> Production learning captured as engineering record — not as informal memory.

---

## Log entries

| Date | Signal source | Observation | Classification | Root cause | Action taken | Spec updated | Test added | Owner |
|---|---|---|---|---|---|---|---|---|
| | monitoring / feedback / error tracker / QA | | Bug / Missing requirement / Performance / Security / **Spec drift** | | | CHG-### | TEST-### | |

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

## Worked example (Ch. 24)

> Users report the dashboard loads slowly for large projects. No error appears, but the
> experience is poor.

| Step | Action |
|---|---|
| 1. Read the signal | Performance logs show the dashboard API takes 7 seconds for large projects. |
| 2. Compare with the spec | The technical spec says dashboard data should load under 3 seconds. |
| 3. Identify the likely cause | The API returns all records at once instead of paginated or summarized data. |
| 4. Update the spec | Add a performance requirement and a response-size rule for large projects. |
| 5. Add tests | Create tests for paginated loading and large-project response time. |
| 6. Ask for a narrow fix | Refactor only the dashboard data endpoint; preserve authorization rules. |
| 7. Review and release | Check tests, logs, and behavior after deployment. |

**Narrow maintenance prompt**
```
Use the current technical specification and performance requirement.
Refactor only the dashboard data endpoint.
Do not change authentication, authorization, or unrelated API responses.
Goal: reduce large-project dashboard load time by returning paginated data.
Also update or add tests for the new pagination behavior.
```

---

## Known issues and limitations

| ID | Issue | Impact | Workaround | Planned fix | Documented for support |
|---|---|---|---|---|---|
| KI-001 | | | | | Yes / No |

---

## Operational notes

| Topic | Note |
|---|---|
| Capacity assumptions | |
| Recurring manual steps | |
| Seasonal/traffic patterns | |
| Dependencies with known instability | |

Runbook → [`../ops/runbook.md`](../02-monitoring/runbook.md)
