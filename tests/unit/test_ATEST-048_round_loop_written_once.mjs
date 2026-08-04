// ATEST-048 — the round is written once and runs eight times.
// Requirement: REQ-F-043 · FF-018 · ADR-001 · depth.md.
//
// Until now intake.md described Round 1 and said rounds 2-8 "are not yet built". The obvious
// way to finish it is to write Round 2, then Round 3, and so on — which produces eight nearly
// identical passages that drift apart the first time one of them is corrected.
//
// The whole design already refuses that shape elsewhere: the file list is derived from the
// manifest rather than written down (REQ-F-043), and rounds own directories rather than files
// (FF-018). The round procedure itself has to follow the same rule, or the one place a
// per-round exception could hide is the orchestration.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const intake = readFileSync('plugin/instructions/intake.md', 'utf8')
const coverage = readFileSync('plugin/instructions/coverage.md', 'utf8')
const questions = readFileSync('plugin/instructions/questions.md', 'utf8')
const depth = readFileSync('plugin/instructions/depth.md', 'utf8')

test('ATEST-048: the round procedure appears ONCE, not once per round', () => {
  // The failure this guards: eight copies of ask -> write -> summarise -> gate. If a fix
  // lands in seven of them, the eighth is wrong and nothing says so.
  const askSteps = intake.match(/^### 2a\. Ask$/gm) ?? []
  assert.equal(askSteps.length, 1, 'one ask step, reused — not one per round')

  assert.match(intake, /This step runs once per round, and it is written once/i)
  assert.match(intake, /The round number is the only thing\s*\n?that changes/i)
  assert.match(intake, /eight places to keep correct instead of one/i)
})

test('ATEST-048: no round is named as a special case in the orchestration', () => {
  // "Round 2", "Round 3" … appearing as headings would mean the loop had been unrolled.
  const perRoundHeadings = intake.match(/^#{2,3} .*Round [2-8]\b/gm) ?? []
  assert.deepEqual(perRoundHeadings, [], 'a per-round heading is an unrolled loop')
})

test('ATEST-048: what varies per round is delegated, not embedded', () => {
  // Both of the two things that differ between rounds are read from another module at the
  // round that needs them — questions from questions.md, files from the coverage round map.
  assert.match(intake, /questions\.md`, under that round's own heading/i)
  assert.match(intake, /round map in `instructions\/coverage\.md`/i)
  assert.match(intake, /it names the \*\*directories\*\* that round owns/i)

  // And those modules really do carry all eight.
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) {
    assert.match(questions, new RegExp(`^# Round ${n} — `, 'm'), `questions.md must hold Round ${n}`)
    assert.match(coverage, new RegExp(`^\\| ${n} \\|`, 'm'), `the round map must hold Round ${n}`)
  }
})

test('ATEST-048: the loop exits at eight, and there is no ninth round', () => {
  assert.match(intake, /Round 8's gate is the last/i)
  assert.match(intake, /There is no ninth round, for any reason/i)
  // The reason it is a hard stop rather than a guideline.
  assert.match(intake, /an\s*\n?interview that expands to fit the ambiguity gets abandoned/i)
})

test('ATEST-048: express changes the questions per round, never the number of rounds', () => {
  // The tempting shortcut — "express means fewer rounds" — would make express a second flow,
  // exercised half as often, and it would rot. depth.md already forbids it; intake.md has to
  // agree, because it is the file that runs the loop.
  assert.match(intake, /fixed at eight, and is not a depth setting/i)
  assert.match(intake, /reduces\s*\n?the questions asked inside a round, never the number of rounds/i)
  assert.match(depth, /Reduce within a stage; never delete a stage/i)
  assert.match(depth, /\| Rounds asked \| Up to four questions each \| \*\*Up to two\*\*/)
})

test('ATEST-048: stopping early skips validation and the report, rather than faking them', () => {
  // A run that ends at round three has nothing finished to validate. Reporting success on it
  // is BR-009's exact failure, and it is the easiest one to commit by accident when the
  // closing steps sit at the bottom of the same file as the loop.
  assert.match(intake, /steps 3 to 5 do \*\*not\*\* run/i)
  assert.match(intake, /nothing finished to\s*\n?validate or report on/i)
  assert.match(intake, /A run that ends early is not a failed run/i)
  assert.match(intake, /an interview nobody dares pause is one they abandon instead/i)
})

test('ATEST-048: the closing steps are numbered outside the loop', () => {
  // They used to be 2e/2f/2g, which read as part of the round and invited running them eight
  // times. Validation over a "finished workspace" that is one round old is not validation.
  const order = ['— Each round', '— Validate', '— Write the entry point', '— Report', '— Stop']
  const positions = order.map((t) => intake.indexOf(t))
  assert.ok(positions.every((p) => p > 0), 'every closing step must exist')
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b), 'and they run in this order')
})
