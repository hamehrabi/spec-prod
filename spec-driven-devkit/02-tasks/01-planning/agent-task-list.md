# Agent Task List

> Source: Front Matter workspace, Ch. 14, Ch. 25 §25.8, Ch. 30 §30.2.
> An agent-friendly task list is **not** a normal to-do list. Each entry gives the agent
> instructions in a format that reduces guessing.
>
> **The best task list is boring, specific, and controlled.**

**Who works this list:** an AI coding agent, one task at a time, directed by one developer
(CON-008). Task files are therefore **boundaries, not guidance** — an agent that cannot see
the whole project needs the allowed-file and do-not-change lists to be exact.

---

## Task table

| Task ID | Agent task | Input artifacts | Acceptance check | Depends on | Out of scope |
|---|---|---|---|---|---|
| TASK-001 | Create the plugin manifest and one command that prints the preamble and exits. | tech spec §1–2, API C1, ADR-001/002 | Installs; command runs; preamble prints; **no file written** | — | Questions · writes · a second command |
| TASK-002 | Add a CI gate running FF-001, FF-002, FF-009 that blocks the merge. | `fitness-functions.md`, ADR-002 | Each check **seen to fail** on a broken input | TASK-001 | The other eleven fitness functions |
| TASK-003 | Package the blueprint library into the plugin, read-only. | `spec-driven-template/`, `subdomain-map.md` | All present, byte-identical, readable offline | TASK-001 | Editing any blueprint · `appendix-index.md` |
| TASK-004 | Build the boundary layer: normalise-then-check, collisions, protected files. | security §2–3, ADR-004, `security-tests.md` | Twelve denials pass; each **seen to fail** first | TASK-001 | Writing any file |
| TASK-005 | Specify the six-step fill procedure and test it. | tech spec §4, ADR-003 | Structure preserved · example gone · placeholders gone · back-link resolves | TASK-003 | Asking questions · choosing which blueprint |
| TASK-006 | Make Round 1 work end to end: ask, write three files, summarise. | Round 1 questions, `fill.md`, `boundary.md` | Three files under `spec/`; summary line; nothing outside | TASK-004, TASK-005 | Rounds 2–8 · inference · validation |
| TASK-007 | Derive stage by inspection and resume from the first incomplete one. | ADR-004, `database-design.md` §0 | **8/8** interrupt-and-resume; **no state file** | TASK-006 | Auto-reconciling hand-edits |
| TASK-008 | Add Rounds 2–4, the core-subdomain question, and the three-driver rule. | Rounds 2–4, `depth.md` | One core subdomain; exactly one push-back; depth varies by class | TASK-006 | Inference (TASK-011) |
| TASK-009 | Add Rounds 5–6, ADR generation, fitness functions, deny tests. | Rounds 5–6, `ADR-000-template.md` | Every driver has an FF; every rule has a denial; no blank runtime rows | TASK-008 | `AGENT.md` itself |
| TASK-010 | Add Rounds 7–8 and produce the remaining ~50 files. | Rounds 7–8 file tables | **Every file in the tables**; task files carry both lists | TASK-009 | Validation · entry point · report |
| TASK-011 | Add inference and contradiction detection. | DD-007, UTEST-006…009 | Derivable suppressed **with a notice**; contradictions quote both | TASK-008 | Rewording questions |
| TASK-012 | Run twelve validation checks with three-state reporting and one retry. | tech spec §11, BR-009 | Count of checks **run** reported; each seen to fail | TASK-010 | Repairing anything beyond one re-fill |
| TASK-013 | Write the entry point last: under 100 lines, paths resolve, version stamped. | master process, ADR-005 | < 100 lines; all paths resolve; existing `CLAUDE.md` untouched | TASK-012 | The closing report |
| TASK-014 | Produce the closing report and the hand-off block. | master process, `frontend-component-spec` | Five sections; no placeholder; **ETEST-003 passes** | TASK-013 | Fixing what the report names |
| TASK-015 | Add express depth as the single argument. | DD-006, FF-001 | One command, **one path**; no stage skipped | TASK-011 | A third depth |
| TASK-016 | Build the 36 golden fixtures and the eval harness. | `ai-evals.md` | Eleven deterministic scorers block the merge; FF-003 8/8 | TASK-014 | Fixing what evals reveal |

---

## Breaking a feature into tasks (Ch. 14 §14.2)

| Feature area | Task here | Output | Test signal |
|---|---|---|---|
| Entry | Manifest + one command | The plugin exists | It installs and runs |
| Rules | The boundary layer | `boundary.md` | A traversal path is rejected |
| Transform | The fill procedure | `fill.md` | Structure preserved, example gone |
| Interaction | One round of questions | `questions.md` | Files appear, summary prints |
| State | Resume | `resume.md` | 8/8 interrupts resume |
| Verification | Validation | `validation.md` | A broken workspace fails |
| Hand-off | Entry point + report | `entrypoint.md`, `report.md` | A fresh session restates and waits |

**The one-outcome rule:** if one task has more than one major outcome, split it.

**A useful task answers five questions:** what changes · why · which spec it comes from ·
how you know it is done · **what must not be changed**.

---

## Avoid these task words

"handle everything" · "make it robust" · "finish the feature" · "improve the app" ·
"clean this up" · "make it better"

| Weak task | Better task |
|---|---|
| Build the intake. | TASK-006: ask Round 1's four questions plus the free-text question, write three files through `fill.md`, print `Round 1 — wrote 3 files`. Do not implement Rounds 2–8. |
| Make it safe. | TASK-004: normalise every destination path **before** comparing it to `spec/`; stop and ask on anything outside, naming the path and not its contents. |
| Add validation. | TASK-012: run twelve named checks, report each as passed / failed / **not run**, state the count that **ran**, re-fill a failing file once and then flag it. |
| Support a quick mode. | TASK-015: add `depth=express` as the single argument on the one flow; reduce depth within stages; **never skip a stage**; FF-001 must still count one path. |

---

## The three rules specific to this project

Ordinary task hygiene plus three that come from this product's own decisions:

1. **If a task appears to require executable code, the task is wrong.** ADR-002 ships Markdown
   and a manifest, nothing else. Stop and ask rather than adding a script.
2. **If a task appears to require a state file, the task is wrong.** ADR-004 forbids it. Stage
   is derived by inspection. A `.intake-state.json` is the single most likely
   well-intentioned violation in this project.
3. **The boundary layer precedes the first write.** TASK-004 before TASK-006, always. A kit
   that can write before it can refuse will write in the wrong place during its own build.

> **Why this list is safe:** every item has a source spec, a dependency, done criteria, and an
> out-of-scope boundary. The agent can work, but it cannot freely redesign the product.

> Blueprint: ../../../spec-driven-template/02-tasks/01-planning/agent-task-list.md
