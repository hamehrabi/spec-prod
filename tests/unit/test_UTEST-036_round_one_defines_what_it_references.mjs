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
const INTAKE = readFileSync('plugin/instructions/intake.md', 'utf8')

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
  // The general statement of BUG-010 and BUG-023 together.
  //
  // THE LIST IS DERIVED, NOT TYPED. It used to be two literals — the same two the two tests
  // above already assert individually — under a comment promising "if a third such file is
  // ever added, this fails". It could not: nothing here read the instructions. The files every
  // round writes to are the ones intake.md and review.md name for the per-round gate, so ask
  // those.
  const shared = [...new Set([...INTAKE.matchAll(/spec\/(01-docs\/[\w-]+\/[\w-]+\.md)/g)].map((m) => m[1]))]
  assert.ok(shared.length > 0, 'intake.md must name where the per-round row goes, or this test asserts nothing')
  for (const path of shared) {
    assert.equal(ownerOf(path), 1, `${path} is written during every round's gate, so Round 1 must create it`)
  }
})

test('UTEST-036: no file is owned by two rounds', () => {
  // Two owners means a file written twice; the second write silently discards the first.
  //
  // THIS COMPARED ENTRY STRINGS, AND `ownerOf` MATCHES BY PREFIX. So `01-docs/01-intent/`
  // given to Round 2 and `01-docs/01-intent/intent.md` given to Round 1 are different strings,
  // collided on nothing, and Round 2 silently took three of Round 1's files — the exact harm
  // the comment names. Compare by what the entries actually cover.
  const owns = (entry, path) => (/[/-]$/.test(entry) ? path.startsWith(entry) : path === entry)
  const entries = [...MAP].flatMap(([round, paths]) => paths.map((p) => ({ round, p })))
  for (const a of entries) {
    const overlapping = entries.filter((b) => b.round !== a.round && (owns(a.p, b.p) || owns(b.p, a.p)))
    assert.deepEqual(
      overlapping.map((b) => `round ${b.round}: ${b.p}`),
      [],
      `round ${a.round} owns ${a.p}, which overlaps another round's entry`
    )
  }
})

test('UTEST-036: the reason is recorded, not just the placement', () => {
  // A map entry with no argument behind it gets moved back by whoever next reads the directory
  // number and thinks it looks misfiled. That is exactly how BUG-010 happened.
  // BOUNDED TO THE SECTION. This used to slice to end of file — a hundred lines covering five
  // other headings — so `BUG-023`, `check 1` and the length floor were all measured against
  // the rest of the document. Deleting the whole justification and leaving the heading behind
  // would have passed.
  const from = COVERAGE.indexOf('### Open questions belong to Round 1')
  assert.notEqual(from, -1, 'the section must exist before anything can be said about it')
  const to = COVERAGE.indexOf('\n### ', from + 1)
  const section = COVERAGE.slice(from, to === -1 ? undefined : to)
  assert.match(section, /BUG-023/)
  assert.match(section, /check 1/)
  assert.ok(section.length > 400, `the placement is stated but not argued: the section is ${section.length} characters`)
})
