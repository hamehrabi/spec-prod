// UTEST-030 — "All match / one unlisted → proceed / stop."
// FTEST-020 — "Altered or missing blueprint → named failure; no file written."
// Requirement: REQ-F-042, ADR-001, SEC-Z-004.
//
// Three failures, and the check must tell them apart. "Integrity failed" sends a developer
// looking for the wrong thing: altered means reinstall, unlisted means someone added a file
// without regenerating, missing means the install is incomplete. One message for three
// causes is a message that helps with none of them.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { writeFileSync, rmSync, appendFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { check, run, payloadCopy } from '../_helpers.mjs'

const FF017 = check('ff-017-blueprint-integrity.mjs')
const A_BLUEPRINT = '01-docs/01-intent/intent.md'

/** A throwaway copy of the payload, with its blueprint library as the check's root. */
function library() {
  const { root, cleanup } = payloadCopy()
  return { dir: join(root, 'blueprints'), cleanup }
}

test('UTEST-030: an intact library passes', () => {
  const lib = library()
  try {
    const { code, stdout } = run(FF017, [`--root=${lib.dir}`])
    assert.equal(code, 0)
    assert.match(stdout, /listed: 79 · on disk: 79/)
  } finally {
    lib.cleanup()
  }
})

test('FTEST-020: ALTERED — one byte changed stops the run and names the file', () => {
  const lib = library()
  try {
    const target = join(lib.dir, A_BLUEPRINT)
    appendFileSync(target, ' ') // a single trailing space
    const { code, stdout } = run(FF017, [`--root=${lib.dir}`])
    assert.notEqual(code, 0, 'a near match is still a mismatch — never proceed on close enough')
    assert.match(stdout, new RegExp(`VIOLATION: ALTERED — ${A_BLUEPRINT.replace(/[/.]/g, '\\$&')}`))
    assert.match(stdout, /Nothing was written/)
  } finally {
    lib.cleanup()
  }
})

test('FTEST-020: MISSING — a listed blueprint absent from disk stops the run and names it', () => {
  const lib = library()
  try {
    rmSync(join(lib.dir, A_BLUEPRINT))
    const { code, stdout } = run(FF017, [`--root=${lib.dir}`])
    assert.notEqual(code, 0)
    assert.match(stdout, /VIOLATION: MISSING —/)
    assert.match(stdout, new RegExp(A_BLUEPRINT.replace(/[/.]/g, '\\$&')))
  } finally {
    lib.cleanup()
  }
})

test('UTEST-030: UNLISTED — a blueprint absent from the manifest stops the run', () => {
  const lib = library()
  try {
    writeFileSync(join(lib.dir, 'smuggled.md'), '# Not in the manifest\n')
    const { code, stdout } = run(FF017, [`--root=${lib.dir}`])
    assert.notEqual(code, 0, 'a silent addition is as bad as a silent alteration')
    assert.match(stdout, /VIOLATION: UNLISTED — smuggled\.md/)
  } finally {
    lib.cleanup()
  }
})

test('UTEST-030: the three failures are reported separately, not as one', () => {
  const lib = library()
  try {
    appendFileSync(join(lib.dir, A_BLUEPRINT), ' ')
    rmSync(join(lib.dir, '01-docs/02-requirements/requirements.md'))
    writeFileSync(join(lib.dir, 'smuggled.md'), '# Not in the manifest\n')
    const { code, stdout } = run(FF017, [`--root=${lib.dir}`])
    assert.notEqual(code, 0)
    assert.match(stdout, /ALTERED/)
    assert.match(stdout, /MISSING/)
    assert.match(stdout, /UNLISTED/)
    assert.match(stdout, /found:\s+3/)
  } finally {
    lib.cleanup()
  }
})

test('UTEST-030: a library with no manifest fails — unverifiable is not the same as fine', () => {
  const lib = library()
  try {
    rmSync(join(lib.dir, 'MANIFEST.md'))
    const { code, stdout } = run(FF017, [`--root=${lib.dir}`])
    assert.notEqual(code, 0, 'absence of the control must not read as absence of a problem')
    assert.match(stdout, /the library is unverifiable/)
  } finally {
    lib.cleanup()
  }
})

test('UTEST-030: the manifest does not checksum itself', () => {
  const lib = library()
  try {
    // A self-referential entry could never match, and would make the control permanently red.
    assert.doesNotMatch(readFileSync(join(lib.dir, 'MANIFEST.md'), 'utf8'), /\|\s*`MANIFEST\.md`\s*\|/)
  } finally {
    lib.cleanup()
  }
})

test('UTEST-030: deliberate exclusions are listed with reasons', () => {
  const lib = library()
  try {
    const manifest = readFileSync(join(lib.dir, 'MANIFEST.md'), 'utf8')
    assert.match(manifest, /## Deliberately not packaged/)
    assert.match(manifest, /MASTER-PROMPT\.md.*ADR-001 forbids it/)
    assert.match(manifest, /\.gitignore.*DD-020/)
  } finally {
    lib.cleanup()
  }
})
