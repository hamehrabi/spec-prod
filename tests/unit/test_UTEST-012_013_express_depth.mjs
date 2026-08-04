// ATEST-014, UTEST-012/013, ETEST-007 — express depth.
// Requirement: REQ-F-033, REQ-F-034 · DD-006 · FF-001.
//
// A small project should not be made to carry full depth. But a second FLOW would be
// exercised half as often and would rot — so the only way to have express without
// undercutting Simplicity is to make it an argument.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseQuestions } from '../../ci/questions.mjs'

const depth = readFileSync('plugin/instructions/depth.md', 'utf8')
const intake = readFileSync('plugin/instructions/intake.md', 'utf8')
const command = readFileSync('plugin/commands/spec-intake.md', 'utf8')
const report = readFileSync('plugin/instructions/report.md', 'utf8')
const { text: questions } = parseQuestions()

test('UTEST-013 / REQ-F-034: depth is an argument, never a second path', () => {
  assert.match(depth, /It changes how much is asked and written\. It never changes which path runs/i)
  assert.match(intake, /never \*\*which path runs\*\*/i)
  // The reason it is a parameter and not a mode, stated where someone might add the branch.
  assert.match(depth, /exercised half as often\s*\n?and would rot/i)
  assert.match(intake, /would be exercised half as often and\s*\nwould rot/i)
})

test('UTEST-013: depth is the ONLY argument, and bad values are rejected by name', () => {
  assert.match(intake, /\*\*one argument, and only one\*\*/i)
  assert.match(intake, /depth must be `default` or\s*\n?`express`/i)
  assert.match(command, /argument-hint: "\[default\|express\]"/)
})

test('UTEST-012 / ATEST-014: express reduces WITHIN a stage, never deletes one', () => {
  assert.match(depth, /Reduce within a stage; never delete a stage/i)
  assert.match(depth, /Every stage still runs, and every stage still produces its minimum artifacts/i)
  assert.match(depth, /\*\*Up to two\*\*/i, 'fewer questions per round')
})

test('the two questions express never drops are the two that decide the rest', () => {
  // The free-text statement grounds the workspace; the core subdomain decides where depth goes.
  assert.match(depth, /free-text problem statement.*Always asked.*only thing grounding/is)
  assert.match(depth, /Core-subdomain question.*Always asked.*decides where the remaining depth goes/is)
  assert.match(questions, /asked at \*\*both\*\* depths, always/i)
})

test('the acceptance gate is not a depth setting', () => {
  assert.match(depth, /Acceptance gate.*Every round.*Never skippable, at any depth/is)
  // Nor is the three-driver limit.
  assert.match(depth, /Up to three\.\*\* The limit is not a depth setting/i)
})

test('ETEST-007: a thinner workspace is not a weaker one', () => {
  assert.match(depth, /Every structural rule holds identically at both depths/i)
  assert.match(depth, /reduces \*\*volume\*\*, never \*\*validity\*\*/i)
  // The distinction that matters: skipping a check is not thinness.
  assert.match(depth, /skipped a check to be faster/i)
  assert.match(depth, /it is an unvalidated one/i)
})

test('two depths, not three — a third would be a configuration system', () => {
  assert.match(depth, /Two depths, not three/i)
  assert.match(depth, /a configuration system is a\s*\n?set of branches nobody exercises evenly/i)
})

test('the closing report names which stages were written thin', () => {
  assert.match(depth, /names which stages were written thin/i)
  assert.match(report, /Which stages were written thin/i)
  assert.match(report, /Written at full depth throughout/i)
  // So the developer knows it was a choice, not a gap.
  assert.match(report, /a choice they made\*\*, not a gap/i)
})
