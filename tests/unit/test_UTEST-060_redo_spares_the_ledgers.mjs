// UTEST-060 — a redo appends to the two ledgers; it never replaces them.
// Requirement: ADR-004 · ADR-006 · coverage.md "infrastructure for all eight rounds" · BUG-026.
//
// resume.md said "Replace files whole — never append", twice, with no exemption. Two of the
// files a redo can reach are not round artifacts at all: spec-change-log.md and
// open-questions.md are owned by Round 1 and written to by all eight. coverage.md already knew
// this and said so in those words; resume.md did not, and nothing reconciled them.
//
// ADR-004 is what makes it severe rather than untidy. There is no state file, so those rows ARE
// the state: the change log is the only record of which stages were accepted and which
// blueprints were skipped, and open-questions.md is the only place a Q-### is defined. A redo
// of Round 1 rewrites the log from its blueprint and deletes the acceptance rows of every round
// after it.
//
// And it is reached by an ordinary workspace. intake.md calls a declined file normal, and a
// declined file in Round 1 is exactly what leaves the stage partial. Rounds 2-5 accepted, Round
// 1 redone, five acceptance rows gone, four gates re-presented to someone who already answered
// them, and check 13 failing for coverage that was recorded.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const RESUME = readFileSync('plugin/instructions/resume.md', 'utf8')
const COVERAGE = readFileSync('plugin/instructions/coverage.md', 'utf8')

// Whitespace-normalised. Eleven defects in this repository have been a regex dying across a
// hard-wrapped line, and every file here is hard-wrapped prose.
const flat = (s) => s.replace(/\s+/g, ' ')
// Bounded at the next horizontal rule, so an assertion cannot be satisfied by text belonging to
// a later section of the document.
const EXEMPTION = flat(RESUME.slice(RESUME.indexOf('### Two files are exempt')).split(/\n---/)[0])

const LEDGERS = ['01-docs/09-change-control/spec-change-log.md', '01-docs/01-intent/open-questions.md']

test('UTEST-060: both ledgers are named, by path', () => {
  // By path, not by description. "the change log" is not something a run can match a filename
  // against while deciding whether to overwrite it.
  for (const ledger of LEDGERS) assert.ok(EXEMPTION.includes(ledger), `${ledger} is not named in the exemption`)
})

test('UTEST-060: the exemption says append, and says never replace', () => {
  // Both halves. "Append to these" without "never replace them" leaves whole-file replacement
  // available as the thing the rule two paragraphs up explicitly demands.
  assert.match(EXEMPTION, /A redo appends to these two\. It never replaces them\./)
})

test('UTEST-060: the reason given is ADR-004 — the rows are the state', () => {
  // Without the reason this reads as an arbitrary carve-out from a rule with a stated rationale,
  // and a carve-out with no reason of its own is the first thing a tidy-up deletes.
  assert.match(EXEMPTION, /ADR-004/)
  assert.match(EXEMPTION, /these rows \*are\* the state/)
})

test('UTEST-060: it distinguishes a ledger from a half-written file', () => {
  // The objection the rule above would otherwise raise, answered where it is raised. A partial
  // ledger is not the "half old, half new" file that rule is about — a row is complete or absent.
  assert.match(EXEMPTION, /Appending to a ledger is not repairing a half-written file/)
  assert.match(EXEMPTION, /a row is complete or it is absent/)
})

test('UTEST-060: the four-states table points at the exemption', () => {
  // The table is what a run reads first, and it previously carried the unqualified rule. A
  // correct exemption further down the document does not help a run that stopped reading.
  const row = flat(RESUME).match(/\| \*\*partial\*\* \|[^|]*\|([^|]*)\|/)
  assert.ok(row, 'the partial row is not in the four-states table')
  assert.match(row[1], /ledgers below are appended to, never replaced/)
})

test('UTEST-060: coverage.md still says these two are written by every round', () => {
  // The premise the exemption rests on. If coverage.md ever reassigns either file to a single
  // round, this exemption becomes wrong rather than merely unnecessary — so assert the premise
  // here, in the file that depends on it.
  assert.match(flat(COVERAGE), /spec-change-log\.md` is \*\*infrastructure for all eight rounds\*\*/)
  assert.match(flat(COVERAGE), /open-questions\.md` is the other file every round writes to/)
})
