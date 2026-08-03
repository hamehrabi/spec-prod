// UTEST-013 — "Add a second command → FF-001 fails."
// Requirement: ADR-001, DD-006, the Simplicity driver's one-command measure.
//
// The negative case is the point. A check that has only ever been seen to pass is untested,
// so this asserts the failure first and the pass second.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { check, run, payloadCopy } from '../_helpers.mjs'

const FF001 = check('ff-001-single-command.mjs')

test('UTEST-013: a second command file makes FF-001 fail', () => {
  const { root, cleanup } = payloadCopy()
  try {
    writeFileSync(
      join(root, 'commands', 'spec-intake-express.md'),
      '---\ndescription: a second way in\n---\n\nRead instructions/intake.md.\n'
    )
    const { code, stdout } = run(FF001, [root])
    assert.notEqual(code, 0, 'FF-001 must exit non-zero when two commands are registered')
    assert.match(stdout, /2 user-invocable commands/)
    assert.match(stdout, /RESULT: FAIL/)
  } finally {
    cleanup()
  }
})

test('UTEST-013: a second command added as a skill also makes FF-001 fail', () => {
  const { root, cleanup } = payloadCopy()
  try {
    mkdirSync(join(root, 'skills', 'quick-spec'), { recursive: true })
    writeFileSync(
      join(root, 'skills', 'quick-spec', 'SKILL.md'),
      '---\nname: quick-spec\ndescription: a second entry point wearing a different hat\n---\n'
    )
    const { code } = run(FF001, [root])
    assert.notEqual(code, 0, 'a skill registers a /name just as a command does; it must count')
  } finally {
    cleanup()
  }
})

test('UTEST-013: a second command hidden from the menu still counts as a path', () => {
  const { root, cleanup } = payloadCopy()
  try {
    writeFileSync(
      join(root, 'commands', 'spec-intake-internal.md'),
      '---\ndescription: internal\nuser-invocable: false\n---\n\nRead instructions/other.md.\n'
    )
    const { code, stdout } = run(FF001, [root])
    // Not user-invocable, so the command count stays at 1 — but it references a SECOND
    // orchestration entry point, which is the other half of FF-001's threshold.
    assert.notEqual(code, 0, 'a second end-to-end path must fail even when its command is hidden')
    assert.match(stdout, /orchestration entry points/)
  } finally {
    cleanup()
  }
})

test('UTEST-013: the shipped payload passes with exactly one command', () => {
  const { root, cleanup } = payloadCopy()
  try {
    const { code, stdout } = run(FF001, [root])
    assert.equal(code, 0, 'the real payload must satisfy FF-001')
    assert.match(stdout, /user-invocable: 1/)
  } finally {
    cleanup()
  }
})
