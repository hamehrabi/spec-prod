// STEST-005 — `spec/` exists holding unrelated files → stop before ANY write, offer an
// alternative, leave `spec/` byte-for-byte unchanged.
// FTEST-007 — the WORKSPACE_COLLISION failure state.
// Requirement: REQ-F-036, AC-034.
//
// The recognition has to be derived from the artifacts. A marker file would be easier and is
// forbidden: `spec/.kit` is precisely the state file ADR-004 rules out, and it would be wrong
// the first time someone copied a workspace without it.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { looksLikeKitWorkspace, alternativeName } from '../../ci/boundary.mjs'

test('STEST-005: a folder of unrelated files is not a kit workspace', () => {
  const openapi = ['openapi.yaml', 'components.yaml', 'paths', 'README.md']
  assert.equal(looksLikeKitWorkspace(openapi), false, 'the exact scenario security-tests.md names')
})

test('STEST-005: a real workspace is recognised by its stage folders', () => {
  const workspace = ['01-docs', '02-tasks', '03-tests', '04-src', '05-review', '06-agent', '07-ops', 'CLAUDE.md']
  assert.equal(looksLikeKitWorkspace(workspace), true)
})

test('STEST-005: a partial workspace is still ours — resume must not read as collision', () => {
  // An intake interrupted after round one has two stage folders and no entry point. Treating
  // that as someone else's folder would make every interrupted run unresumable.
  assert.equal(looksLikeKitWorkspace(['01-docs', '02-tasks']), true)
})

test('STEST-005: an empty folder is somewhere to write, not a collision', () => {
  assert.equal(looksLikeKitWorkspace([]), true)
})

test('STEST-005: one lookalike folder is not enough to claim the workspace', () => {
  // A single `01-something` in an unrelated project must not be mistaken for ours.
  assert.equal(looksLikeKitWorkspace(['01-drafts', 'notes.txt']), false)
})

test('FTEST-007: the alternative offered never collides with what is already there', () => {
  assert.equal(alternativeName(['spec']), 'spec-2')
  assert.equal(alternativeName(['spec', 'spec-2']), 'spec-3')
  assert.equal(alternativeName(['spec', 'spec-2', 'spec-3']), 'spec-4')
})

test('FTEST-007: the alternative is offered, never applied to the developer\'s folder', () => {
  // The function names a NEW folder. Nothing here renames or moves anything the developer
  // owns — the kit offers, and the developer decides.
  const suggested = alternativeName(['spec'])
  assert.notEqual(suggested, 'spec', 'never propose reusing the occupied name')
  assert.match(suggested, /^spec-\d+$/)
})
