// UTEST-019 — path variants including traversal and prefix collision.
// STEST-003 — path traversal rejected despite the `spec/` prefix.
// STEST-013 — a blocked write names the path only, never the file's contents.
// Requirement: REQ-F-024, SEC-Z-001, BR-008.
//
// security-tests.md calls STEST-003 the sharpest test in the project, and says why:
//
//   "the obvious implementation is a string prefix check, and a prefix check accepts BOTH
//    'spec/../../etc/hosts' and 'specimen/x.md'. Normalise, then compare as a path, not as
//    a string. One line of ordering; the whole boundary."
//
// Both of those live in the table below, adjacent, so neither can be fixed by breaking the
// other.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { verdict, refusal, PROTECTED } from '../../ci/boundary.mjs'

// Every case named in security-tests.md STEST-003, plus the ones a prefix check gets wrong.
const CASES = [
  // destination                        allowed  reason        why it is here
  ['spec/01-docs/intent.md',            true,   'inside',     'the ordinary case'],
  ['spec/',                             true,   'inside',     'the workspace root itself'],
  ['spec',                              true,   'inside',     'the root without a trailing slash'],
  ['spec/../spec/01-docs/x.md',         true,   'inside',     'normalises back inside — allowed'],
  ['spec/a/../b/c.md',                  true,   'inside',     'interior traversal that stays contained'],
  ['./spec/01-docs/x.md',               true,   'inside',     'a leading ./ is noise, not meaning'],

  ['spec/../../etc/hosts',              false,  'traversal',  'STEST-003 — starts with spec/ and is not inside it'],
  ['spec/../README.md',                 false,  'traversal',  'one level out is still out'],
  ['specimen/x.md',                     false,  'outside',    'prefix match is not containment'],
  ['spectacular/x.md',                  false,  'outside',    'the same trap, less obviously'],
  ['/etc/hosts',                        false,  'absolute',   'absolute — never the kit\'s to write'],
  ['C:/Windows/System32/drivers/etc/hosts', false, 'absolute', 'the Windows form of the same'],
  ['\\\\server\\share\\x.md',           false,  'absolute',   'a UNC path is absolute too'],
  ['../outside.md',                     false,  'traversal',  'escaping above the repository root'],
  ['README.md',                         false,  'outside',    'the repository root is not the kit\'s'],
  ['04-src/app.js',                     false,  'outside',    'the developer\'s own source tree'],
  ['',                                  false,  'outside',    'an empty destination is not a permissive one'],
]

for (const [destination, allowed, reason, why] of CASES) {
  test(`UTEST-019: ${JSON.stringify(destination)} → ${allowed ? 'ALLOWED' : 'rejected'} (${why})`, () => {
    const v = verdict(destination)
    assert.equal(v.allowed, allowed)
    assert.equal(v.reason, reason)
  })
}

test('STEST-003: the two a prefix check gets wrong are decided oppositely', () => {
  // If someone ever replaces the segment comparison with startsWith('spec/'), exactly one of
  // these flips — and this assertion is the one that says so.
  assert.equal(verdict('spec/../../etc/hosts').allowed, false)
  assert.equal(verdict('specimen/x.md').allowed, false)
  assert.equal(verdict('spec/../spec/01-docs/x.md').allowed, true)
})

test('STEST-013: a refusal names the path and never the file contents', () => {
  const message = refusal('../../home/dev/.ssh/id_rsa')
  assert.match(message, /id_rsa/, 'the path is named, so the developer knows what was blocked')
  assert.match(message, /Nothing was written/)
  // The check never opens the target, so it has nothing to leak — asserted rather than assumed.
  assert.doesNotMatch(message, /BEGIN|PRIVATE KEY|contents/i)
})

test('STEST-007 / STEST-008: the protected files are never proposed, not merely refused', () => {
  for (const file of PROTECTED) {
    const v = verdict(file)
    assert.equal(v.allowed, false)
    assert.equal(v.reason, 'protected', `${file} must be distinguishable from an ordinary outside path`)
    // The distinction is the point: "outside" asks the developer, "protected" never asks.
    assert.match(refusal(file), /never proposed — not even with permission/)
    assert.doesNotMatch(refusal(file), /may I write it\?/)
  }
})

test('STEST-007 / STEST-008: a CLAUDE.md INSIDE spec/ is the kit\'s own and is allowed', () => {
  // DD-011: the kit writes its entry point inside spec/ and prints the line to add. Blocking
  // that would block the product's own output, which is why the protection is root-only.
  assert.equal(verdict('spec/CLAUDE.md').allowed, true)
  assert.equal(verdict('spec/.gitignore').allowed, true)
})

test('UTEST-019: the same verdict on Windows and POSIX separators', () => {
  // CON-004. A backslash path handed to a Linux run must not reach a different answer.
  assert.equal(verdict('spec\\01-docs\\intent.md').allowed, true)
  assert.equal(verdict('spec\\..\\..\\etc\\hosts').allowed, false)
  assert.equal(verdict('spec/01-docs/intent.md').reason, verdict('spec\\01-docs\\intent.md').reason)
})
