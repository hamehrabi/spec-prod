# Agent Rules and Coding Standards

> Source: Ch. 11, Ch. 12, Appendix H.
> `AGENT.md` is the contract. This is the style guide behind it.
> **What gets written here is Markdown that a model executes** (ADR-002) — so "coding
> standards" means *how to write instructions a model follows correctly*.

**Rule version:** v1.0

---

## Naming

| Thing | Convention | Example |
|---|---|---|
| Instruction module | one concern, one file, named for **what it knows** | `boundary.md`, `fill.md`, `resume.md` |
| Blueprint | mirrors the template library path exactly — **paths are a contract** | `blueprints/01-docs/02-requirements/requirements.md` |
| Identifier prefix | fixed set; never invented | `REQ-F`, `BR`, `FF`, `EV`, `RISK` |
| Test file | `test_<TESTID>_<slug>` | `test_UTEST-019_path_check_after_normalisation` |
| Branch | `<type>/<ID>-<slug>` | `feat/TASK-004-boundary-layer` |

**Never** name a module `helpers`, `utils`, `common`, or `misc`. If a crisp name is hard to
find, the module is doing two things — Ousterhout's red flag 12, and the strongest signal
ADR-001's boundaries are being violated.

## Module responsibilities

| Module | Knows | Must never contain |
|---|---|---|
| `intake.md` | Orchestration: round order, the eight-round limit, write-after-each-round, resume entry | Question text · blueprint structure |
| `questions.md` | The questions, their options, their reasons, their derivability | Orchestration · blueprint paths |
| `boundary.md` | Where writes are allowed and what refusal looks like | Anything about *content* |
| `fill.md` | The six-step blueprint → artifact procedure | Which blueprint to use for which round |
| `depth.md` | Subdomain class → spec depth; express reductions | Question text |
| `validation.md` | The twelve checks and the three-state report | How to fix anything it finds |
| `blueprints/**` | Section structure, guidance, worked examples | Question text · orchestration. **Read-only at run time** |

> A rule in the wrong module is not a style problem — it is FF-002 failing, and it makes the
> two things the kit author edits most often collide.

## Writing instructions a model follows correctly

| Rule | Why |
|---|---|
| **State what to do *and* what not to do.** | "Write files under `spec/`" permits writing elsewhere too. "…and nowhere else without asking" does not. |
| **Give the reason, not just the rule.** | A rule with a reason generalises to the case you did not anticipate. A bare rule does not. |
| **Order matters — say so explicitly.** | "Normalise, **then** compare" is the whole security boundary. "Normalise and compare" loses it. |
| **Name the failure each step prevents.** | The six fill steps each carry theirs. It is what stops step 4 being skimmed. |
| **Never write "handle appropriately", "make it robust", "as needed".** | Each is a decision handed to the model without saying so. |
| **Prefer a table to a paragraph for anything enumerable.** | Tables are read; paragraphs are skimmed. |
| **Link, do not restate.** | Two copies of a rule become two different rules. Ousterhout's red flags 2 and 6, and the most likely defect in a product made of prose. |

## Error handling

| Situation | Rule |
|---|---|
| Something is unknown | `[TODO: <the exact question>]` **plus** a matching `Q-###`. Never a plausible value |
| Something is missing (a blueprint) | **Stop and name it.** Never improvise a structure |
| Something is refused (a write) | Name the **path**, never the file's contents |
| Something failed a check | Retry **once**, then flag. Never a third attempt |
| Something did not run | Report **not run**. Never infer passed |
| Two answers conflict | Quote **both** verbatim. Choose neither |

## Output standards

- Plain text. **No meaning carried by colour or symbol alone** (REQ-NF-006).
- `(Recommended)` is stated in words, not implied by position.
- Every empty state is stated **positively** — *"No open `[TODO]` markers"*, never silence.
- Report the **count of things that ran**, not only the count that failed.

## Absolute prohibitions

| Never | Because |
|---|---|
| Add a script, manifest, lockfile, or dependency | ADR-002 · FF-009 |
| Add a state, progress, session, cache, or answer file | ADR-004 |
| Add a second command, flag, or mode | FF-001 — Simplicity's measure counts branches |
| Write outside `spec/` without asking, naming the file | BR-008 |
| Modify a developer's `CLAUDE.md` or `.gitignore` — **even with permission** | REQ-F-026, REQ-F-035, EV-036 |
| Read `.env` or a secret file | SEC-A-002 |
| Invent a fact, metric, or compliance requirement | BR-003 |
| Weaken or delete a test | Appendix H |
| Edit an accepted ADR | Supersede it instead |
| Edit `spec/` in this repository | It is the specification, not the product |

---

## Rule-version log

**Append a row whenever a defect reveals a repeatable mistake.** Every row costs a real
defect; that is what makes the list worth reading rather than worth skimming.

| Version | Date | Rule added or changed | Prompted by |
|---|---|---|---|
| v1.0 | 2026-08-03 | Initial set, derived from ADR-001…005 and the constraints | Intake |
| | | | |

> Ch. 30 §30.3: agent rules change when a **repeated** AI mistake appears — with a reason and
> an example. Adding a rule because it sounds sensible dilutes the ones that were paid for.

> Blueprint: ../../../spec-driven-template/06-agent/01-instructions/agent-rules-and-coding-standards.md
