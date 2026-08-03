# Security Specification

> Source: Ch. 21 — Security-First Spec-Driven Engineering.
> **Beginner rule:** do not write "make it secure" as a requirement. Write the exact
> security behavior you expect. A clear rule can be reviewed, tested, and implemented.
> A vague security wish cannot.

**You decide the security policy in the specification. The agent does not.**

> **Read this first.** Security was **considered as a driving characteristic and
> deliberately rejected** — see [`driving-characteristics.md`](../02-requirements/driving-characteristics.md)
> Step 2. That was not a downgrade. The reasoning was that this product's security surface is
> **binary rather than gradual**: there is no login to weaken, no session to hijack, no data
> to leak over a network, and no credential to mishandle. What exists is one boundary — *what
> may this thing write, and where* — which cannot be partially satisfied. It either holds or
> a hard constraint has already been broken. Driver slots are for qualities that degrade
> silently; this one cannot.
>
> The obligations survive in full: **CON-005**, **BR-008**, four requirements, three
> `SEC-A-###` rules, and a **deny test for every "No"** in the matrix below.

---

## 1. Authentication (*who are you?*)

| Area | Requirement |
|---|---|
| Account access | **None exists.** There is no sign-in, no account, no user record, and no identity. The kit runs as the developer, under the developer's own operating-system permissions. |
| Session lifetime | n/a — a "session" is a Claude Code conversation, created and ended by the host. The kit neither creates, extends, nor stores one. |
| Password handling | n/a — no password is collected, stored, hashed, transmitted, or logged, because none is ever requested. |
| Account recovery | n/a |
| Logout | n/a |
| Multi-factor | n/a |

| ID | Authentication requirement | Acceptance criteria |
|---|---|---|
| SEC-A-001 | The kit must never prompt for, collect, store, or transmit a credential of any kind — no password, token, key, licence, or account. | Given a complete intake, when every prompt shown and every file written is inspected, then no credential was requested and none appears in any generated file. |
| SEC-A-002 | The kit must never read the developer's `.env` file or any file matching a secret-file pattern — not to inspect it, not to template from it, not to list it. | Given a repository containing `.env` and `.env.local`, when a complete intake finishes, then neither file was read at any point. |
| SEC-A-003 | The kit must never write, create, or modify any file outside the generated workspace folder without an explicit confirmation that names the file and shows what would change. | Given an intake that would write outside `spec/`, when it reaches that write, then it stops and asks, naming the file — and proceeds only on approval. |

> **The absence of authentication is a security property, not a gap.** No credential exists
> to be stolen, no session to be hijacked, no account to be enumerated. An entire class of
> vulnerability is removed by CON-003 and CON-006 rather than defended against — which is why
> §5 below has no secrets to manage.

---

## 2. Authorization / RBAC (*what are you allowed to do?*)

A user may be authenticated and still not allowed to perform an action.

Here there is no authentication, so the matrix expresses something slightly different and
equally binding: **actor boundaries the kit enforces on itself.** Every **No** below carries
an obligation — BR-010 requires at least one **deny** test for each, and those tests are the
only thing separating this table from a list of intentions.

### Role permission matrix

| Action | Developer | Intake agent | Build agent | Kit author |
|---|---|---|---|---|
| Answer, skip, or decline an interview question | **Yes** | No | No | No |
| Decline a proposed file write | **Yes** | No | No | No |
| Hand-edit any generated file afterwards | **Yes** | No | Only files its task lists | Yes |
| Create or update a file **under `spec/`** | Yes | **Yes** | Only files its task lists | Yes |
| Create or update a file **outside `spec/`** | Yes | **No** — stop and ask, naming the file | **No** — stop and ask | Yes |
| Modify the developer's existing root `CLAUDE.md` | Yes | **No — never, under any circumstance** | No | No |
| Modify the developer's `.gitignore` | Yes | **No** (REQ-F-035) | No | No |
| Read `.env` or any secret file | Yes | **No** (SEC-A-002) | **No** | No |
| Write application source code | Yes | **No** (BR-001) | Yes, within its task | Yes |
| Write to the blueprint library at run time | n/a | **No — read-only** (ADR-001) | No | Yes, at authoring time |
| Ask a ninth interview round | — | **No** (BR-004) | — | — |
| Report success on a check that did not run | — | **No** (BR-009) | — | — |
| Invent a fact instead of writing `[TODO]` | — | **No** (BR-003) | **No** | — |
| Create a state, progress, session, or cache file | — | **No** (ADR-004) | **No** | No |
| Reverse an ADR without superseding it | — | No | **No** | No |
| Weaken or delete a test to make something pass | — | — | **No** | No |

> A role table gives the agent a precise boundary. It does not need to guess whether it may
> touch a file — the table already says no.

**Defensive authorization pattern (Ch. 21 §21.3)** — translated. The blueprint's pattern is a
code snippet; ADR-002 forbids code in this product, so the equivalent is a **stated rule the
instruction set enforces before every write**:

```
Before proposing ANY write:
  1. Normalise the destination path.        <- BEFORE the check, not after
  2. If it does not resolve inside <repo>/spec/  -> STOP and ask, naming the file.
  3. If it is the developer's root CLAUDE.md or .gitignore -> STOP. Never propose it.
  4. Otherwise propose the write and let the host's per-file prompt decide.

Never invert this: do not write and then check. There is no undo.
```

| ID | Authorization requirement | Acceptance criteria |
|---|---|---|
| SEC-Z-001 | Every write destination must be normalised **before** the boundary check, so that a path beginning `spec/` but resolving outside it is rejected. | Given a destination of `spec/../../etc/hosts`, when the boundary check runs, then it is rejected — despite the path beginning with `spec/`. |
| SEC-Z-002 | The kit must never request blanket write permission; the host's per-file prompt must stand on a first run. | Given a first run, when files are written, then the developer was prompted per file and no blanket grant was requested. |
| SEC-Z-003 | Declining a single write must leave the run resumable, not failed. | Given a declined write, when intake continues, then it completes and the workspace resumes correctly. |

---

## 3. Input validation

Validation happens at **system boundaries**. Do not rely only on the frontend — API
requests can come from outside the visible interface.

The boundaries here are: the developer's typed answers, and the filesystem paths derived
from them.

| Input | Validation rule | Error behavior |
|---|---|---|
| Free-text problem statement | Accepted as given. Never rejected, never re-asked in a loop, never rewritten. | If too vague to build requirements from, it becomes an open question with a decision owner. **Not** an error. |
| Multiple-choice selection | Must be one of the offered options, or the developer's own free text (REQ-F-007). | Free text is honoured as-is; no option is substituted for it. |
| Driving-characteristic selection | At most three (BR-011). | Push back **once** with the reason, then accept at most three and record the rejected ones. Not an error state. |
| **Any developer-supplied path segment** | Must be a single path-safe segment. Must not contain `..`, must not be absolute, must not contain a path separator. **Checked after normalisation.** | Rejected and re-asked, naming the problem. This is the one input that can breach the boundary. |
| Existing workspace being resumed | Must be readable. Stage derived by inspection. | If it cannot be reconciled with what a workspace should look like, report what was found and ask. **Never overwrite the developer's hand-edits.** |
| Existing `spec/` that is not a kit workspace | Detected before any write. | Stop, explain, offer an alternative folder name (REQ-F-036). Never write into a folder the kit did not create. |

---

## 4. Data protection

| Area | Question | Rule |
|---|---|---|
| Data minimization | Do you need this data? | The kit collects only interview answers. It does **not** read the developer's source code, dependency manifests, git history, or environment. |
| Storage | How should data be stored? | Plain Markdown, in the developer's own repository, under their own version control. Nowhere else. Intended to be committed (REQ-F-035) — the developer's repository access controls are the storage controls. |
| Transport | How does data move? | **It does not.** Zero network calls (CON-003, REQ-NF-007). Verified by AC-027: a full intake completes with the network blocked at the operating system. |
| Logging | What must **not** be logged? | **There is no log.** No file, no telemetry, no error reporting, no analytics (CON-007, BR-014). Nothing can leak from a log that does not exist. |
| Retention | How long is data kept? | Indefinitely, by the developer, in their repository. The kit never deletes, prunes, expires, or garbage-collects anything. |

---

## 5. Secrets management

Secrets are values that allow access to protected systems: API keys, database passwords,
signing keys, private tokens.

**The kit has none.** No key, no token, no signing material, no account, nothing to
configure or rotate. That follows from CON-003 and CON-006, and it removes the entire
category rather than managing it.

| Secret | Where configured | Must never appear in | Reference |
|---|---|---|---|
| *(none — the kit holds no secret of its own)* | — | — | — |
| The **developer's** secrets | Their own `.env`, outside the kit's reach | Any generated file · any report · any prompt | Never read (SEC-A-002) |

Two obligations remain, and both concern the workspace the kit **generates**:

- The generated `.gitignore` must exclude `.env` and secret files, and must be **written
  before** `.env.example` (REQ-NF-002). Order matters: the ignore rule must exist before the
  file that invites a developer to copy it into a real one.
- **No generated file may contain a credential**, including in an example. Validation check
  12 enforces this.

→ [`.env.example`](../../.env.example) · [`environment-config.md`](../../07-ops/01-deployment/environment-config.md)

---

## 6. Secure error handling

Error handling has two responsibilities: help the user recover, and protect the system
from exposing internal details.

The second responsibility is nearly absent here — there is no server, no stack trace to
leak, and no other user whose existence could be revealed. What remains is the first, plus
one genuine disclosure risk: **content read from outside `spec/` must never be echoed.**

| Problem | Unsafe response | Safer response |
|---|---|---|
| A path outside `spec/` must be written | Write it, because it looked harmless. | "`<path>` is outside `spec/`. Here is what would change. May I write it?" |
| A blocked path contains something sensitive | Echo the file's contents to justify the block. | Name the **path** only. Never quote content from outside the workspace. |
| A blueprint is missing | Improvise a structure and continue. | "Blueprint `<path>` is missing from the installed plugin. Rounds 1–N are intact. Stopping here." |
| Validation finds a dangling identifier | Report "complete" with a warning. | Report the check as **failed**, naming file and identifier. No success claim (BR-009). |
| A generated file failed twice | Retry a third time, or accept it quietly. | Mark `[TODO]`, add the matching `Q-###`, name it in the closing report (REQ-F-037). |
| The workspace is inconsistent | Silently re-derive and overwrite the developer's edits. | Report what was found and what cannot be reconciled. Ask. |
| An answer is ambiguous | Pick the likelier reading. | Record an open question with a decision owner, and **state the assumption** made meanwhile. |

---

## 7. Feature security specification

Copy per sensitive feature.

```
Feature:        Writing into the developer's repository
Requirement ID: SEC-A-003, SEC-Z-001

Authentication:  None — the kit runs as the developer, with their own permissions.
Authorization:   Writes permitted under <repo>/spec/ only. Everything else stops and asks.
Role assignment: n/a — no roles are granted; the actor boundaries in §2 are fixed.
Validation:      The destination path must resolve inside spec/ AFTER normalisation.
                 Reject any path containing .. or an absolute prefix. Never modify the
                 developer's root CLAUDE.md or .gitignore under any circumstance.
Data protection: .env and secret files are never read. No generated file holds a credential.
                 Content from outside spec/ is never echoed, not even to justify a refusal.
Secure errors:   A blocked write names the PATH and what would change. Never the content.
Testing:         allowed write (inside spec/) · denied write (outside) · traversal
                 (spec/../../etc) · existing root CLAUDE.md · existing .gitignore ·
                 declined write · existing non-kit spec/ folder

Acceptance criteria:
1. A write inside spec/ proceeds after the host's per-file prompt.
2. A write outside spec/ stops and asks, naming the file.
3. A path that normalises to outside spec/ is rejected even though it begins with "spec/".
4. An existing root CLAUDE.md is byte-for-byte unchanged after a complete intake.
5. An existing .gitignore is byte-for-byte unchanged after a complete intake.
6. Declining any single write leaves the run resumable, not failed.
7. No .env or secret file is read at any point.
8. An existing non-kit spec/ folder is left untouched and an alternative name is offered.
```

```
Feature:        The blueprint library at run time
Requirement ID: SEC-Z-004

Authentication:  None.
Authorization:   READ ONLY. The kit never writes to its own plugin files during an intake.
Validation:      A required blueprint must exist. Absence is a named gap, not an
                 improvisation — an invented specification file is indistinguishable
                 from a real one once written.
Data protection: n/a — blueprints contain no developer data.
Secure errors:   Name the missing blueprint path and stop. Prior rounds stay intact.
Testing:         read succeeds · write to a blueprint is refused · missing blueprint halts

Acceptance criteria:
1. No file inside the installed plugin is modified during any intake.
2. A missing blueprint halts that file with a named gap, and prior rounds survive.
3. No specification file is ever produced without a blueprint behind it.
```

---

## Security review checklist (Ch. 21 §21.8)

- [x] Every protected feature has an authentication requirement — or a recorded reason it needs none (§1).
- [x] Every sensitive action has an authorization rule — §2 matrix.
- [x] Role permissions are documented in a table — §2, with a deny obligation per **No**.
- [x] User input rules are specific and testable — §3, including path traversal after normalisation.
- [x] Enforcement does not rely only on the component's own good behaviour — the host's per-file prompt is the independent control, which is why SEC-Z-002 forbids blanket permission.
- [x] Sensitive data is not logged or returned unnecessarily — there is no log, and blocked paths never echo content.
- [x] Secrets are not stored in source or examples — the kit has none; §5 covers the generated ones.
- [x] Error messages are safe and give a next action — §6.
- [x] Security requirements are linked to tests — SEC-A-001…003, SEC-Z-001…004 → `security-tests.md`.
- [x] The AI agent has clear instructions not to add unapproved access paths — §2 and `AGENT.md`.

Full review pass → [`security-review.md`](../../05-review/02-checklists/security-review.md)

---

## The one thing that would make this file wrong

Every claim above rests on a single fact: **the kit describes, and never executes.** No
script runs, no dependency is resolved, no network call is made, so the only harm it can do
is write a file in the wrong place — which is why one boundary and its deny tests are
sufficient.

**If ADR-002 is ever superseded and the kit gains a runtime, this file is obsolete on that
day.** A runtime brings dependency supply chain, code execution, and a genuine need for
security as a driving characteristic rather than a constraint. That is not a footnote; it is
the reopening trigger recorded in `driving-characteristics.md` Step 4.

> Blueprint: ../../../spec-driven-template/01-docs/07-security-and-reliability/security-specification.md
