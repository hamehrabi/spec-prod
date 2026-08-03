# 03-tests/ — Executable Tests

> Source: Front Matter workspace (`03-tests/unit`, `03-tests/integration`, `03-tests/end-to-end`) +
> Ch. 12 §12.4.

This folder holds the **runnable** tests. The written plans and specifications they come
from live in [`../01-plan/test-plan.md`](../01-plan/test-plan.md).

```
03-tests/05-executable/
  unit/           # one rule of the intake, in isolation
  integration/    # blueprint -> artifact; contract conformance; denials
  end-to-end/     # full intakes, resume, platforms, hand-off
```

---

## Where these live, and why it is not a contradiction with ADR-002

ADR-002 says the kit ships **no executable code**. These tests are executable code. Both are
true, because they live in different places:

| | The **published plugin** | The **kit's repository** |
|---|---|---|
| Contains | Markdown and the plugin manifest, nothing else | The above, **plus** `03-tests/05-executable/`, the golden fixtures, and CI workflow files |
| Ships to a developer | **Yes** | **No** — none of it is in the plugin payload |
| Governed by ADR-002 | **Yes — FF-009 enforces zero executable files** | No |

**A developer who installs the kit receives none of this.** They get a validation step
performed by the agent at the end of intake (REQ-F-029). These tests are the kit author's
independent check — the one that does not share a failure mode with the thing it checks.

**Runner: `node --test`** (DD-018, closes Q-011). Built into an already-installed Node, so
there is **no package manifest, no lockfile, and no install step anywhere in the repository**
— which keeps it clean of exactly the files FF-009 exists to find, and removes any argument
about whether ADR-002 was bent for the tests that enforce it.

**Location: `tests/` at the repository root, not here** (DD-016). This folder is inside the
specification workspace, which every task's do-not-change list forbids editing; the tests it
describes live beside `ci/` and `.github/` instead. The structure, naming convention, and
mapping below hold unchanged — only the root differs:

```
tests/
  unit/           # one rule of the intake, in isolation
  integration/    # blueprint -> artifact; contract conformance; denials
  end-to-end/     # full intakes, resume, platforms, hand-off
```

---

## Plan → executable mapping

| Plan document | Executable location |
|---|---|
| [`unit-tests.md`](../02-functional/unit-tests.md) | `unit/` |
| [`integration-tests.md`](../02-functional/integration-tests.md) | `integration/` |
| [`end-to-end-tests.md`](../02-functional/end-to-end-tests.md) | `end-to-end/` |
| [`security-tests.md`](../03-non-functional/security-tests.md) | `integration/` (negative cases) |
| [`performance-tests.md`](../03-non-functional/performance-tests.md) | `end-to-end/` (PTEST-001 needs a whole run) |
| [`failure-tests.md`](../04-failure/failure-tests.md) | matching level — mostly `end-to-end/` here, because most failures are whole-run conditions |
| [`acceptance-tests.md`](../02-functional/acceptance-tests.md) | `end-to-end/` or `integration/` |
| [`ai-evals.md`](../03-non-functional/ai-evals.md) | `end-to-end/` — the 36 answer scripts, scored rather than asserted |

### The fixtures everything shares

```
03-tests/05-executable/fixtures/
  answer-scripts/     # 36 named scripts (EV-001 .. EV-036) - the "user input"
  repositories/       # seeded repos: clean / has-CLAUDE.md / has-gitignore /
                      #               populated-spec / read-only
  golden/             # workspaces generated from the scripts, kept for regression
```

**One fixture set, two purposes.** The end-to-end tests assert *structure* over these runs;
the evals *score* the same runs. Duplicating them would let the two drift, and drift here is
invisible.

---

## Naming convention

Include the test ID and the requirement so a failure points straight at the spec:

```
unit/test_UTEST-019_path_check_after_normalisation
unit/test_UTEST-022_not_run_is_not_passed
integration/test_TEST-013_existing_claude_md_unchanged
integration/test_STEST-003_path_traversal_rejected
end-to-end/test_ETEST-009_resume_stage_5
end-to-end/test_FTEST-004_missing_blueprint_halts
```

---

## Expected test tree

```
03-tests/05-executable/
  unit/
    test_UTEST-003_recommended_option_first.*
    test_UTEST-006_derivable_question_suppressed.*
    test_UTEST-007_inference_is_stated.*
    test_UTEST-008_contradiction_quotes_both.*
    test_UTEST-009_eight_round_hard_stop.*
    test_UTEST-011_push_back_exactly_once.*
    test_UTEST-014_backlink_depth.*
    test_UTEST-016_identifier_never_reused.*
    test_UTEST-017_todo_not_invention.*
    test_UTEST-019_path_check_after_normalisation.*
    test_UTEST-020_worked_example_removed_whole.*
    test_UTEST-021_stage_derived_not_stored.*
    test_UTEST-022_not_run_is_not_passed.*
    test_UTEST-023_gitignore_before_env_example.*
    ... (25 total)
  integration/
    test_TEST-005_structure_preserved.*
    test_TEST-006_backlink_resolves_at_depth.*
    test_TEST-007_identifiers_resolve.*
    test_TEST-013_existing_claude_md_unchanged.*
    test_TEST-014_no_example_content.*
    test_TEST-017_module_swap_cost_zero.*
    test_STEST-001_refuses_to_write_code.*
    test_STEST-002_write_outside_spec_blocked.*
    test_STEST-003_path_traversal_rejected.*
    test_STEST-005_non_kit_spec_folder.*
    test_STEST-007_claude_md_never_proposed.*
    test_STEST-012_no_state_file_anywhere.*
    test_STEST-013_blocked_write_names_path_only.*
    ... (18 + 14 total)
  end-to-end/
    test_ETEST-003_handoff_to_build_session.*
    test_ETEST-004_full_intake_clean_repo.*
    test_ETEST-006_eight_round_ceiling.*
    test_ETEST-007_express_depth.*
    test_ETEST-009_resume_stage_1.*  ... _stage_8.*     <- eight files, FF-003
    test_ETEST-011_offline_run.*
    test_ETEST-012_platform_windows.* / _macos.* / _linux.*
    test_PTEST-001_progress_within_one_round.*
    test_FTEST-004_missing_blueprint_halts.*
    test_FTEST-005_not_run_reported.*
    test_FTEST-006_retry_once_then_flag.*
    ... (12 + 18 total)
```

## Plan → executable, traced

| Plan entry | Executable file | Requirement |
|---|---|---|
| `unit-tests.md` → UTEST-019 | `unit/test_UTEST-019_path_check_after_normalisation` | REQ-F-024, SEC-Z-001 |
| `unit-tests.md` → UTEST-022 | `unit/test_UTEST-022_not_run_is_not_passed` | REQ-F-029, BR-009 |
| `integration-tests.md` → TEST-013 | `integration/test_TEST-013_existing_claude_md_unchanged` | REQ-F-026 |
| `security-tests.md` → STEST-003 | `integration/test_STEST-003_path_traversal_rejected` | SEC-Z-001 |
| `end-to-end-tests.md` → ETEST-009 | `end-to-end/test_ETEST-009_resume_stage_1..8` | REQ-F-028, REQ-NF-003 |
| `failure-tests.md` → FTEST-004 | `end-to-end/test_FTEST-004_missing_blueprint_halts` | REQ-F-003 |
| `performance-tests.md` → PTEST-001 | `end-to-end/test_PTEST-001_progress_within_one_round` | REQ-NF-001 |
| `ai-evals.md` → EV-001…036 | `end-to-end/` eval runner over `fixtures/answer-scripts/` | the instruction set |

## Run commands

```
Everything:       node --test "tests/**/*.mjs"
Unit only:        node --test "tests/unit/*.mjs"
Integration:      node --test "tests/integration/*.mjs"
End-to-end:       node --test "tests/end-to-end/*.mjs"
One requirement:  node --test "tests/**/*.mjs" --test-name-pattern "UTEST-019|STEST-003"

Full gate (must pass before merge):
  1. FF-001, FF-002, FF-009        # shape of the plugin itself - fastest, fail early
  2. <runner> unit                 # 25 rule tests
  3. generate golden workspaces    # from fixtures/answer-scripts/
  4. <runner> integration          # 32 contract + denial tests
  5. <runner> end-to-end           # 30 whole-run tests, including resume x8
  6. eval scorers                  # 11 deterministic; the 2 human ones gate RELEASE, not merge
```

The step order is not arbitrary: cheapest and most likely to fail first, `resume ×8` last
because it is the slowest. Steps 1 and 2 are implemented in `.github/workflows/gate.yml`;
steps 3–6 need a golden workspace to walk and arrive with TASK-016.

---

## Rules

- **Tests come from acceptance criteria**, not from the code that was just written
  (Ch. 17 §17.1).
- Every behavior change adds or updates a test (Ch. 11 §11.5).
- Security-sensitive paths need **negative** tests (Appendix P).
- Never delete or weaken a test to make code pass (Appendix H).
- Every fixed bug gets a regression test that **fails before** the fix and **passes after**
  (Ch. 19 §19.6).
- A test that asserts "something happened" instead of "the right thing happened" is a
  shallow test — strengthen the assertion (Ch. 18 §18.3).

### Two rules this project needs on top

- **Never assert on generated prose.** ADR-002 makes it non-deterministic. Assert counts,
  checksums, paths, and present/absent strings. Judgement belongs in the evals, scored
  against a floor.
- **Every write test asserts the negative half.** The set of files outside `spec/` must be
  identical before and after, and every pre-existing file's checksum must be unchanged. A
  test that only checks the workspace was created would pass a run that also quietly appended
  to the developer's `CLAUDE.md`.

> Naming files after the **test ID and requirement** is what makes a CI failure readable:
> `test_STEST-003_path_traversal_rejected` points straight at the security rule that broke,
> not at an anonymous line number.

> Blueprint: ../../../spec-driven-template/03-tests/05-executable/executable-tests.md
