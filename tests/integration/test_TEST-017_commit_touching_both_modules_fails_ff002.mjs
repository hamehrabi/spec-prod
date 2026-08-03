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
  repo.base = repo.git('rev-parse', 'HEAD').trim()
  return repo
}

const since = (repo) => [`--repo=${repo.dir}`, `--range=${repo.base}..HEAD`]

test('TEST-017: one commit changing a blueprint AND the question set fails FF-002', () => {
  const repo = seeded()
  try {
    repo.write(QUESTION, '# Questions\n\nRound 1, reworded.\n')
    repo.write(BLUEPRINT, '# Intent\n\nTemplate, restructured.\n')
    repo.commit('change both modules at once')

    const { code, stdout } = run(FF002, since(repo))
    assert.notEqual(code, 0, 'FF-002 must block a commit that couples the two modules')
    assert.match(stdout, /VIOLATION: this commit changed a blueprint AND the interview logic/)
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

    const { code } = run(FF002, since(repo))
    assert.notEqual(code, 0, 'the instruction set knowing a blueprint internal is the coupling REQ-NF-005 forbids')
  } finally {
    repo.cleanup()
  }
})

test('TEST-017: the same two changes, split into two commits, pass', () => {
  // BUG-002. FF-002 originally diffed the whole branch against its base, so two correctly
  // separated commits looked identical to one coupled commit — which made "split the
  // commit", the fix the check itself recommends, do nothing at all. The unit is a COMMIT.
  const repo = seeded()
  try {
    repo.write(QUESTION, '# Questions\n\nRound 1, reworded.\n')
    repo.commit('reword a question')
    repo.write(BLUEPRINT, '# Intent\n\nTemplate, restructured.\n')
    repo.commit('restructure a blueprint')

    const { code, stdout } = run(FF002, since(repo))
    assert.equal(code, 0, 'identical content, separable history — the distinction FF-002 exists to draw')
    assert.match(stdout, /commits examined: 2/)
  } finally {
    repo.cleanup()
  }
})

test('TEST-017: each commit is judged alone, so one bad commit still fails the range', () => {
  const repo = seeded()
  try {
    repo.write(QUESTION, '# Questions\n\nReworded.\n')
    repo.commit('reword a question')
    repo.write(BLUEPRINT, '# Intent\n\nRestructured.\n')
    repo.write(ORCHESTRATION, '# Intake\n\nCoupled.\n')
    repo.commit('couple them')

    const { code, stdout } = run(FF002, since(repo))
    assert.notEqual(code, 0, 'a clean earlier commit must not launder a coupled later one')
    assert.match(stdout, /commits examined: 2/)
    assert.equal(stdout.match(/VIOLATION/g).length, 1, 'exactly the offending commit is named')
  } finally {
    repo.cleanup()
  }
})

test('TEST-017: a merge commit is not itself a violation', () => {
  const repo = seeded()
  try {
    repo.git('checkout', '-q', '-b', 'side')
    repo.write(BLUEPRINT, '# Intent\n\nSide branch.\n')
    repo.commit('blueprint on a side branch')
    repo.git('checkout', '-q', 'main')
    repo.write(ORCHESTRATION, '# Intake\n\nMain branch.\n')
    repo.commit('orchestration on main')
    repo.git('merge', '--no-ff', '-q', 'side', '-m', 'merge side')

    const { code, stdout } = run(FF002, since(repo))
    // The merge's combined diff touches both modules, but it introduces no change of its
    // own. Counting it would fail every merge of two individually-legal branches.
    assert.equal(code, 0, 'a merge commit introduces no changes and must not be judged')
    assert.doesNotMatch(stdout, /VIOLATION/)
  } finally {
    repo.cleanup()
  }
})
