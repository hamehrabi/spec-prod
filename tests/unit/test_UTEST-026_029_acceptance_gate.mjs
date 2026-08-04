// UTEST-026…029 / ATEST-041…045 / STEST-016 — the stage acceptance gate.
// Requirement: REQ-F-038, REQ-F-039, REQ-F-041 · ADR-006 (extends ADR-004) · FF-016.
//
// The gate is the only control in this kit aimed at a workspace being WRONG rather than
// malformed. Everything else checks that ninety files are well-formed; this is what gives
// the developer a chance to notice they say nothing.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { acceptanceRows, acceptedStages, forbiddenStateFiles, unacceptedStages } from '../../ci/acceptance.mjs'

const review = readFileSync('plugin/instructions/review.md', 'utf8')
const intake = readFileSync('plugin/instructions/intake.md', 'utf8')

// --- What the gate shows (ATEST-041, and the reason the task is P0) ---------------------

test('ATEST-041: the gate shows four sections, not a file listing', () => {
  for (const section of [/Files written/i, /Decisions recorded/i, /Inferences drawn/i, /`\[TODO\]`s created/i]) {
    assert.match(review, section)
  }
  // A path list can be skimmed in a second and proves nothing was read.
  assert.match(review, /Not a file listing/i)
  assert.match(review, /disagreed with/i)
})

test('ATEST-041: the gate blocks the next round', () => {
  assert.match(review, /before the next round's questions are asked/i)
  assert.match(intake, /blocks the next round/i)
  // Ordering inside intake: write, then gate, then stop.
  assert.ok(intake.search(/### 2b\. Write/) < intake.search(/### 2d\. Present the gate/))
})

test('REQ-F-039: exactly three choices, named in words', () => {
  for (const choice of [/\baccept\b/, /\brevise\b/, /\bstop\b/]) assert.match(review, choice)
  assert.match(review, /named \*\*in words\*\*|in words/i)
  assert.match(review, /No single-key shortcuts/i)
})

// --- UTEST-026: silence is not consent --------------------------------------------------

test('UTEST-026: no answer means keep waiting, never proceed', () => {
  assert.match(review, /Never proceed on silence/i)
  assert.match(review, /keep waiting/i)
  assert.match(review, /Silence is not consent/i)
  assert.match(intake, /silence is not acceptance/i)
})

test('STEST-016: asked to skip the gate, it refuses and offers stop instead', () => {
  assert.match(review, /never skippable/i)
  assert.match(review, /Not at express depth, not on request/i)
  assert.match(review, /I can't skip the acceptance step/i)
  // The refusal has to offer the honest alternative, or it is just an obstacle.
  assert.match(review, /What I can do is `stop`/i)
})

// --- UTEST-027: the empty state ----------------------------------------------------------

test('UTEST-027: a round with no decisions is suspicious, not clean', () => {
  assert.match(review, /suspicious, not clean/i)
  assert.match(review, /Never render an empty review as a clean bill of health/i)
  // An empty gate and a thorough one look identical unless the difference is stated.
  assert.match(review, /worth checking before accepting/i)
})

// --- REQ-F-041 / ADR-006: a row, never a file --------------------------------------------

test('REQ-F-041: acceptance is a dated row in the generated change log', () => {
  assert.match(review, /dated row/i)
  assert.match(review, /spec\/01-docs\/09-change-control\/spec-change-log\.md/)
  assert.match(review, /Never a file/i)
  assert.match(review, /\.accepted\.json/, 'the convenience is rejected by name, as AGENT.md does')
})

test('ATEST-045: four accepted rounds produce four rows and no acceptance file', () => {
  const changeLog = `| Date | Stage | Accepted by | Note |
|---|---|---|---|
| 2026-08-04 | Round 1 — the idea | Developer | 4 decisions |
| 2026-08-04 | Round 2 — scope | Developer | 3 decisions |
| 2026-08-05 | Round 3 — product | Developer | 5 decisions, 1 TODO |
| 2026-08-05 | Round 4 — architecture | Developer | 2 inferences |
`
  assert.equal(acceptanceRows(changeLog).length, 4)
  assert.deepEqual(acceptedStages(changeLog).length, 4)

  const workspace = ['spec/CLAUDE.md', 'spec/01-docs/01-intent/intent.md', 'spec/01-docs/09-change-control/spec-change-log.md']
  assert.deepEqual(forbiddenStateFiles(workspace), [], 'no acceptance, progress or approval file anywhere')
})

test('ADR-004/ADR-006: a state file is caught whatever it is called', () => {
  // The failure guarded against is someone adding the convenience under a name nobody
  // thought to forbid, so this matches by shape rather than by exact filename.
  const sneaky = [
    'spec/.accepted.json',
    'spec/.progress',
    'spec/acceptance.json',
    'spec/round-progress.yaml',
    'spec/.intake-state.json',
    'spec/answers.json',
    'spec/.cache/stages.json',
  ]
  for (const path of sneaky) {
    assert.equal(forbiddenStateFiles([path]).length, 1, `${path} must be rejected`)
  }
  // ...without flagging the workspace's own legitimate artifacts.
  assert.deepEqual(forbiddenStateFiles(['spec/01-docs/09-change-control/spec-change-log.md', 'spec/README.md']), [])
})

test('UTEST-028: accepting twice appends no second row', () => {
  const once = '| 2026-08-04 | Round 1 — the idea | Developer | 4 decisions |\n'
  assert.equal(acceptanceRows(once).length, 1)
  assert.equal(acceptedStages(once + once).length, 1, 'the same stage twice is still one accepted stage')
  assert.match(review, /Accepting twice appends nothing/i)
})

// --- UTEST-029: written but not accepted -------------------------------------------------

test('UTEST-029: a round written without a row has its gate re-presented', () => {
  const changeLog = '| 2026-08-04 | Round 1 — the idea | Developer | ok |\n'
  assert.deepEqual(unacceptedStages(['Round 1', 'Round 2'], changeLog), ['Round 2'])
  assert.match(review, /re-present that gate/i)
  assert.match(review, /Do \*\*not\*\* re-ask the round/i)
  assert.match(review, /Do \*\*not\*\*\s*\n?advance past it/i)
})

test('REQ-F-039: revise touches this round only', () => {
  assert.match(review, /touches this round only/i)
  assert.match(review, /mints no duplicate identifiers/i)
  // If revise ever needs a later round, the round boundaries are wrong — a bigger finding.
  assert.match(review, /Stop and report it/i)
})

test('the gate never shows file contents or edits anything', () => {
  assert.match(review, /Show full file contents/i)
  assert.match(review, /scrolling, not reading/i)
  assert.match(review, /It presents and asks/i)
})
