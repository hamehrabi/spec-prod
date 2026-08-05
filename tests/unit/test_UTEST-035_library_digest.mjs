// UTEST-035 — one digest for the whole library, and the shell can reproduce it.
// Requirement: FF-017 · REQ-F-042 · REQ-NF-001 · REQ-NF-008.
//
// A traced run spent nine minutes on the integrity check and only five of them hashing. It had
// all 81 digests at 5m27s, then spent four and a half minutes trying to get a shell to compare
// them — because eyeballing 81 SHA-256 strings for one flipped character is not something
// anyone should trust, and the model was right not to. The check asked for a comparison no one
// can do by hand and offered no permitted way to do it by machine.
//
// This makes the comparison one string long. Which only helps if two different things can
// arrive at the same string — so the test that matters most here is the last one, where a shell
// pipeline has to reproduce what Node computed. A digest only Node can produce would move the
// nine minutes rather than remove them.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { libraryDigest, declaredDigest } from '../../ci/ff-017-blueprint-integrity.mjs'

const MANIFEST = readFileSync('plugin/blueprints/MANIFEST.md', 'utf8')
const perFile = [...MANIFEST.matchAll(/^\|\s*`[^`]+`\s*\|\s*`([0-9a-f]{64})`\s*\|/gm)].map((m) => m[1])

const hex = (s) => createHash('sha256').update(s, 'utf8').digest('hex')

test('UTEST-035: the manifest declares one digest, and it covers what is listed', () => {
  const declared = declaredDigest(MANIFEST)
  assert.match(declared ?? '', /^[0-9a-f]{64}$/, 'no library digest is declared')
  assert.equal(declared, libraryDigest(perFile))
  assert.equal(perFile.length, 81)
})

test('UTEST-035: the digest is over digests only — not paths, not tool output', () => {
  // Paths are what make two platforms disagree: a separator, a leading `./`, an enumeration
  // order. Hashing only the digests removes every one of those from the question.
  assert.equal(libraryDigest(['bb', 'aa']), hex('aa\nbb\n'))
})

test('UTEST-035: case and order of the input do not change the result', () => {
  // `sha256sum` prints lowercase and `Get-FileHash` prints uppercase. If that changed the
  // answer, the digest would be a per-platform value pretending to be a shared one.
  const digests = perFile.slice(0, 20)
  assert.equal(libraryDigest(digests.map((d) => d.toUpperCase())), libraryDigest(digests))
  assert.equal(libraryDigest([...digests].reverse()), libraryDigest(digests))
})

test('UTEST-035: one altered blueprint changes the digest', () => {
  // The whole point. A control that returns the same value for a changed library is decoration.
  const flipped = [...perFile]
  flipped[7] = flipped[7].replace(/^./, (c) => (c === 'a' ? 'b' : 'a'))
  assert.notEqual(libraryDigest(flipped), libraryDigest(perFile))
})

test('UTEST-035: a missing blueprint changes the digest', () => {
  assert.notEqual(libraryDigest(perFile.slice(1)), libraryDigest(perFile))
})

test('UTEST-035: an absent digest is read as absent, not as empty', () => {
  assert.equal(declaredDigest('# Manifest\n\nno digest here\n'), null)
  // A near-miss must not parse. A 63-character value is a corrupted line, and reading it as a
  // digest would compare something against nothing and call the difference a failure.
  assert.equal(declaredDigest('**Library digest:** `' + 'a'.repeat(63) + '`'), null)
})

test('UTEST-035: a shell pipeline reproduces exactly what Node computed', () => {
  // THE TEST THIS FILE EXISTS FOR. `integrity.md` gives a run this command; if it produced a
  // different value the run would report a healthy library as altered, and the fast path would
  // be worse than the slow one it replaced.
  const command =
    'sha256sum *.md */*.md */*/*.md */*/*/*.md | grep -v MANIFEST | cut -c1-64 | sort | sha256sum'
  let out
  try {
    out = execFileSync('bash', ['-c', command], { cwd: 'plugin/blueprints', encoding: 'utf8' })
  } catch {
    // No POSIX shell here. Say so rather than passing — an unrun check reported as a pass is
    // the failure this whole product is about (BR-009).
    assert.fail('bash is unavailable, so the documented command could not be verified')
  }
  assert.equal(out.trim().split(/\s+/)[0], declaredDigest(MANIFEST))
})
