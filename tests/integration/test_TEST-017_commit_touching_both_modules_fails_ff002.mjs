// TEST-017 — "One commit touching both modules → FF-002 fails."
// Requirement: REQ-NF-005, ADR-001.
//
// Integration rather than unit, because the unit of the rule is a COMMIT. "These two changes
// could have been made separately" is only provable by them having been, so this drives the
// check through real git history rather than a hand-supplied file list.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { check, run, gitRepo } from '../_helpers.mjs'

const FF002 = check('ff-002-module-independence.mjs')

const QUESTION = 'plugin/instructions/questions.md'
const BLUEPRINT = 'plugin/blueprints/01-docs/01-intent/intent.md'
const ORCHESTRATION = 'plugin/instructions/intake.md'

/** A repo with one baseline commit containing all three files. */
function seeded() {
  const repo = gitRepo()
  repo.write(QUESTION, '# Questions\n\nRound 1.\n')
  repo.write(BLUEPRINT, '# Intent\n\nTemplate.\n')
  repo.write(ORCHESTRATION, '# Intake\n\nStep 1.\n')
  repo.commit('baseline')
  return repo
}

test('TEST-017: one commit changing a blueprint AND the question set fails FF-002', () => {
  const repo = seeded()
  try {
    repo.write(QUESTION, '# Questions\n\nRound 1, reworded.\n')
    repo.write(BLUEPRINT, '# Intent\n\nTemplate, restructured.\n')
    repo.commit('change both modules at once')

    const { code, stdout } = run(FF002, [`--repo=${repo.dir}`, '--range=HEAD~1...HEAD'])
    assert.notEqual(code, 0, 'FF-002 must block a commit that couples the two modules')
    assert.match(stdout, /VIOLATION: one commit changed a blueprint AND the interview logic/)
    assert.match(stdout, /Split the commit/)
  } finally {
    repo.cleanup()
  }
})

test('TEST-017: one commit changing a blueprint AND the orchestration fails FF-002', () => {
  const repo = seeded()
  try {
    repo.write(BLUEPRINT, '# Intent\n\nSection added.\n')
    repo.write(ORCHESTRATION, '# Intake\n\nStep 1. Step 2 reads the new section.\n')
    repo.commit('teach intake about a blueprint section')

    const { code } = run(FF002, [`--repo=${repo.dir}`, '--range=HEAD~1...HEAD'])
    assert.notEqual(code, 0, 'the instruction set knowing a blueprint internal is the coupling REQ-NF-005 forbids')
  } finally {
    repo.cleanup()
  }
})

test('TEST-017: the same two changes in two commits pass', () => {
  const repo = seeded()
  try {
    repo.write(QUESTION, '# Questions\n\nRound 1, reworded.\n')
    repo.commit('reword a question')
    const afterFirst = run(FF002, [`--repo=${repo.dir}`, '--range=HEAD~1...HEAD'])
    assert.equal(afterFirst.code, 0, 'a question-only commit is allowed')

    repo.write(BLUEPRINT, '# Intent\n\nTemplate, restructured.\n')
    repo.commit('restructure a blueprint')
    const afterSecond = run(FF002, [`--repo=${repo.dir}`, '--range=HEAD~1...HEAD'])
    assert.equal(afterSecond.code, 0, 'a blueprint-only commit is allowed')

    // The distinction FF-002 exists to draw: identical content, separable history.
    const both = run(FF002, [`--repo=${repo.dir}`, '--range=HEAD~2...HEAD'])
    assert.notEqual(both.code, 0, 'a range spanning both is coupled again, and must fail')
  } finally {
    repo.cleanup()
  }
})
