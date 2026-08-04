# Decision Log

> Source: Ch. 4 §4.4 — `decisions.md`: "Records important design trade-offs. Whenever you
> choose one option over another."

This is the **lightweight** log. Use it for everyday choices that shape the work but do
not warrant a full record. When a decision affects architecture, security, reliability, or
performance in a lasting way, promote it to an ADR in
[`architecture-decisions/`](architecture-decisions) and link it here.

---

| ID | Date | Decision | Options considered | Why this one | Affects | Promoted to ADR? |
|---|---|---|---|---|---|---|
| DD-001 | 2026-08-03 | Four separated modules inside one plugin. | Single instruction file; four modules; one file per generated artifact. | REQ-NF-005 is unsatisfiable with a single file, and per-artifact files leave orchestration homeless. | REQ-NF-005 | **ADR-001** |
| DD-002 | 2026-08-03 | Instructions only; the kit ships no executable code. | Instructions only; a full program; a hybrid with a validation binary. | The hybrid's failure mode — validation silently skipped where the runtime is absent — builds BR-009's violation into the architecture. | REQ-F-001, REQ-NF-008, CON-004, CON-006 | **ADR-002** |
| DD-003 | 2026-08-03 | Copy the blueprint file, then fill it in. | Author fresh from the blueprint; copy-then-fill; extract structure only. | Copy-then-fill's failure (leftover template text) is greppable; author-fresh's failure (a silently missing section) is not. | REQ-F-016, BR-002 | **ADR-003** |
| DD-004 | 2026-08-03 | A fixed `spec/` folder at the repository root; no state file. | Fixed folder; product-named folder; configurable path. Separately: state file vs derived state. | A hidden state file can disagree with the specification, which contradicts the product's own proposition. | REQ-F-014, REQ-F-028, CON-005 | **ADR-004** |
| DD-005 | 2026-08-03 | Stamp the plugin version into generated workspaces. Not the timestamp. | No stamp; version; version + timestamp. | Version answers *which library*; the timestamp answers *when*, which nobody asked, and churns every diff. | REQ-F-016, REQ-F-020 | **ADR-005** |
| DD-006 | 2026-08-03 | Express depth is a **parameter on the single flow**, never a second flow or command. | Two commands; two flows behind one command; one flow with a depth argument. | The Simplicity driver's measure literally counts paths. Two flows would guarantee the second one rots. | REQ-F-033, REQ-F-034 | n/a — enforced by **FF-001** |
| DD-007 | 2026-08-03 | Depth comes from inference and blueprint quality, not from more questions. | More rounds; richer templates + inference; a second deepening pass. | Reconciles "developers finish the intake" with "depth of the generated documents" without lengthening the interview. Makes REQ-F-009 load-bearing. | REQ-F-009, REQ-F-017 | n/a |
| DD-008 | 2026-08-03 | Security is a constraint and a set of deny tests, **not** a driving characteristic. | Four drivers; three with security; three without. | It cannot be under-served without first breaking a hard constraint that stops the build. Driver slots are for qualities that can silently degrade. | CON-005, BR-008 | n/a — rationale in `driving-characteristics.md` |
| DD-009 | 2026-08-03 | Fitness functions run in the **kit author's CI** over golden workspaces, not on the developer's machine. | Developer-side checks; CI-side; both. | ADR-002 leaves no build on the developer's machine. CI is the only place a check can actually block something. | All FF-### | n/a — consequence of **ADR-002** |
| DD-010 | 2026-08-03 | Validation is a step **inside** intake for v1, not a separately invokable command. | Inside only; inside plus standalone; standalone only. | A standalone command must handle workspaces it did not generate — materially harder, and CON-002 gives two to four weeks. | REQ-F-029 | n/a — closes **Q-001** |
| DD-011 | 2026-08-03 | An existing root `CLAUDE.md` is never modified; the kit writes its entry point inside `spec/` and prints the line to add. | Write elsewhere and instruct; show a diff and ask to append; refuse and stop. | Zero risk to work the developer already did, at the cost of one manual step. Refusing would lose first-time users at the install step. | REQ-F-026, CON-005 | n/a — closes **Q-004** |
| DD-012 | 2026-08-03 | The kit never requests blanket write permission; the host's per-file prompt stands on a first run. | Blanket permission; per-file confirmation; kit-built confirmation UI. | The host already prompts, so honouring per-file confirmation costs nothing to build — and it is the only enforcement independent of the kit's own good behaviour. | REQ-F-025 | n/a — see RSK-6 |
| DD-013 | 2026-08-03 | Tests assert **structure**, never generated prose. | Byte-equality on golden output; structural assertions; manual review. | ADR-002 makes output non-deterministic; equality assertions would produce a permanently red, permanently ignored suite. | REQ-F-029, all FF-### | n/a — consequence of **ADR-002** |

### Decisions made during implementation

*Everything above was decided during the intake. Everything below was decided while building,
by the task that could not proceed without it. Each names the open question it closes.*

| ID | Date | Decision | Options considered | Why this one | Affects | Promoted to ADR? |
|---|---|---|---|---|---|---|
| DD-014 | 2026-08-03 | The intake command is **`spec-intake`**, invoked `/spec-driven-devkit:spec-intake`. | `spec`; `intake`; `specify`; `spec-intake`. | `spec` and `intake` collide with existing commands and read ambiguously in a hand-off block; `specify` is already established by another tool for a similar job. Renaming later is a major version under C1, so distinctiveness beat brevity. | REQ-F-002, C1 | n/a — closes **Q-009** |
| DD-015 | 2026-08-03 | The plugin payload lives at **`plugin/`**, beside the specification workspace rather than inside it. | Repository root; `04-src/` inside the workspace; a dedicated `plugin/`. | **The specification contradicted itself here** — `AGENT.md` and `04-src/README.md` place the plugin in `04-src/`, while the TASK-001 hand-off lists its files unprefixed and marks `spec/**` do-not-change. A dedicated root satisfies both: the payload is one subtree FF-009 can name exactly, and the kit's own 113 specification files never ship to a developer. | ADR-002, FF-009, TASK-001 | n/a — resolves a specification conflict; see `spec-change-log.md` |
| DD-016 | 2026-08-03 | Executable tests live at **`tests/`** and CI checks at **`ci/`**, both at the repository root. | `03-tests/05-executable/` as written; repository root. | Same conflict as DD-015 and the same resolution. `03-tests/05-executable/` is inside the workspace every task forbids changing, and TASK-002 already places `ci/` and `.github/` at the root. Keeping build artifacts outside `spec/` makes the payload boundary decidable by path. | ADR-002, FF-009 | n/a — see DD-015 |
| DD-017 | 2026-08-03 | CI is **GitHub Actions on a public repository**. Ceiling **$0/month**, no minute threshold to alert on. | GitHub Actions on a private repo; the same on a public repo; no CI; GitHub Pro. | Public was not chosen for the unlimited minutes. **Branch protection is unavailable on a private repository at this plan**, so on a private repo the gate could report but never block — and a check that does not block is what `fitness-functions.md` calls a decoration. Public is the only option that satisfies TASK-002's acceptance criterion at $0. | FF-001, FF-002, FF-009, TASK-002 | n/a — closes **Q-010** |
| DD-018 | 2026-08-03 | The test runner is **`node --test`**. | `node --test`; Python + pytest; Python stdlib `unittest`. | Built into an already-installed runtime, so there is no package manifest, no lockfile, and no install step anywhere in the repository — which keeps the repository clean of exactly the files FF-009 exists to find, and removes any argument about whether ADR-002 was bent for the tests that enforce it. | All executable tests | n/a — closes **Q-011** |
| DD-020 | 2026-08-03 | The blueprint library ships **79 Markdown files**. Six non-Markdown template artifacts — `.gitignore`, `.env.example`, `Dockerfile.example`, and three `.gitkeep` — are **not packaged**. | Wrap them as `.md` and unwrap on fill; supersede ADR-002 with an allowlist; drop them. | Chosen so ADR-002 stays literally true and FF-009's threshold stays at **0** with nothing superseded and no allowlist to grow. **This has a known cost, accepted with eyes open: a generated workspace has no `.gitignore` and no `.env.example`, so REQ-NF-002 cannot be satisfied as written.** See Q-024. | REQ-F-003, ADR-002, FF-009, **REQ-NF-002** | n/a — closes the TASK-003 packaging conflict |
| DD-023 | 2026-08-04 | `.gitignore` and `.env.example` ship as **wrapper blueprints** — Markdown that carries the artifact in a fenced block and declares where it goes. **Supersedes DD-020.** | Leave them unpackaged and record the gap (DD-020); relax FF-009 to allow two non-Markdown files; carry them inside Markdown. | DD-020 was a correct reading of the rule and the wrong outcome: it left **REQ-NF-002 with no implementation path at all**, so a generated workspace had no ignore file and the requirement that `.env` be excluded before `.env.example` exists was unsatisfiable. Relaxing FF-009 would have traded a checkable rule for two exceptions. **Carrying the content costs nothing:** the payload stays Markdown, ADR-002 is untouched, and nothing here executes — what blocked this was the file-extension rule, not the no-runtime decision it exists to protect. | REQ-NF-002, FF-009, ADR-002 | n/a — closes **Q-024**, supersedes DD-020 |
| DD-022 | 2026-08-04 | The back-link **names** the blueprint — `> Blueprint: blueprints/<relative-path>` — rather than linking to it relatively. | A relative `../../../` path as C2 originally described; the library path as a name; the name plus a per-file version stamp. | A developer's blueprints live in the version-stamped plugin cache, not in their repository, so a relative path resolves nowhere on every machine but the kit author's — and **a link that looks authoritative while pointing at nothing is worse than an honest name.** The name is portable across all three platforms, survives every plugin update, and is what ADR-005's migration notes are already written against. A per-file version stamp was rejected for the reason ADR-005 rejected timestamps: it churns ~90 lines on every release. **It also removes the depth arithmetic entirely** — the blueprint's path below `blueprints/` is the artifact's path below `spec/`, so UTEST-014's miscount cannot occur by construction. | REQ-F-016, C2, FF-007, UTEST-014 | n/a — **amends contract C2**, recorded in `spec-change-log.md` |
| DD-021 | 2026-08-03 | The integrity manifest checksums **raw bytes**, and `.gitattributes` pins the payload to **LF on every platform**. | Hash raw bytes and accept that Windows and Linux disagree; hash line-ending-normalised content; pin the bytes and hash them raw. | TASK-021's stop condition names this exactly: normalising the difference away *silently* makes the control meaningless, because a real alteration could then hide behind an encoding change. Pinning at checkout solves it at the source instead — the same blueprint is byte-identical on Windows, macOS, and Linux, so a raw-byte hash is portable and still detects a single changed byte. **This was live, not theoretical:** the working tree already held CRLF while Git stored LF, so FF-017 would have passed locally and failed in CI on the first push. | REQ-F-042, REQ-NF-008, CON-004, FF-017 | n/a — the stated rule TASK-021's stop condition demands |
| DD-019 | 2026-08-03 | The scheduled install test runs **weekly**. | Weekly; daily; monthly. | `cicd-pipeline.md`'s own estimate, and it is RISK-004's only detector. Monthly is long enough that a user reports the breakage first, which makes the detector pointless; daily costs seven times the minutes for a job that runs a full intake. **Recorded but not built** — it installs the *published* plugin and runs a fixed answer script, and neither exists before TASK-016. | RISK-004, TASK-016 | n/a — closes **Q-012** |

---

## Design decision detail — DD-007

```
Design Decision ID: DD-007
Related requirement: REQ-F-009, REQ-F-017

Decision:
  Depth in the generated workspace comes from two sources only:
    1. Inference — the intake derives consequences from answers rather than
       asking for them, and states each inference so it can be challenged.
    2. Blueprint quality — the templates carry the structure and guidance, so a
       filled file is deep because the template was, not because the interview
       was long.
  The interview does NOT grow to produce depth. Eight rounds is a hard ceiling.

Reason:
  The kit author named two things in Round 4 that pull against each other:
  "developers finish the intake" as the definition of first-month success, and
  "depth of the generated documents" as what matters most in the interview.
  Both quotes are recorded in product-spec.md. Lengthening the interview would
  satisfy the second by sacrificing the first, which is the primary risk (RSK-1).

Consequences:
  - REQ-F-009 stops being a nicety and becomes load-bearing. An intake that asks
    a derivable question is not merely inefficient; it is spending the budget that
    depth is supposed to come from.
  - Every suppressed question must be reported as an InferenceNotice. An unstated
    inference is a hidden assumption, which BR-003 forbids in the file and this
    forbids in the interview.
  - Blueprint quality becomes a product concern, not a documentation concern. This
    sharpens Q-003 — a library the product's depth depends on is harder to justify
    classifying as supporting.
```

---

## When does a requirement need a design decision? (Ch. 10 §10.3)

Ask: **"Can this requirement be implemented in more than one way?"**
If yes, document the chosen direction *before* creating tasks — otherwise the agent
picks a convenient implementation that may not match your intended architecture.

---

## Promote to an ADR when the decision…

- changes the architecture style or module boundaries,
- affects security or data-protection posture,
- affects reliability, failure behavior, or recovery,
- affects performance or cost at scale,
- would be expensive or risky to reverse later,
- creates a rule the AI assistant must follow during every future implementation.

Five of the thirteen decisions above met that bar. The eight that did not are recorded here
precisely because they are the ones most likely to be quietly reversed by someone who never
knew they were decided.

> Blueprint: ../../../spec-driven-template/01-docs/05-architecture/decisions.md
