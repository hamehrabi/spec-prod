// ATEST-040, TEST-018 — Rounds 7 and 8, and the rules they turn on.
// Requirement: REQ-R-005 (task files name allowed AND forbidden files) · REQ-F-017 · BR-013.
//
// REQ-R-005 is the clause the whole governance story rests on. A task file without a
// do-not-change list is how an agent causes silent damage while sincerely believing it was
// in scope.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseQuestions } from '../../ci/questions.mjs'

const gov = readFileSync('plugin/instructions/governance.md', 'utf8')
const { rounds, inRound } = parseQuestions()

test('all eight rounds are asked, four questions each at most', () => {
  assert.deepEqual(rounds, [1, 2, 3, 4, 5, 6, 7, 8], 'the whole interview exists')
  for (const r of rounds) {
    const n = inRound(r).length
    assert.ok(n > 0 && n <= 4, `Round ${r} asks ${n}; the limit is four (BR-004 caps the rounds too)`)
  }
})

test('Round 7 recommends thin vertical slices, and says why', () => {
  const q = inRound(7).find((x) => /sequenced/i.test(x.title))
  assert.equal(q.options[0].recommended, true)
  assert.match(q.options[0].reason, /reviewable by using it/i)
  // The alternative's real cost: nothing works until the last layer lands.
  assert.match(q.options[1].reason, /nothing works until the last layer/i)
})

test('Round 8 turns recovery answers into numbers, not adjectives', () => {
  const q = inRound(8).find((x) => /how much could you afford to lose/i.test(x.title))
  assert.ok(q)
  assert.match(q.body, /numbers, not adjectives/i)
  // The specific lie this catches: a stated objective the backup schedule cannot deliver.
  assert.match(q.body, /a one-day objective with a nicer name/i)
  assert.match(q.body, /Confirm they mean it/i)
})

// --- REQ-R-005: both lists, always -------------------------------------------------------

test('ATEST-040 / TEST-018: every task file names allowed AND do-not-change files', () => {
  assert.match(gov, /Every task file names what it must NOT change/i)
  assert.match(gov, /Files it may change/i)
  assert.match(gov, /Files it must not change/i)
})

test('a task file with only the allowed list is the MORE dangerous shape', () => {
  // Because it looks complete. Nothing in it is wrong; the missing sentence is the one that
  // would have stopped the damage.
  assert.match(gov, /the more dangerous shape/i)
  assert.match(gov, /silent damage while sincerely believing it was in scope/i)
  assert.match(gov, /stop and say so,\s*\n?before editing/i)
})

// --- AGENT.md carries the rules verbatim --------------------------------------------------

test('every adr-index rule is copied into AGENT.md, word for word', () => {
  assert.match(gov, /copies them — word for\s*\n?word/i)
  assert.match(gov, /never restates or softens them/i)
  assert.match(gov, /A rule that\s*\n?lives only in the index governs nothing/i)
  // A paraphrased rule is a different rule that nobody decided.
  assert.match(gov, /a different rule that nobody decided/i)
  assert.match(gov, /`AGENT\.md` is a \*\*contract\*\*/i)
})

// --- Traceability blanks ------------------------------------------------------------------

test('a blank traceability cell stays blank and visible', () => {
  assert.match(gov, /Never fill a cell to make the matrix look complete/i)
  // A guessed-full matrix is worse than none: it reports coverage that does not exist.
  assert.match(gov, /worse than no matrix/i)
  assert.match(gov, /reports coverage that does not exist/i)
})

// --- Test shape by class (BR-013) ---------------------------------------------------------

test('test shape follows subdomain class, reusing depth.md', () => {
  assert.match(gov, /Test shape follows subdomain class/i)
  assert.match(gov, /\*\*Core\*\*.*pyramid/i)
  assert.match(gov, /\*\*Supporting\*\*.*Reversed/i)
  assert.match(gov, /One test shape applied everywhere is the same failure/i)
})

// --- Write everything ----------------------------------------------------------------------

test('summarising a folder is named as the failure this rule prevents', () => {
  assert.match(gov, /never summarise a folder/i)
  // The shape of the failure: it looks complete and passes every structural check.
  assert.match(gov, /looks complete, passes every structural check/i)
  assert.match(gov, /missing exactly\s*\n?the parts nobody notices until they are needed/i)
})

test('the change log records at least one REJECTED change', () => {
  assert.match(gov, /at least one rejected change/i)
  // Because the question people actually ask is why it does NOT do something.
  assert.match(gov, /why doesn't it\s*\n?do X\?/i)
})

test('appendix-index.md is never created', () => {
  assert.match(gov, /`appendix-index\.md` is \*\*never created\*\*/i)
  assert.match(gov, /scaffolding for the library, not an artifact/i)
})
