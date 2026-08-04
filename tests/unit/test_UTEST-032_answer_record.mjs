// UTEST-032 — the answer record parses, and the prompt it composes carries nothing else.
// Requirement: TASK-016 · BR-002 · BR-003 · depth.md.
//
// The prompt assertions matter more than the parsing ones. An answer record is also a document
// ABOUT its fixture — EV-001's names TASK-016, GOLD-001 and "the input half of the pair" — and
// a runner that passed the file through whole could produce a workspace carrying the harness's
// vocabulary as though a developer had said it. That would be BR-002 caused by the tool built
// to detect it, and it would be invisible: the leak would look like a decision.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseAnswers, drivePrompt, problemStatement } from '../../ci/answers.mjs'

const REAL = readFileSync('tests/fixtures/golden/EV-001-answers.md', 'utf8')
const record = parseAnswers(REAL)

test('UTEST-032: the real answer record parses into rounds and answers', () => {
  assert.equal(record.depth, 'express')
  assert.match(record.project, /^Pantry/)
  assert.deepEqual(
    record.rounds.map((r) => r.n),
    [1, 2, 3, 4]
  )
  // Four asked at default depth; express keeps two, and the record says which two.
  assert.equal(record.rounds[0].answers.length, 4)
  assert.deepEqual(
    record.rounds[0].answers.map((a) => a.asked),
    [true, true, false, false]
  )
})

test('UTEST-032: a dropped question carries no answer at all', () => {
  const dropped = record.rounds[0].answers.find((a) => !a.asked)
  // Not '' and not the reason it was dropped. `null` is the only value that cannot be mistaken
  // for something the developer said (BR-003).
  assert.equal(dropped.answer, null)
  assert.match(dropped.question, /How many people/)
})

test('UTEST-032: the header row is not read as a question', () => {
  // `| Q | Question | Answer |` is the table header. Matching every pipe row would turn it into
  // an answered question called "Question", and every round would gain one.
  for (const round of record.rounds)
    for (const a of round.answers) assert.match(a.q, /^Q\d+$/, `${a.q} is not a question number`)
})

test('UTEST-032: emphasis and backticks are stripped, the words are kept', () => {
  const capabilities = record.rounds[1].answers[0].answer
  assert.match(capabilities, /Save a recipe with its ingredients · plan which meals/)
  assert.doesNotMatch(capabilities, /\*|`/)
})

test('UTEST-032: the free-text statement is the developer\'s, not the heading\'s', () => {
  // The section opens with an explanatory blockquote of its own. Taking the FIRST quote would
  // hand every run the same sentence about why free text exists, in place of the one thing in
  // the record grounded in an actual problem.
  assert.match(record.problem, /^People who cook at home/)
  assert.doesNotMatch(record.problem, /Asked at both depths/)
  assert.doesNotMatch(record.problem, /^>/m)
})

test('UTEST-032: no answer record produces no rounds, rather than empty ones', () => {
  const empty = parseAnswers('# Notes\n\n## Round 5 — architecture\n\nNot run.\n')
  assert.deepEqual(empty.rounds, [])
  assert.equal(empty.depth, 'default', 'an unstated depth is the kit\'s own default')
  assert.equal(problemStatement('# Notes\n'), null)
})

// --- What the prompt must not contain ----------------------------------------------------------

const prompt = drivePrompt(record, 3)

test('UTEST-032: the prompt names no part of this harness', () => {
  for (const leak of [
    'TASK-016',
    'GOLD-001',
    'fixture',
    'golden',
    'harness',
    'EV-001',
    'input half',
    'not accepted',
    'incomplete',
  ])
    assert.doesNotMatch(prompt, new RegExp(leak, 'i'), `"${leak}" reached the prompt`)
})

test('UTEST-032: the prompt carries every answer of every round it drives', () => {
  for (const round of record.rounds.filter((r) => r.n <= 3))
    for (const a of round.answers)
      if (a.asked) assert.ok(prompt.includes(a.answer), `${round.n}/${a.q} is missing from the prompt`)
})

test('UTEST-032: a dropped question reaches the run as dropped, not as absent', () => {
  // Leaving it out entirely would hand the model a shorter list and let it decide what became
  // of the rest. Express asks less; it never assumes more (depth.md).
  const dropped = record.rounds.flatMap((r) => (r.n <= 3 ? r.answers : [])).filter((a) => !a.asked)
  assert.equal(dropped.length, 5)
  // Count the answer lines, not every occurrence — the instruction paragraph above them says
  // "NOT ASKED" once too, and that one is the rule rather than an answer.
  assert.equal(prompt.match(/^ +Q\d+\..* -> NOT ASKED$/gm).length, 5)
  for (const a of dropped) assert.ok(prompt.includes(`${a.question} -> NOT ASKED`), `${a.q} lost its question text`)
})

test('UTEST-032: the prompt stops the run where the fixture stops', () => {
  assert.match(prompt, /After Round 3 is accepted/)
  assert.match(prompt, /Do not begin Round 4\./)
  assert.doesNotMatch(prompt, /Q1\. What does success look like/, 'Round 4 answers must not be supplied')
})

test('UTEST-032: rounds beyond the target are excluded, not truncated mid-round', () => {
  const one = drivePrompt(record, 1)
  assert.match(one, /^Round 1$/m)
  // Round 2 is named once, in the instruction not to begin it. What must be absent is its
  // CONTENT — a heading of its own, and any answer belonging to it.
  assert.doesNotMatch(one, /^Round 2$/m)
  assert.ok(one.includes('Web application with a UI'))
  assert.ok(!one.includes('Turning a week of chosen meals'))
})
