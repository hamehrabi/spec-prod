# Deployment Plan

> Source: Ch. 23.
> **This project does not deploy. It publishes.** The distinction is not pedantry — a deploy
> replaces a running thing; a publish adds a version that people choose to install.

**Distribution:** a Claude Code plugin marketplace (Round 8).
**Versioning:** tagged semantic versions with a changelog per release (Round 8).

---

## Environments

| Environment | Exists? | What it is |
|---|---|---|
| Local | **Yes** | The kit author's machine. The only place development happens. |
| Test | **Yes, in a narrow sense** | CI, running the gate over golden workspaces. Nothing is deployed to it. |
| Production | **No, in the usual sense** | The nearest equivalent is **every developer's own machine**, each running whichever version they installed. |

**The consequence worth naming:** there is no single production to fix. A bad release is not
rolled back centrally — it is superseded, and every user upgrades on their own schedule.
Some never will. See [`rollback-plan.md`](rollback-plan.md).

---

## The release procedure

```
 1. The merge gate is green on main.                         (cicd-pipeline.md)
 2. Human eval sample: >= 4 golden workspaces read by a person.
    Both human scorers must show no escalations.             (ai-evals.md - RELEASE gate)
 3. Decide the version number.                               (see the table below)
 4. Update CHANGELOG / release-notes.md - move [Unreleased] to the new version.
 5. If any blueprint was renamed, moved, or removed:
       WRITE THE MIGRATION NOTE naming old and new paths.    (ADR-005 - mandatory)
 6. Bump the version in the plugin manifest.
 7. Tag the commit.
 8. Publish to the marketplace.
 9. Run the scheduled install test immediately, against the PUBLISHED artifact.
10. Record the release in the change log.
```

**Step 5 is the one that gets skipped.** A blueprint rename breaks the back-link at the foot
of every file in every workspace ever generated. The version stamp (ADR-005) makes that
diagnosable *only if* a migration note exists to diagnose it against.

**Step 9 is not optional either.** A gate that passed on a branch says nothing about what
users actually receive.

---

## Versioning

Semantic versioning, with meanings specific to this product:

| Change | Bump | Example |
|---|---|---|
| Reword a question, reword an option, clarify guidance | **patch** | Round 4's third question reads more clearly |
| Add a blueprint · add a question · add an optional argument | **minor** | A new optional specification file |
| Change a blueprint's internal sections | **minor** | Existing workspaces keep their structure; they are not regenerated |
| **Rename, move, or remove a blueprint** | **major** | Every back-link in every existing workspace now points at nothing |
| **Rename the command** | **major** | Every hand-off block and every piece of documentation is wrong |
| **Change the workspace location from `spec/`** | **major** | Requires superseding ADR-004 first |
| **Weaken a C3 workspace guarantee** | **major** | Build agents rely on them without checking |

> **Why semver and not dates.** There is no API to break, which is the usual argument for
> date-based versions. But there *is* a contract — the blueprint paths living in other
> people's repositories — and semver is what signals that a rename has occurred. A date says
> *when*; a major version says *this will break your links*.

---

## Configuration

**None.** No environment variables, no settings, no feature flags — see
[`environment-config.md`](environment-config.md). Nothing differs between the kit author's
machine and a developer's, which removes the entire class of "worked in staging" failures.

## Migrations

No database. The one migration concern is blueprint paths — see
[`database-migration-plan.md`](database-migration-plan.md).

## Monitoring after release

**None is possible** (CON-007). The substitutes:

| Signal | Source |
|---|---|
| Did the published artifact install? | The scheduled CI install test |
| Did quality change? | The eval golden set, run before release |
| Did anything break for users? | **They tell you.** Under 50 users, that is the honest answer |

---

## Release checklist

- [ ] Merge gate green on main
- [ ] Human eval sample read; no escalations
- [ ] Version number decided against the table above
- [ ] `release-notes.md` updated; `[Unreleased]` moved
- [ ] **Migration note written if any blueprint path changed**
- [ ] Manifest version bumped
- [ ] Commit tagged
- [ ] Published
- [ ] **Scheduled install test run against the published artifact**
- [ ] Change log updated

> Blueprint: ../../../spec-driven-template/07-ops/01-deployment/deployment-plan.md
