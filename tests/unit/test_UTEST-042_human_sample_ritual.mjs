// UTEST-042 — the human sample has a procedure, not just a number.
// Requirement: TASK-016 step 7 · ai-evals.md §2 §3 · BR-009 · CON-007.
//
// Two rows of the release gate said "≥ 4 cases sampled" and nothing said what that meant. A
// ritual with no procedure is not performed — it is remembered differently by whoever last
// thought about it, and then skipped by whoever did not.
//
// It matters more here than it would elsewhere. CON-007 forbids telemetry, so the kit cannot
// observe its own failure rate in the field; eleven deterministic scorers can all sit at their
// floor while the workspace says nothing; and there is deliberately NO model-graded scorer,
// because grading a model-driven system with a model drifts on both sides at once. This ritual
// is the only place a person is required, which makes it the only place the requirement has to
// be written down.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const EVALS = readFileSync('spec-driven-devkit/03-tests/03-non-functional/ai-evals.md', 'utf8')
// Whitespace-normalised: ten defects in this repository have been a pattern that failed to
// match across a hard-wrapped line, and this file is hard-wrapped prose.
// BOUNDED. This used to run to end of file, swallowing §4, §5 and "What this harness is
// expected to catch" — so single-word matches like `/happy/` or `/highest/` could be satisfied
// by ninety lines of unrelated document rather than by the ritual itself.
const start = EVALS.indexOf('### The human sample')
const end = EVALS.indexOf('\n## ', start)
const RITUAL = EVALS.slice(start, end === -1 ? undefined : end).replace(/\s+/g, ' ')

test('UTEST-042: the ritual says how many, and that they are whole workspaces', () => {
  // "Four cases" is ambiguous in the one direction that matters: four files is a tenth of the
  // work and would feel like compliance.
  assert.match(RITUAL, /reads four whole generated workspaces, start to finish/)
  assert.match(RITUAL, /Not four files — four \*\*workspaces\*\*/)
})

test('UTEST-042: which four is decided by rule, not by preference', () => {
  // The highest-todo_density case is picked by NUMBER precisely so it cannot be picked by
  // comfort. A sample chosen by the person being reviewed is not a sample.
  //
  // THE RULE HAS FOUR COMPONENTS AND ONLY THREE WERE CHECKED. `edge` was never asserted, so
  // rewriting the row as "one happy and one adversarial, and the highest todo_density" — a
  // sample missing a whole case category — passed every test in this file. Assert the rule as
  // one sentence, so a category cannot go missing from the middle of it.
  assert.match(
    RITUAL,
    /One `happy`, one `edge`, one `adversarial`, and the case whose `todo_density` is \*\*highest\*\* in that release/,
    'all four components, in one sentence — dropping any one changes what the sample covers'
  )
  assert.match(RITUAL, /chosen by number precisely so it cannot be chosen by comfort/)

  // And four is the number, stated where the categories are counted.
  assert.match(RITUAL, /\*\*How many\*\* \| Four\./)
})

test('UTEST-042: the reader is not the author of the change', () => {
  assert.match(RITUAL, /except the person who wrote the change/)
  assert.match(RITUAL, /Reading your own output answers a different question/)
})

test('UTEST-042: it asks only the two human-scorer questions', () => {
  // Adding questions makes it a review; these two are the ones no count can answer.
  assert.match(RITUAL, /build the right thing from this/)
  assert.match(RITUAL, /structurally complete and hollow/)
})

test('UTEST-042: an escalation blocks the release and not the merge', () => {
  // The distinction §3 already draws. If this blocked the merge, every commit would wait on a
  // person; if it blocked nothing, structure alone would ship.
  assert.match(RITUAL, /escalation blocks the release/)
  assert.match(RITUAL, /Not the merge/)
})

test('UTEST-042: not doing it is an outcome, never a pass', () => {
  // BR-009, applied to a ritual rather than a check. "Structure passed, ship it" is the same
  // failure in different clothes.
  assert.match(RITUAL, /the release does not go out/)
  assert.match(RITUAL, /BR-009 wearing a different hat/)
  assert.match(RITUAL, /no quorum below four/)
})

test('UTEST-042: the release gate still names both human scorers', () => {
  // The procedure describes them; if a row is ever deleted the procedure would describe
  // something that no longer gates anything.
  for (const scorer of ['decision_quality', 'depth_felt'])
    assert.match(EVALS, new RegExp(`\\\`${scorer}\\\` \\(human, ≥ 4 cases sampled\\)`))
})
