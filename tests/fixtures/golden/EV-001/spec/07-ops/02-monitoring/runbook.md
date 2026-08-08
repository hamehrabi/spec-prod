# Operational Runbook

> Source: Appendix N ("Are known issues, user messages, and operational runbooks
> documented?") + Ch. 22 + Ch. 24.
> What to do when something breaks — written **before** you need it.

> Pantry is a single-user, stateless container app. The one incident to handle above all
> others is **protecting the recipe library** — the irreplaceable asset (see
> [`backup-and-recovery.md`](../01-deployment/backup-and-recovery.md)). Sign-in outage and
> list-generation failure are the user-facing incidents.

---

## Service facts

| Item | Value |
|---|---|
| Service name | Pantry (recipe and shopping-list web app for one home cook) |
| Repository / location | This spec workspace; app is a modular monolith (ADR-001), stateless |
| Environments | `[TODO: environments — (Q-015)]` |
| Health endpoint | `/health` |
| Log location | Structured application logs (baseline monitoring; Q-016) |
| Metrics dashboard | None at baseline — `[TODO: monitoring appetite — (Q-016)]` |
| Error tracker | Error alerts on the log events (grouped by `event`) |
| On-call owner | The owner (single-user project) |
| Rollback approver | The owner |

## Start / stop / restart

```
Start:    [TODO: start command — set with deployment target (Q-017)]
Stop:     [TODO: stop command — set with deployment target (Q-017)]
Restart:  [TODO: restart command — set with deployment target (Q-017)]
Status:   curl -f <app-url>/health
Logs:     read the structured application logs (Q-016 baseline)
```

---

## Incident procedure

1. **Confirm the signal.** What alerted? What is the evidence? (an error event, a failed load, a backup failure)
2. **Check the health endpoint** and the core flow (sign in → plan a week → generate one list, REQ-F-004).
3. **Check recent changes.** Was there a deploy in the window?
4. **Classify severity** (see table below).
5. **Decide: mitigate or roll back** → [`../ops/rollback-plan.md`](../01-deployment/rollback-plan.md)
6. **Communicate** if the cook is affected.
7. **Record** in [`../ops/maintenance-log.md`](../03-maintenance/maintenance-log.md)
   and [`../review/debugging-specification.md`](../../05-review/04-debugging/debugging-specification.md).

| Severity | Condition | Response time | Action |
|---|---|---|---|
| **Critical** | Recipe library at risk (data loss / backup failure), data exposure, total outage. | Immediate | Protect the recipe library; restore from backup; roll back. |
| **High** | Sign-in broken or list generation failing for the cook. | < 30 min | Investigate; roll back if not fixed quickly. |
| **Medium** | A secondary action fails but the core flow works. | Same day | Fix forward with a task and test. |
| **Low** | Cosmetic or rare edge case. | Next cycle | Log as feedback. |

---

## Common failure playbooks

### Recipe library at risk (top incident)
- [ ] Stop making changes — do not let a bad process overwrite good data.
- [ ] Confirm the most recent good nightly backup exists off-box ([`backup-and-recovery.md`](../01-deployment/backup-and-recovery.md)).
- [ ] Restore following the documented restore procedure; verify Recipe/IngredientLine counts and a spot-check recipe.
- [ ] Confirm the recipe library is intact before declaring the incident closed.

### Sign-in outage (user-facing)
- [ ] Check `/health` and whether the app loads at all.
- [ ] Check the auth path against SEC-A-001..004; look for repeated `AUTH_REQUIRED` events.
- [ ] Check for a recent deploy in the window; roll back if it correlates.

### List generation failure (user-facing)
- [ ] Look for `LIST_GENERATION_FAILED` events and read the reason (no plan content — REQ-NF-007).
- [ ] Verify the plan → one-list path (REQ-F-004 core); confirm the cook can retry.
- [ ] Confirm the failure showed a safe message and did not lose the week's plan (FF-002).

### Application will not start
- [ ] Check for missing/invalid environment variables (`environment-config.md`).
- [ ] Check the last deploy log for build errors.

---

## Manual recovery procedures

| Situation | Procedure | Risk | Approver |
|---|---|---|---|
| Recipe library lost or corrupted | Restore the latest nightly off-box backup per [`backup-and-recovery.md`](../01-deployment/backup-and-recovery.md); verify counts and a spot-check recipe | Discards edits written since the last nightly backup (up to ~24 h) | Owner |
| App unresponsive (stateless) | Restart / replace the container; no state is lost on restart | None — the store is external | Owner |

---

## Do **not** do these during an incident

- Do not ask an AI agent to "fix everything" — work from evidence, one cause at a time
  (Ch. 19 §19.4).
- Do not deploy an unreviewed change to production to "try something."
- Do not disable a test or a validation rule to make an error disappear.
- Do not skip recording the incident once service is restored.

---

> Blueprint: blueprints/07-ops/02-monitoring/runbook.md
