// UTEST-091 — an unrecognised option stops the run instead of being discarded.
// Requirement: BR-009 · BR-010 · BUG-041.
//
// The runner's option loop ended at `else if (!a.startsWith('--')) args.caseId = a`. Anything
// else beginning with `--` matched no branch and fell out of the loop in silence, so a
// misspelled or differently-spelled flag was indistinguishable from not passing one.
//
// IT COST A RUN. An eight-round regeneration was started with `--timeout=110` — the `=` spelling
// most CLIs accept — which parsed as an unknown flag. The run proceeded on the 45-minute
// default and the host was killed in the middle of Round 3: about $20 and forty minutes, spent
// to produce nothing, because a typo was read as a preference.
//
// That is this repository's own signature failure arriving in its harness. A control that
// silently does something other than what it was told is worse than one that refuses, because
// the refusal is immediate and the silence surfaces forty minutes later looking like a host
// problem. The tests below spend most of their effort on the direction that matters: that
// nothing is accepted quietly.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parse } from '../../ci/generate-workspace.mjs'

// --- The defect, in both spellings -------------------------------------------------------------

test('UTEST-091: --timeout=110 sets the ceiling it names', () => {
  // The exact invocation that was thrown away. `=` and space are the same flag.
  assert.equal(parse(['EV-001', '--timeout=110']).timeout, 110)
  assert.equal(parse(['EV-001', '--timeout', '110']).timeout, 110)
})

test('UTEST-091: every valued option accepts both spellings', () => {
  for (const argv of [['EV-001', '--rounds=3'], ['EV-001', '--rounds', '3']]) {
    assert.equal(parse(argv).rounds, 3, argv.join(' '))
  }
  for (const argv of [['EV-001', '--model=sonnet'], ['EV-001', '--model', 'sonnet']]) {
    assert.equal(parse(argv).model, 'sonnet', argv.join(' '))
  }
})

test('UTEST-091: the default is still the default when nothing is passed', () => {
  // The exemption must not become the value. 45 minutes is what the usage text documents.
  assert.equal(parse(['EV-001']).timeout, 45)
  assert.equal(parse(['EV-001']).rounds, null)
  assert.equal(parse(['EV-001']).model, null)
})

// --- Nothing is accepted quietly ---------------------------------------------------------------

test('UTEST-091: a misspelled flag throws rather than being ignored', () => {
  // The whole point. Silently ignoring this is what spent the money.
  assert.throws(() => parse(['EV-001', '--timeuot=110']), /unknown option --timeuot/)
  assert.throws(() => parse(['EV-001', '--keeps']), /unknown option --keeps/)
})

test('UTEST-091: the message says a flag is not a default', () => {
  // A reader who mistypes needs to know the run did NOT fall back to something sensible,
  // because falling back to something sensible is exactly what it used to do.
  assert.throws(() => parse(['EV-001', '--nope']), /A misspelled flag is not a default/)
})

test('UTEST-091: a non-numeric value for a numeric option throws', () => {
  // `Number('abc')` is NaN, and `deadline = started + NaN` is NaN, so the ceiling silently
  // becomes "never" — the opposite failure to the one above and just as invisible.
  assert.throws(() => parse(['EV-001', '--timeout=abc']), /--timeout needs a positive number/)
  assert.throws(() => parse(['EV-001', '--rounds', 'many']), /--rounds needs a positive number/)
  assert.throws(() => parse(['EV-001', '--timeout=0']), /positive/)
  assert.throws(() => parse(['EV-001', '--timeout=-5']), /positive/)
})

// --- What must keep working --------------------------------------------------------------------

test('UTEST-091: the boolean flags and the case id still parse', () => {
  const a = parse(['EV-001', '--keep', '--dry-run'])
  assert.equal(a.caseId, 'EV-001')
  assert.equal(a.keep, true)
  assert.equal(a.dryRun, true)
})

test('UTEST-091: only the FIRST = splits, so a value may contain one', () => {
  // `--model=claude-opus-5=beta` is one flag and one value. Splitting on every `=` would
  // silently truncate it, which is the same class of defect wearing a different hat.
  assert.equal(parse(['EV-001', '--model=a=b']).model, 'a=b')
})

test('UTEST-091: a bare case id is not mistaken for an option value', () => {
  assert.equal(parse(['--keep', 'EV-001']).caseId, 'EV-001')
  assert.equal(parse(['EV-001']).caseId, 'EV-001')
})
