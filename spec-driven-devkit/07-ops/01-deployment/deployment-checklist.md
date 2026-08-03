# Deployment Checklist

> Source: Ch. 23, Ch. 28 §28.12.
> Run this before every publish. **Publishing is the only irreversible act in this project** —
> a version installed on someone's machine cannot be recalled.

**Release version:** `________` · **Date:** `________` · **Released by:** `________`

---

## Before

- [ ] Merge gate green on `main` — all 14 fitness functions, all six test levels
- [ ] Every fitness function has been **seen to fail** at some point (not just seen to pass)
- [ ] Human eval sample: ≥ 4 golden workspaces read; both human scorers show no escalations
- [ ] No open `[TODO]` in the plugin's own payload — `[TODO]`s belong in specs, never in shipped instructions
- [ ] `release-notes.md` updated; `[Unreleased]` moved under the new version
- [ ] **If any blueprint was renamed, moved, or removed: the migration note exists**, naming old and new paths
- [ ] Version number checked against the semver table in [`deployment-plan.md`](deployment-plan.md)
- [ ] Manifest version bumped to match the tag
- [ ] Change log updated, including any **rejected** change from this cycle
- [ ] Open questions blocking release are closed — **Q-007 (licence and attribution) in particular**

## During

- [ ] Commit tagged
- [ ] Published to the marketplace
- [ ] The published version number matches the manifest and the tag

## After — smoke test against the **published** artifact

Not against the branch. This is the step that distinguishes "our code is fine" from "what
users receive is fine".

- [ ] Install from the marketplace into an **empty** repository, as a user would
- [ ] Run the intake command with no arguments
- [ ] Preamble prints; round count stated
- [ ] Answer Round 1; three files appear; summary line prints
- [ ] Close the session mid-Round 2; re-open; **confirm it resumes**
- [ ] Complete the intake; validation reports **12 of 12 ran**
- [ ] Open a fresh session; paste the hand-off instruction; **confirm the agent restates and waits**
- [ ] Confirm the repository outside `spec/` is untouched — **by checksum, not by eye**
- [ ] Repeat the install on a second platform `[TODO: which two of the three are practical to test manually each release?]`

## Rollback readiness

- [ ] The previous version is still installable from the marketplace
- [ ] [`rollback-plan.md`](rollback-plan.md) reviewed; the trigger thresholds still make sense

---

## What this checklist deliberately omits

| Usual item | Why it is absent |
|---|---|
| Database migrations verified | No database. |
| Environment variables set in production | No configuration, no production (`environment-config.md`). |
| Secrets rotated / present | The kit holds none. |
| Health check green | Nothing runs. |
| Traffic shifted / canary | Nothing serves traffic. |
| Monitoring dashboards checked | None exist, and none can (CON-007). |

Six absences, each with a reason. A checklist that quietly dropped them would look like an
oversight; a checklist that lists them shows the questions were asked.

---

## The two items most likely to be skipped

1. **The migration note.** Nothing fails without it. The damage lands weeks later in someone
   else's repository, as a broken link that looks like a generation bug.
2. **Smoke-testing the published artifact rather than the branch.** They are almost always
   identical — until the one release where the packaging is wrong, which is exactly the
   release this step exists for.

> Blueprint: ../../../spec-driven-template/07-ops/01-deployment/deployment-checklist.md
