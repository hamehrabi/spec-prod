// UTEST-090 — no stage of the merge gate reports success having run nothing.
// Requirement: BR-009 (three states, never two) · REQ-NF-001 · cicd-pipeline.md stage 2.
//
// `.github/workflows/gate.yml:25` promises "Every step below either passes or fails the
// build." Stage 2 had a third outcome and reported it as a pass.
//
// VERIFIED ON THE PINNED RUNTIME (node 24): `node --test "tests/**/*.nomatch"` prints
// `# tests 0` and EXITS 0. So a renamed directory, a changed file extension, or a runner that
// stopped expanding that pattern would have turned the single step standing behind GOLD-001
// and every unit and integration test in this repository green, having executed nothing.
//
// That is this repository's own worst pattern — a check that reports success having judged
// nothing — committed by the gate that exists to catch it, and it is the least visible place
// it could happen, because the step is counted as coverage for the entire suite.
//
// This test asserts the floor exists. The reason it asserts the SHAPE of the workflow rather
// than running it is that the workflow only runs on GitHub; a rule nothing here would notice
// the removal of is decoration (BR-010), and deleting three lines of YAML is exactly the kind
// of tidy-up that happens without anyone deciding to weaken a gate.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { norm } from '../_helpers.mjs'

const GATE = '.github/workflows/gate.yml'
const gate = readFileSync(GATE, 'utf8')

/** One `- name: …` step, from its name to the start of the next step. */
const step = (nameFragment) => {
  const steps = gate.split(/^ {6}- (?=name:|uses:)/m).slice(1)
  const found = steps.filter((s) => s.includes(nameFragment))
  assert.equal(found.length, 1, `expected exactly one gate step mentioning "${nameFragment}", found ${found.length}`)
  return found[0]
}

test('UTEST-090: stage 2 still runs the whole suite', () => {
  const stage2 = step('Stage 2')
  assert.match(stage2, /node --test/, 'stage 2 must run the test runner')
  assert.match(norm(stage2), /"tests\/\*\*\/\*\.mjs"/, 'and over the whole suite, not a subset')
})

test('UTEST-090: stage 2 fails when it collects ZERO tests', () => {
  const stage2 = norm(step('Stage 2'))

  // It has to read a count back. Running the command and trusting its exit status is exactly
  // what could not tell "everything passed" from "nothing ran".
  assert.match(stage2, /# tests/, 'stage 2 must parse the collected test count out of the run')

  // And act on zero. Printing the count without a comparison is a log line, not a gate.
  assert.match(stage2, /-eq 0/, 'stage 2 must compare the count against zero')
  assert.match(stage2, /exit 1/, 'and fail the build when it is zero')
  assert.match(stage2, /ran ZERO tests/i, 'naming what happened, because "exit 1" alone sends someone hunting a test failure')

  // An unparseable summary is not zero and is not a pass either — the third state again, one
  // level down. Without this, a reporter format change silently empties the count variable.
  assert.match(stage2, /if \[ -z "\$ran" \]/, 'an unreadable summary must fail too, not default to passing')
})

test('UTEST-090: stage 2 does not swallow a failure before it can be counted', () => {
  const stage2 = step('Stage 2')
  // The count is read from a file written by a second reporter, so `node --test` keeps its own
  // exit status instead of it becoming the exit status of a pipe. `set -e` then still stops a
  // genuine test failure from reaching the floor check and being reported as a pass.
  assert.match(stage2, /set -euo pipefail/, 'a failing command inside a multi-line run block must stop the step')
  assert.doesNotMatch(stage2, /node --test[^\n]*\|[^|]/, 'piping the runner would replace its exit status with the pipe\'s')
})

test('UTEST-090: every gate step either passes or fails — the file says so and means it', () => {
  assert.match(norm(gate), /A warning is not a gate\. Every step below either passes or fails the build/)
  // Stage 1 keeps its own shape: all four checks run, and any one failing fails the stage.
  const stage1 = step('Stage 1')
  assert.match(stage1, /failed=1/)
  assert.match(stage1, /exit \$failed/)
})
