// UTEST-071 — a drive-rooted path is absolute, and a state file is still a state file inside a
// state directory.
// Requirement: CON-004 · REQ-NF-008 · ADR-004 · ADR-006 · STEST-004.
//
// WHY, part one. `isAbsolute` knew `/`, `C:` and the two-backslash UNC form. It did not know a
// SINGLE leading backslash — which on Windows is drive-rooted: `\spec\a.md` resolves to
// `C:\spec\a.md`, the drive root, outside the repository entirely. `normalise()` then replaced
// the backslashes, dropped the empty leading segment, and returned `{allowed: true, reason:
// 'inside'}`. This repository is developed on Windows, so it is live rather than theoretical.
//
// The softer half of the same gap: `\etc\hosts` returned `outside` — "may I write it?" — while
// `/etc/hosts` returned `absolute` — "nothing was written". Two absolute paths, three verdicts,
// decided by which separator was typed, in a function whose own comment claims CON-004 parity.
// The UTEST-019 case table covered `/etc/hosts`, `C:/…` and the UNC form, and not this one.
//
// WHY, part two. `FORBIDDEN_DIR` closes the evasion where the incriminating part of a state file
// is a path segment rather than the basename — and `kit`, `intake` and `accepted` were present
// in the filename branch and absent from the directory one. So `spec/.kit` was caught and
// `spec/.kit/rounds.json` was not. The guard refused the marker as a file and waved it through
// the moment it became a directory. ADR-004 is a fixed `spec/` folder and no state file
// anywhere, ever; `spec/.kit` is the path `boundary.md` names as what the product refuses to
// create.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { verdict, refusal } from '../../ci/boundary.mjs'
import { forbiddenStateFiles } from '../../ci/acceptance.mjs'

// --- A path is absolute on every platform, or the verdicts differ by platform -------------------

test('UTEST-071: a single leading backslash is absolute, not inside spec/', () => {
  const v = verdict('\\spec\\a.md')
  assert.equal(v.allowed, false, 'the drive root is not inside the repository')
  assert.equal(v.reason, 'absolute')
})

test('UTEST-071: the same path reaches the same verdict whichever separator names it', () => {
  // CON-004. A Windows path handed to a Linux run, and the reverse, must agree.
  for (const [posix, windows] of [
    ['/etc/hosts', '\\etc\\hosts'],
    ['/spec/a.md', '\\spec\\a.md'],
  ]) {
    assert.equal(verdict(windows).reason, verdict(posix).reason, `${windows} must match ${posix}`)
  }
})

test('UTEST-071: an absolute path is refused outright, never offered for approval', () => {
  // The two refusals are different acts: `absolute` says nothing was written, `outside` asks.
  assert.match(refusal('\\etc\\hosts'), /Nothing was written/)
  assert.doesNotMatch(refusal('\\etc\\hosts'), /may I write it/)
})

test('UTEST-071: the forms that already worked still work, and a relative path is untouched', () => {
  for (const p of ['/etc/hosts', 'C:/Users/x/notes.md', 'C:\\Users\\x\\notes.md', '\\\\server\\share\\x.md'])
    assert.equal(verdict(p).reason, 'absolute', p)
  assert.equal(verdict('spec/01-docs/intent.md').reason, 'inside')
  assert.equal(verdict('spec\\01-docs\\intent.md').reason, 'inside', 'a relative Windows path is still relative')
})

// --- A state directory is a state directory -----------------------------------------------------

test('UTEST-071: a state file inside a state directory is caught', () => {
  for (const p of ['spec/.kit/rounds.json', 'spec/.accepted/round-1.json', 'spec/intake/session.md'])
    assert.deepEqual(forbiddenStateFiles([p]), [p], `${p} is a state file`)
})

test('UTEST-071: the marker as a bare file is still caught — nothing was traded away', () => {
  assert.deepEqual(forbiddenStateFiles(['spec/.kit']), ['spec/.kit'])
  assert.deepEqual(forbiddenStateFiles(['spec/.accepted.json']), ['spec/.accepted.json'])
})

test('UTEST-071: the real workspace layout is not swept up', () => {
  // A rule broad enough to catch everything catches the specification too, and then it gets
  // switched off. None of these is a state file.
  const real = [
    'spec/README.md',
    'spec/CLAUDE.md',
    'spec/01-docs/01-intent/intent.md',
    'spec/01-docs/09-change-control/spec-change-log.md',
    'spec/02-tasks/task-list.md',
    'spec/06-agent/01-instructions/AGENT.md',
    'spec/.gitignore',
    'spec/.env.example',
  ]
  assert.deepEqual(forbiddenStateFiles(real), [])
})
