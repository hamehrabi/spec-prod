// UTEST-038 — the fill procedure has a decidable way to tell whether step 1 happened.
// Requirement: ADR-003 · C2 · BUG-024 · REQ-F-037.
//
// Step 1 has said "never author it from memory of what that template usually contains" since it
// was written. A measured run did it anyway, three times in one workspace: requirements.md lost
// `## Writing workflow (Ch. 5)` and gained a `[core]` placeholder appearing nowhere in its
// blueprint, and spec-change-log.md gained an instructional italic appearing in no blueprint at
// all.
//
// That is the same shape as BUG-021: a rule with nothing that decides whether it was followed.
// The fix is the same shape too — replace the exhortation with a comparison anyone can make.
// FF-007 already performs it in CI; this puts it inside the run, where it can catch the file
// before it is written rather than after the workspace is finished.
//
// These tests hold the check in place. They do not verify that a run obeys it — only a run can
// do that, and the next one is what will say whether this worked.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const FILL = readFileSync('plugin/instructions/fill.md', 'utf8')

// Whitespace-normalised, because these are prose assertions and prose is hard-wrapped. Ten
// defects in this repository have been a pattern that failed to match across a line break, and
// the first version of this file made it eleven: `not a control` wraps in the source.
const FINISHED = FILL.slice(FILL.indexOf('## When the file is finished')).replace(/\s+/g, ' ')

test('UTEST-038: the finished-file check compares headings against the blueprint', () => {
  assert.match(FINISHED, /Compare the finished file's headings against the blueprint's, in order/)
})

test('UTEST-038: exactly the three legitimate differences are named', () => {
  // Naming fewer would make the check fail on files that did the right thing, and a check that
  // fails on correct work is switched off within a week. Naming more would let an authored file
  // through under whichever exemption it happened to need.
  for (const allowed of [/worked example's headings are gone \(step 2\)/, /prompt sections' headings are gone/, /placeholder now contains the answer \(step 4\)/])
    assert.match(FINISHED, allowed)
})

test('UTEST-038: any other difference is stated to mean step 1 did not happen', () => {
  assert.match(FINISHED, /Any other difference means step 1 did not happen/)
  // Both directions. A dropped heading and an invented one are different mistakes with the same
  // cause, and a check that named only one would pass the workspace that produced BUG-024.
  assert.match(FINISHED, /was dropped/)
  assert.match(FINISHED, /was invented/)
})

test('UTEST-038: the check is decidable, not a judgement about whether the file looks right', () => {
  // The distinction the rest of this section already rests on. "Does this look complete?" always
  // answers yes; "are these two lists the same?" does not.
  assert.match(FINISHED, /two lists of strings/)
  assert.match(FINISHED, /not a judgement/)
})

test('UTEST-038: an italic the run wrote itself still counts as unfilled', () => {
  // The third instance of BUG-024, and the one most likely to be argued away: the run composed
  // an instructional italic rather than leaving one behind. A developer cannot tell the
  // difference, which is the only thing that matters.
  assert.match(FINISHED, /instructional italic you wrote yourself is still an instructional italic/i)
})

test('UTEST-038: the reason is recorded, so the check is not tidied away as redundant', () => {
  // It looks redundant beside step 1's existing sentence. It is not: the sentence is the rule
  // and this is the thing that decides whether the rule was followed.
  assert.match(FINISHED, /BUG-024/)
  assert.match(FINISHED, /not a control/)
})
