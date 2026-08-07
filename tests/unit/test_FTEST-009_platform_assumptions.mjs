// FTEST-009 — the payload carries no assumption about which platform reads it.
// Requirement: REQ-NF-008 · CON-004 · TASK-018 · BUG-027.
//
// FTEST-009 has been "Planned" since the test plan was written. It names three failures — no
// POSIX-only path, no `/`-hardcoded link, no case-sensitivity assumption — and nothing checked
// any of them. Its sibling ETEST-012 (×3) needs the kit driven on three real hosts and stays
// Planned; this is the half that can be decided by reading.
//
// FF-018 passed with zero violations the first time it ran, across 99 payload files. That is
// exactly when a check deserves the least trust, and it is the shape this repository keeps
// getting wrong — eleven defects have been a check that matched nothing. So every violation
// class below is PROVED by construction: a payload that should fail is built, and the check is
// required to catch it. A class with no failing case is a class this check does not really have.
//
// The case-mismatch one is the reason the whole file exists. A link whose case is wrong opens
// perfectly on Windows and macOS and 404s on Linux — so it cannot be found by running the kit
// on the machine that wrote it, which is the machine it was written on. BUG-027 was the same
// shape: Step 0 shipped POSIX-only and nothing noticed, because the author had Git Bash.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { check, linksIn, caseCollisions, POSIX_PATH_EXEMPTIONS } from '../../ci/ff-018-platform-assumptions.mjs'

/** Build a throwaway payload and run FF-018 over it. */
function on(files) {
  const root = mkdtempSync(join(tmpdir(), 'ff018-'))
  try {
    for (const [rel, body] of Object.entries(files)) {
      const p = join(root, rel)
      mkdirSync(dirname(p), { recursive: true })
      writeFileSync(p, body, 'utf8')
    }
    return check(root)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}
const kinds = (r) => r.violations.map((v) => v.kind).sort()

test('FTEST-009: the real payload is clean', () => {
  // The claim this check exists to make. Asserted first so a later assertion failing tells you
  // the CHECK broke rather than the payload.
  const { files, violations } = check()
  assert.ok(files > 50, `only ${files} payload files read; the walk is not reaching the library`)
  assert.deepEqual(violations, [], violations.map((v) => `[${v.kind}] ${v.where}`).join('\n'))
})

test('FTEST-009: a case-wrong link is caught — the one that only fails on Linux', () => {
  // Works on Windows, works on macOS, 404s on Linux. Compared as text precisely so that the
  // platform running the check cannot hide it.
  const r = on({ 'a.md': 'see [b](Sub/File.md)\n', 'sub/file.md': '# b\n' })
  assert.deepEqual(kinds(r), ['case-mismatch'])
  assert.match(r.violations[0].detail, /the file on disk is/)
})

test('FTEST-009: a correctly-cased link is not caught', () => {
  // The other direction, and the one that decides whether this check survives contact. A check
  // that fires on correct work is switched off within a week, which is the same as no check.
  assert.deepEqual(on({ 'a.md': 'see [b](sub/file.md)\n', 'sub/file.md': '# b\n' }).violations, [])
})

test('FTEST-009: a backslash link is caught', () => {
  assert.deepEqual(kinds(on({ 'a.md': 'see [b](sub\\file.md)\n', 'sub/file.md': '# b\n' })), ['backslash-link'])
})

test('FTEST-009: two files differing only by case are caught', () => {
  // TESTED AS A LIST, NOT ON DISK, and that is the whole lesson of this case. Writing
  // `README.md` and `readme.md` on Windows creates ONE file — the second write replaces the
  // first — so the obvious version of this test built the failing case, found nothing, and
  // passed. On Linux it would have caught a real defect; on the machine this kit is developed
  // on it proved nothing. A check guarding against a case assumption must not contain one.
  assert.deepEqual(caseCollisions(['a/README.md', 'a/readme.md']).map((v) => v.kind), ['case-collision'])
  assert.match(caseCollisions(['a/README.md', 'a/readme.md'])[0].where, /README\.md vs a\/readme\.md/)
})

test('FTEST-009: paths differing by more than case are left alone', () => {
  assert.deepEqual(caseCollisions(['a/one.md', 'a/two.md', 'b/one.md']), [])
})

test('FTEST-009: a POSIX-only absolute path is caught', () => {
  for (const path of ['/usr/local/bin/thing', '/etc/config', '~/.config/x', '/tmp/scratch'])
    assert.ok(
      kinds(on({ 'a.md': `Write it to ${path} first.\n` })).includes('posix-only-path'),
      `${path} was not caught`
    )
})

test('FTEST-009: a path being DISCUSSED is not a path being used', () => {
  // boundary.md names `/etc/hosts` as a path the kit must REFUSE to write. Flagging that would
  // fail the file for correctly documenting the rule — the check must read backticked prose as
  // discussion, not instruction.
  assert.deepEqual(on({ 'a.md': 'Refuse to write `/etc/hosts`, and say why.\n' }).violations, [])
})

test('FTEST-009: exemptions are named files with written reasons, never patterns', () => {
  // A pattern exemption grows silently. Two files are exempt today and each says why in a
  // sentence a reader can disagree with.
  for (const [file, why] of Object.entries(POSIX_PATH_EXEMPTIONS)) {
    assert.match(file, /^plugin\//, 'an exemption names a payload file')
    assert.ok(why.length > 40, `the exemption for ${file} does not give a reason`)
  }
  assert.ok(Object.keys(POSIX_PATH_EXEMPTIONS).length <= 3, 'the exemption list is growing; each one is a platform the kit no longer serves')
})

test('FTEST-009: an external link is not treated as a file that must exist', () => {
  assert.deepEqual(on({ 'a.md': '[x](https://example.com/a.md) [y](#anchor) [z](mailto:a@b.c)\n' }).violations, [])
})

test('FTEST-009: linksIn reads links and ignores backticked prose', () => {
  // The distinction the whole check rests on: a link is a promise something is there, a
  // backticked path is a thing being talked about.
  assert.deepEqual(linksIn('see [a](one.md) and `two.md` and [b](three.md#x)'), ['one.md', 'three.md#x'])
})
