// ATEST-036 — the developer can see which round they are on and how many remain.
// Requirement: REQ-F-032 (TASK-017) · CON-004 · depth.md.
//
// "Round 3" alone tells a developer they are somewhere in an interview of unknown length. An
// interview with no visible end is one they abandon rather than pause, and abandoning loses
// every answer instead of one. The preamble states the count once, at the start; by Round 5
// nobody remembers a sentence they read twenty minutes ago.
//
// The denominator is the whole requirement. A progress line without it is a counter.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const INTAKE = readFileSync('plugin/instructions/intake.md', 'utf8').replace(/\s+/g, ' ')

test('ATEST-036: the round line carries both numbers', () => {
  assert.match(INTAKE, /Round 3 of 8/)
  assert.match(INTAKE, /Both numbers, every time/)
})

test('ATEST-036: it is shown at the start of every round, not once at the beginning', () => {
  assert.match(INTAKE, /Open the round by saying where it sits/)
  assert.match(INTAKE, /before the questions, every round/)
})

test('ATEST-036: meaning is in words, never in a bar or a symbol', () => {
  // The same rule the preamble already lives by: everything must survive being read aloud, read
  // in a log, and read by a screen reader (CON-004).
  assert.match(INTAKE, /Not a bar, not a percentage, not a symbol/)
  assert.match(INTAKE, /read aloud/)
})

test('ATEST-036: the denominator is eight at both depths and is never computed', () => {
  // express reduces questions inside a round and never removes a round. A progress indicator
  // that derived its total from anything could disagree with the preamble, and two numbers that
  // disagree make both untrustworthy.
  assert.match(INTAKE, /eight at both depths/)
  assert.match(INTAKE, /never be computed/)
})

test('ATEST-036: the preamble still states the count, so the two agree', () => {
  // The indicator repeats the preamble rather than replacing it. If this ever stops being true,
  // one of them is wrong and nothing says which.
  const raw = readFileSync('plugin/instructions/intake.md', 'utf8')
  assert.match(raw, /At default depth the interview takes eight rounds\./)
})
