// UTEST-063 — the FAIL line names each kind of failure separately.
// Requirement: TASK-016 · BR-009 · GOLD-001.
//
// The runner summed two different things and printed the total under one of their names. A run
// that listed six structural differences announced "8 gated differences"; the missing two were
// scorer breaches, printed in a different section of the same report. A reader who counts what
// is above the verdict and gets a different number concludes they have misread the report.
//
// They are not interchangeable, which is why merging them is worse than imprecise. A gated
// difference is the run disagreeing with the golden workspace — and the golden workspace can be
// the wrong one: EV-001 has four hand-authored deviations from its own blueprints, and on three
// of them two independent runs sided with the blueprint. A scorer breach is the workspace
// failing on its own terms, no fixture involved. The first is a question about the fixture; the
// second is a defect in the kit. Sending both to a reader as one number sends them to the wrong
// place half the time.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { verdictLine } from '../../ci/generate-workspace.mjs'

test('UTEST-063: both kinds appear, and are counted separately', () => {
  // The exact shape of the run that exposed this: 6 structural, 2 breaches, announced as 8.
  const line = verdictLine(6, 2)
  assert.match(line, /6 gated differences/)
  assert.match(line, /2 scorer breaches/)
  assert.doesNotMatch(line, /\b8\b/, 'the two kinds are summed into a single number')
})

test('UTEST-063: a kind with no failures is not mentioned', () => {
  // "0 scorer breaches" alongside a real count reads as a measurement of nothing, and this
  // report has a NOT RUN state precisely so zero can keep meaning zero.
  assert.equal(verdictLine(3, 0), '3 gated differences')
  assert.equal(verdictLine(0, 1), '1 scorer breach')
})

test('UTEST-063: singular and plural are both right', () => {
  // Small, but this line is the one sentence a reader takes away, and "1 gated differences"
  // makes them wonder what else was not checked.
  assert.equal(verdictLine(1, 1), '1 gated difference, 1 scorer breach')
  assert.equal(verdictLine(2, 2), '2 gated differences, 2 scorer breaches')
})

test('UTEST-063: the verdict never claims a failure that did not happen', () => {
  // The caller only prints this when the total is non-zero, so an empty string here would be a
  // FAIL line with nothing after the dash. Asserted rather than assumed, because the guard and
  // this function live in different places and either could move.
  assert.equal(verdictLine(0, 0), '')
})
