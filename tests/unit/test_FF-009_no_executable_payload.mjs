// FF-009 — the two scenarios TASK-002's test table names without giving them an ID:
//   "Add a package.json to the payload"  -> FF-009 fails
//   "Add a script under ci/"             -> FF-009 passes, because ci/ is not payload
// Requirement: ADR-002.
//
// That second row is the one that matters. ADR-002 governs what is SHIPPED, not what checks
// it, and a check that could not tell the difference would make the CI scripts illegal.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { check, run, payloadCopy, REPO } from '../_helpers.mjs'

const FF009 = check('ff-009-no-executable-payload.mjs')

test('FF-009: a package manifest in the payload fails', () => {
  const { root, cleanup } = payloadCopy()
  try {
    writeFileSync(join(root, 'package.json'), '{"name":"spec-driven-devkit"}\n')
    const { code, stdout } = run(FF009, [root])
    assert.notEqual(code, 0)
    assert.match(stdout, /VIOLATION: .*package\.json is neither Markdown nor/)
  } finally {
    cleanup()
  }
})

test('FF-009: a script in the payload fails', () => {
  const { root, cleanup } = payloadCopy()
  try {
    mkdirSync(join(root, 'scripts'), { recursive: true })
    writeFileSync(join(root, 'scripts', 'validate.mjs'), 'console.log("helpful")\n')
    const { code, stdout } = run(FF009, [root])
    assert.notEqual(code, 0, 'the useful little script is exactly what ADR-002 forbids')
    assert.match(stdout, /validate\.mjs/)
  } finally {
    cleanup()
  }
})

test('FF-009: a lockfile in the payload fails', () => {
  const { root, cleanup } = payloadCopy()
  try {
    writeFileSync(join(root, 'package-lock.json'), '{}\n')
    const { code } = run(FF009, [root])
    assert.notEqual(code, 0)
  } finally {
    cleanup()
  }
})

test('FF-009: a check script under ci/ passes — ci/ is not payload', () => {
  // The real repository already has three scripts under ci/. If FF-009 counted them, this
  // task would have made ADR-002 unenforceable the moment it started enforcing it.
  const { code, stdout } = run(FF009, [], REPO)
  assert.equal(code, 0)
  assert.match(stdout, /not payload \(excluded by path\): ci, \.github, tests/)
})

test('FF-009: a checks directory INSIDE the payload fails', () => {
  const { root, cleanup } = payloadCopy()
  try {
    mkdirSync(join(root, 'ci'), { recursive: true })
    writeFileSync(join(root, 'ci', 'check.mjs'), 'process.exit(0)\n')
    const { code, stdout } = run(FF009, [root])
    assert.notEqual(code, 0, 'the exclusion is by path, so moving a script inside must not launder it')
    assert.match(stdout, /must not ship/)
  } finally {
    cleanup()
  }
})

test('FF-009: the shipped payload passes today', () => {
  const { code, stdout } = run(FF009, [], REPO)
  assert.equal(code, 0)
  // Assert the property, not the count. An exact file count is incidental — it changed the
  // moment TASK-003 packaged the blueprints, and a test that has to be edited every time the
  // payload grows is measuring the wrong thing.
  assert.match(stdout, /found:\s+0/)
  assert.match(stdout, /payload root: plugin\//)
})
