// UTEST-036 — a round that mints an identifier owns the file that defines it.
// Requirement: REQ-F-043 · BUG-010 · BUG-014 · BUG-023 · validation checks 1 and 6.
//
// BUG-023, and it was measured rather than reasoned about. A run driven to Round 1 and stopped
// produced four files referencing Q-001 through Q-005 and failed validation check 1 on all
// five: every one referenced, none defined, because `open-questions.md` — where a Q row is
// defined — belonged to Round 2.
//
// A run that stops at Round 1 is a normal ending (intake.md 2e), so the workspace it leaves has
// to stand up on its own. This is the third time the round map has owed something to a file it
// did not own: BUG-010 (the change log), BUG-016 (driving characteristics), and now this. The
// rule was already written down both times — "a file that every round writes to is created by
// the first round that writes to it" — and open-questions.md is the other such file.
//
// So this test is about the RULE, not one filename: for every file a round must write into, the
// round that first writes to it owns it.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const COVERAGE = readFileSync('plugin/instructions/coverage.md', 'utf8')

/** The round map, as `round -> the paths that round owns`. */
const MAP = new Map(
  [...COVERAGE.matchAll(/^\|\s*([1-8])\s*\|\s*(.+?)\s*\|\s*$/gm)].map((m) => [
    Number(m[1]),
    [...m[2].matchAll(/`([^`]+)`/g)].map((p) => p[1]),
  ])
)

const ownerOf = (path) => [...MAP.entries()].find(([, paths]) => paths.some((p) => path.startsWith(p)))?.[0] ?? null

test('UTEST-036: the round map parses into eight rounds', () => {
  assert.equal(MAP.size, 8, 'the map must still be machine-readable, or nothing below means anything')
})

test('UTEST-036: Round 1 owns the file that defines Q-### rows', () => {
  // The pair is the point. A [TODO] without its row fails check 6; a Q-### reference without a
  // definition fails check 1. Round 1 creates both halves or it creates a broken workspace.
  assert.equal(ownerOf('01-docs/01-intent/open-questions.md'), 1)
})

test('UTEST-036: Round 1 owns the file every round appends its acceptance to', () => {
  // BUG-010, held here so the two live by one rule rather than two exceptions.
  assert.equal(ownerOf('01-docs/09-change-control/spec-change-log.md'), 1)
})

test('UTEST-036: every file the whole run writes to is owned by Round 1', () => {
  // The general statement of BUG-010 and BUG-023 together. If a third such file is ever added,
  // this fails rather than waiting for a run to discover it.
  for (const shared of ['01-docs/01-intent/open-questions.md', '01-docs/09-change-control/spec-change-log.md'])
    assert.equal(ownerOf(shared), 1, `${shared} is written by every round, so Round 1 must create it`)
})

test('UTEST-036: no file is owned by two rounds', () => {
  // Two owners means a file written twice; the second write silently discards the first.
  const seen = new Map()
  for (const [round, paths] of MAP)
    for (const p of paths) {
      assert.ok(!seen.has(p), `${p} is owned by rounds ${seen.get(p)} and ${round}`)
      seen.set(p, round)
    }
})

test('UTEST-036: the reason is recorded, not just the placement', () => {
  // A map entry with no argument behind it gets moved back by whoever next reads the directory
  // number and thinks it looks misfiled. That is exactly how BUG-010 happened.
  const section = COVERAGE.slice(COVERAGE.indexOf('Open questions belong to Round 1'))
  assert.match(section, /BUG-023/)
  assert.match(section, /check 1/)
  assert.ok(section.length > 400, 'the placement is stated but not argued')
})
