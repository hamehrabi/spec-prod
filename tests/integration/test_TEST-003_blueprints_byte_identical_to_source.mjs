// TEST-003 — "Compare packaged vs. source → byte-identical; appendix-index.md absent."
// Requirement: REQ-F-003, ADR-005 (a blueprint path is a contract), TASK-003.
//
// The packaging task's whole risk is a silent difference: a line ending normalised, a file
// quietly skipped, a path flattened. None of those announce themselves, and all of them
// surface much later as a generated workspace whose back-links point at nothing.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { REPO } from '../_helpers.mjs'
import { walk, toPosix } from '../../ci/payload.mjs'

const SOURCE = join(REPO, 'spec-driven-template')
const PACKAGED = join(REPO, 'plugin', 'blueprints')

const rel = (root, files) => files.map((f) => toPosix(f).slice(toPosix(root).length + 1))

// Deliberately excluded at packaging time. Each needs a reason, not just an absence.
const NOT_PACKAGED = {
  'MASTER-PROMPT.md': 'question text — ADR-001 forbids it inside the blueprint library',
  'steps.md': 'template documentation; no generated counterpart',
  '01-docs/10-reference/appendix-index.md': 'template scaffolding — TASK-003 step 5',
  'README.md': null, // IS packaged — the generated workspace README back-links to it
}

const sourceMarkdown = rel(SOURCE, walk(SOURCE)).filter((f) => f.endsWith('.md'))
const packaged = rel(PACKAGED, walk(PACKAGED))

test('TEST-003: every packaged blueprint is byte-identical to its source', () => {
  assert.ok(packaged.length > 0, 'the library must actually be packaged')
  const differing = packaged.filter(
    (f) => !readFileSync(join(SOURCE, f)).equals(readFileSync(join(PACKAGED, f)))
  )
  assert.deepEqual(differing, [], 'packaging must copy, never transform')
})

test('TEST-003: appendix-index.md is absent', () => {
  assert.equal(existsSync(join(PACKAGED, '01-docs/10-reference/appendix-index.md')), false)
})

test('TEST-003: MASTER-PROMPT.md is absent — ADR-001', () => {
  // The single biggest boundary violation available: the prototype's question text sitting
  // inside the read-only template library.
  assert.equal(existsSync(join(PACKAGED, 'MASTER-PROMPT.md')), false)
})

test('TEST-003: no Markdown blueprint was silently dropped', () => {
  const expected = sourceMarkdown.filter((f) => NOT_PACKAGED[f] === undefined || NOT_PACKAGED[f] === null)
  const missing = expected.filter((f) => !packaged.includes(f))
  assert.deepEqual(missing, [], 'a blueprint absent from the payload produces no file and no complaint')
})

test('TEST-003: folder depth is preserved exactly', () => {
  // Back-link arithmetic is computed from depth (UTEST-014). Flattening breaks every
  // generated file's final line, and does it silently.
  const depthOf = (f) => f.split('/').length
  for (const f of packaged) {
    assert.equal(depthOf(f), depthOf(f), 'path shape must survive the copy')
    assert.ok(existsSync(join(SOURCE, f)), `${f} must exist at the same path in the source`)
  }
})

test('TEST-003: nothing non-Markdown entered the library', () => {
  // The six non-Markdown template artifacts were deliberately dropped so ADR-002 and FF-009
  // stay literally true. This asserts the decision held.
  const nonMarkdown = packaged.filter((f) => !f.toLowerCase().endsWith('.md'))
  assert.deepEqual(nonMarkdown, [])
})
