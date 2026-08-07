// UTEST-062 — every field the answer record parses reaches the run.
// Requirement: TASK-016 · BR-002 · BR-003 · REQ-F-043 · BUG-028.
//
// `parseAnswers` extracted `project` from the record's header and `briefing()` never used it.
// A parse whose result nothing consumes is not a small waste — it is a silent decision that an
// input is not an input, taken by omission rather than on purpose.
//
// The cost was measured, not guessed. `blueprints/README.md` opens with the placeholder
// `# [project name] — specification workspace` and fill.md step 4 requires it to be filled. No
// question in the interview asks for a name, so the briefing was the only place a run could
// learn it. Every real run therefore invented one — a $6.91 EV-001 run produced "MealPlan"
// where the fixture says "Pantry" — and `compare()` reports README.md's heading 1 as a GATED
// difference. The run failed its structural comparison for something the harness withheld,
// which makes the harness's verdict about the kit worthless in exactly that spot.
//
// The general assertion is the one that matters here. Naming `project` alone would leave the
// next field to be added and forgotten the same way.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseAnswers, briefing } from '../../ci/answers.mjs'

const RECORD = parseAnswers(readFileSync('tests/fixtures/golden/EV-001-answers.md', 'utf8'))
const BRIEFING = briefing(RECORD, 3)

test('UTEST-062: the record still carries a project name to lose', () => {
  // The premise. If the header field is ever dropped from the fixture, the assertions below
  // would pass by matching nothing at all — this repository's signature failure.
  assert.ok(RECORD.project, 'EV-001-answers.md no longer has a **Project:** header')
  assert.match(RECORD.project, /Pantry/)
})

test('UTEST-062: the briefing carries the project name', () => {
  // The defect itself. Before the fix the string "Pantry" appeared zero times in the prompt a
  // $7 run was given, while the fixture it was graded against had it in a gated heading.
  assert.ok(BRIEFING.includes(RECORD.project), 'briefing() drops the project name')
})

test('UTEST-062: no parsed field is dropped on the floor', () => {
  // The general form. `project` was the instance that cost money; the rule is that a field
  // worth parsing is a field worth passing on, and that anything exempt says so by name.
  //
  // `rounds` is structural — its answers are rendered individually below — and `depth` is
  // carried by the slash command rather than the briefing (intakeCommand() takes it), so both
  // are named exemptions rather than silent ones.
  const carried = { project: true, problem: true, rounds: 'rendered per answer', depth: 'intakeCommand()' }
  for (const field of Object.keys(RECORD)) {
    assert.ok(field in carried, `parseAnswers now returns "${field}" and nothing says where it goes`)
    if (carried[field] === true && RECORD[field])
      assert.ok(BRIEFING.includes(RECORD[field]), `briefing() drops "${field}"`)
  }
})

test('UTEST-062: every answer the developer gave still reaches the run', () => {
  // The rounds exemption above, made real rather than asserted. An exemption nobody checks is
  // how the project name was lost in the first place.
  for (const round of RECORD.rounds.filter((r) => r.n <= 3))
    for (const a of round.answers.filter((a) => a.asked))
      assert.ok(BRIEFING.includes(a.answer), `Round ${round.n} Q${a.q}'s answer is not in the briefing`)
})

test('UTEST-062: the briefing still names nothing from this harness', () => {
  // Unchanged from UTEST-032, restated because this change ADDS text to the prompt. The record
  // is also a document about its own fixture; anything of that kind reaching a run is BR-002 by
  // way of the tool built to detect BR-002.
  for (const leak of ['TASK-016', 'GOLD-001', 'EV-001', 'golden', 'fixture', 'harness'])
    assert.doesNotMatch(BRIEFING, new RegExp(leak, 'i'), `the briefing names "${leak}"`)
})
