// UTEST-024 — "Edit a question, then a blueprint → FF-002 passes for each alone."
// Requirement: REQ-NF-005, ADR-001.
//
// The permissive half of FF-002. A check that fails everything is not a boundary, it is an
// obstacle — so the independence this guards has to be demonstrably allowed, one side at a
// time. The forbidden combination is TEST-017's job.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { check, run } from '../_helpers.mjs'

const FF002 = check('ff-002-module-independence.mjs')
const files = (...paths) => [`--files=${paths.join(',')}`]

test('UTEST-024: changing only the question set passes', () => {
  const { code, stdout } = run(FF002, files('plugin/instructions/questions.md'))
  assert.equal(code, 0)
  assert.match(stdout, /question set:  1/)
  assert.match(stdout, /blueprints:    0/)
})

test('UTEST-024: changing only blueprints passes, however many', () => {
  const { code, stdout } = run(
    FF002,
    files(
      'plugin/blueprints/01-docs/01-intent/intent.md',
      'plugin/blueprints/01-docs/02-requirements/requirements.md',
      'plugin/blueprints/03-tests/01-plan/test-plan.md'
    )
  )
  assert.equal(code, 0, 'a packaging change touching many blueprints is normal and allowed')
  assert.match(stdout, /blueprints:    3/)
})

test('UTEST-024: changing only the orchestration modules passes', () => {
  const { code } = run(FF002, files('plugin/instructions/intake.md', 'plugin/commands/spec-intake.md'))
  assert.equal(code, 0, 'intake.md and the command are the same module; they may move together')
})

test('UTEST-024: the question set and the orchestration may change together', () => {
  // REQ-NF-005 names one boundary — blueprints against interview logic. Questions and
  // orchestration are both interview logic, and FF-002 must not invent a rule nobody wrote.
  const { code } = run(FF002, files('plugin/instructions/questions.md', 'plugin/instructions/intake.md'))
  assert.equal(code, 0)
})

test('UTEST-024: a commit touching neither module passes', () => {
  const { code, stdout } = run(FF002, files('README.md', 'ci/ff-002-module-independence.mjs'))
  assert.equal(code, 0)
  assert.match(stdout, /files changed: 2/)
})
