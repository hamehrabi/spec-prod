# Security Review

> Source: Ch. 21, Appendix M.
> Pre-filled with **this project's** actors and rules — not a generic checklist.

**Reviewer:** `________` · **Date:** `________` · **Version:** `________`

---

## The whole security surface, in one sentence

**The kit describes, and never executes.** No process, no network, no credential, no
dependency. The only harm it can do is **write a file in the wrong place** — which is why one
boundary and its twelve denials are sufficient, and why every item below is about that
boundary or about what could quietly widen it.

---

## Authentication

There is none, and its absence is a security property rather than a gap.

- [ ] No credential is prompted for, collected, stored, or transmitted anywhere (SEC-A-001)
- [ ] `.env` and secret files are **never read** — not to inspect, not to template, not to list (SEC-A-002)
- [ ] No account, licence check, or identity was introduced

## Authorization — one deny test per **No**

Every row is a **No** in [`security-specification.md`](../../01-docs/07-security-and-reliability/security-specification.md) §2.

- [ ] Write outside `spec/` without asking → **denied** (STEST-002)
- [ ] Path that normalises outside `spec/` → **denied**, despite the prefix (STEST-003)
- [ ] Modify the developer's root `CLAUDE.md` → **denied**, and **never proposed** (STEST-007)
- [ ] Modify the developer's `.gitignore` → **denied** (STEST-008)
- [ ] Read `.env` or a secret file → **denied** (STEST-010)
- [ ] Write application source code during intake → **denied** (STEST-001)
- [ ] Write into the blueprint library at run time → **denied** (STEST-012)
- [ ] Ask a ninth interview round → **denied** (ETEST-006)
- [ ] Report success on an unrun check → **denied** (STEST-014, FTEST-005)
- [ ] Invent a fact instead of `[TODO]` → **denied** (ATEST-020)
- [ ] Create a state/progress/cache file → **denied** (STEST-012)
- [ ] Request blanket write permission → **denied** (STEST-006)
- [ ] Write into a `spec/` the kit did not create → **denied** (STEST-005)

- [ ] **Each of the above has been seen to FAIL against a version without the boundary layer.** A denial test that has never failed proves nothing.

## Input validation

- [ ] Path checks normalise **before** comparing — not a string prefix match
- [ ] `spec/../../etc/hosts` rejected; `specimen/x.md` rejected; `spec/../spec/x.md` allowed
- [ ] Absolute paths rejected
- [ ] Free-text answers accepted as given, never re-asked in a loop, never rewritten
- [ ] A credential pasted into a free-text answer does not propagate into any generated file

## Data protection

- [ ] **Zero outbound network requests** during a full intake, verified with the network blocked (ETEST-011)
- [ ] No telemetry, analytics, or error reporting — including opt-in (BR-014)
- [ ] The kit does not read the developer's source, dependencies, or git history
- [ ] A blocked-write message names the **path only** — never the target file's contents (STEST-013)

## Secrets

- [ ] The kit still holds **no secret of its own** — nothing to rotate, store, or leak
- [ ] No generated file contains a credential (REQ-NF-002)
- [ ] The generated `.gitignore` excludes `.env` and is written **before** `.env.example`
- [ ] No secret in the kit's own repository history — `[TODO: run a scan before first release]`

## Enforcement independence

- [ ] The host's per-file permission prompt is still in effect on a first run
- [ ] **No blanket write grant is requested anywhere, for any reason**

> **This is the most important block on the page.** Everything above is a rule the kit
> follows, not a sandbox imposed on it — the kit runs with the developer's own filesystem
> permissions and could write anywhere. The host's prompt is the only control that does not
> depend on the kit's own good behaviour. Remove it and every row becomes an intention.

---

## The two questions that would change this review entirely

| Question | If the answer changes |
|---|---|
| **Did anything gain the ability to execute?** | ADR-002 has been superseded. This whole review is obsolete: dependency supply chain, code execution, and security as a **driving characteristic** rather than a constraint all arrive at once |
| **Did anything gain a network call?** | CON-003 has been superseded. Data exfiltration becomes possible for the first time, and the privacy promise — which is part of the product — is gone |

Both are reopening triggers recorded in
[`driving-characteristics.md`](../../01-docs/02-requirements/driving-characteristics.md) Step 4.

---

## Review outcome

| Date | Reviewer | Items failing | Actions |
|---|---|---|---|
| *(not yet run)* | | | |

> Blueprint: ../../../spec-driven-template/05-review/02-checklists/security-review.md
