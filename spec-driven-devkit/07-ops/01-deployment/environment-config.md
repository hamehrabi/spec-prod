# Environment Configuration

> Source: Ch. 23 §23.3 + Ch. 21 §21.6.
> Configuration = the values that change between environments **without changing the code**.
> Good configuration management prevents the most common AI-generated-code mistake:
> environment-specific values placed directly inside source files.

---

## There is no configuration, and that is a decision

**This project has zero configuration keys and zero environments.** Not "none yet" — none by
design, as a consequence of accepted decisions:

| Why there is nothing to configure | Source |
|---|---|
| No runtime, no process, nothing that could read a variable | ADR-002, CON-001 |
| No network call, so no endpoint or base URL to point at | CON-003 |
| No paid service, so no API key or credential to supply | CON-006 |
| No log, so no `LOG_LEVEL` | CON-007, BR-014 |
| No local / test / production distinction — the kit is Markdown installed on a developer's machine, and there is nothing to deploy | ADR-002, `technical-spec.md` §12 |
| No feature flags — a flag is a branch, and the Simplicity driver's measure counts branches | FF-001, DD-006 |

The one thing that varies between runs — **intake depth** — is a command argument, not
configuration. That was deliberate: a configured depth would be a second place where the same
decision lives, and it would drift from what the developer actually typed.

---

## Configuration table

| Config key | Purpose | Example value | Required in | Security note |
|---|---|---|---|---|
| *(none)* | — | — | — | — |

Every key here must also exist in [`.env.example`](../../.env.example) as a placeholder.
That file is intentionally empty and explains why.

---

## Values by environment

| Key | Local | Test | Production |
|---|---|---|---|
| *(no keys, and no environments)* | — | — | — |

**There is one environment: the developer's machine.** The kit author's CI is not an
environment for the kit — nothing is deployed to it. It is where the fitness functions run
over golden workspaces (`fitness-functions.md`), and its own settings belong to
[`cicd-pipeline.md`](cicd-pipeline.md), not here.

---

## Rules

- **Never hardcode** an environment-specific value in source (Ch. 23 §23.3).
- **Never commit** real secrets — placeholders only in documentation (Ch. 21 §21.6).
- Missing or invalid configuration must **block deployment**, not fail silently at runtime
  (Ch. 28 §28.12).
- A secret that appears in a log is an incident: purge it, rotate the value, and fix the
  log call.
- Every config key is documented here **before** the code reads it.

### The rule that actually binds here

The five rules above are satisfied vacuously — there is no value to hardcode, no secret to
commit, and no deployment to block. The rule that does bind is the inverse:

> **If a configuration key ever appears, an accepted ADR has been superseded.** A key implies
> a runtime (ADR-002), a network call (CON-003), a secret (CON-006), or a branch (FF-001).
> Write the superseding ADR **first**. This file follows from that decision; it never leads it.

---

## Secret inventory

| Secret | Where configured | Rotation owner | Last rotated | Must never appear in |
|---|---|---|---|---|
| *(the kit holds no secret of its own)* | — | — | — | — |

Two secret-adjacent obligations exist anyway, and both concern the workspace the kit
**generates** for a developer:

| Obligation | Rule |
|---|---|
| The developer's own secrets | **Never read.** `.env` and secret files are not inspected, not templated from, not listed (SEC-A-002). |
| The generated workspace | Its `.gitignore` must exclude `.env` and secret files, and must be **written before** its `.env.example` (REQ-NF-002) — the ignore rule has to exist before the file that invites copying it. |

> **Note the direction of that second row.** It is a rule about a file the kit *writes for
> someone else*, not about the kit's own configuration. Confusing the two is the recursion
> trap this workspace warns about in [`project-brief.md`](../../01-docs/01-intent/project-brief.md).

---

## Pre-deploy configuration check

- [x] Every key in `.env.example` has a real value set in the target environment — **vacuous: no keys, no environments.**
- [ ] **No secret is present in the repository history** — the one item on this list that is not vacuous. `[TODO: run a secret scan over the kit's own git history before the first release. The kit has no secrets, but a stray file does not care about that.]`
- [x] `LOG_LEVEL` is not `debug` in production — **n/a: no log, no production.**
- [x] Timeouts and retry limits are set — **n/a: nothing waits.** The one retry bound that exists is specified in `reliability-specification.md` §5, not configured.
- [x] Feature flags are set intentionally for this release — **n/a: no flags, by decision.**

---

## What this file is for, given it is empty

Two things, both worth more than the table would have been:

1. **It records that the question was asked.** A project with no configuration and a project
   where nobody thought about configuration look identical from the outside — right up to the
   moment someone adds a hardcoded value because "we don't do config here".
2. **It names the tripwire.** The rule above turns "add a config key" from a five-minute
   convenience into a decision that visibly requires superseding an ADR. That is the entire
   value of writing an empty file down.

> Blueprint: ../../../spec-driven-template/07-ops/01-deployment/environment-config.md
