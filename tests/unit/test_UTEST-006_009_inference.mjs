// ATEST-009/010/011, UTEST-006…009 — inference and contradiction.
// Requirement: REQ-F-009, REQ-F-010, REQ-F-011 · BR-004, BR-012 · DD-007.
//
// DD-007 makes this load-bearing rather than an efficiency: the kit promises deep documents
// AND an interview people finish, and the only way to have both is to derive what can be
// derived. Every unnecessary question is spent from the budget the depth comes out of.
//
// Tested in BOTH directions. Over-inference is as much a failure as under-inference — worse,
// actually, because the developer never saw the question.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseQuestions } from '../../ci/questions.mjs'

const inf = readFileSync('plugin/instructions/inference.md', 'utf8')
const intake = readFileSync('plugin/instructions/intake.md', 'utf8')
const { text: questions, inRound } = parseQuestions()

// --- REQ-F-009 / ATEST-009: suppress, and say so ------------------------------------------

test('UTEST-007: a suppressed question yields a notice naming conclusion AND source', () => {
  assert.match(inf, /Never suppress a question silently/i)
  assert.match(inf, /the conclusion and the answer it came\s*\n?from/i)
  // The notice is what makes the inference challengeable at all.
  assert.match(inf, /what makes an inference\s*\n?\*\*challengeable\*\*/i)
  assert.match(inf, /never learns\s*\n?a decision was made on their behalf/i)
})

test('a silent inference is named as the same failure as an invented fact', () => {
  assert.match(inf, /A silent inference is a hidden assumption/i)
  assert.match(inf, /one step earlier and\s*\n?harder to see/i)
})

test('ATEST-009: an API-only product is not asked about its interface', () => {
  assert.match(inf, /API or backend service only/i)
  assert.match(inf, /do not ask\.\*\* There is no interface/i)
  // And the consequence is recorded rather than silently dropped.
  assert.match(inf, /skipped, with the reason recorded/i)
})

// --- UTEST-006: partial derivation narrows, it does not skip -------------------------------

test('UTEST-006: a partly derivable question is NARROWED and asked, not skipped', () => {
  assert.match(inf, /Partial means narrow the question, not skip it/i)
  assert.match(inf, /ask a smaller version/i)
  assert.match(inf, /still a question/i)
  // The failure mode of doing otherwise.
  assert.match(inf, /guessing with extra steps/i)
})

test('UTEST-006: inference does not over-reach — shape is asked, detail is derived', () => {
  assert.match(inf, /Do not infer aggressively/i)
  assert.match(inf, /wrong inference silently produces a wrong specification/i)
  // Worse than a wrong answer, because no question was ever shown.
  assert.match(inf, /the developer never saw the question/i)
  assert.match(inf, /would change the architecture gets asked, never derived/i)
  assert.match(inf, /Detail can be\s*\n?inferred; shape cannot/i)
})

test('FTEST-014: a fully inferable round is skipped WITH a notice, never rendered empty', () => {
  assert.match(inf, /Skip it \*\*with a notice\*\*/i)
  assert.match(inf, /never as a round that failed/i)
  // An interview that appears to skip a stage reads as a bug, and people stop.
  assert.match(inf, /reads as\s+a bug/i)
})

// --- REQ-F-010 / ATEST-010: contradictions ------------------------------------------------

test('ATEST-010 / UTEST-008: a contradiction stops and quotes BOTH, verbatim', () => {
  assert.match(inf, /stop the interview/i)
  assert.match(inf, /Quote \*\*both\*\*, verbatim, in their own words/i)
  assert.match(inf, /Paraphrase either into something tidier/i)
})

test('BR-012: no default, no ranking, no hint — they own the contradiction', () => {
  assert.match(inf, /Offer no default/i)
  // The mechanism: a visible preference is agreed with, and the decision transfers.
  assert.match(inf, /the developer agrees with it/i)
  assert.match(inf, /product decision has quietly transferred/i)
  assert.match(inf, /they own the contradiction, because they own the product/i)
})

test('UTEST-008: tension is distinguished from contradiction', () => {
  assert.match(inf, /Tension is not contradiction/i)
  assert.match(inf, /Proceed on a stated assumption and record it/i)
  assert.match(inf, /under 50 users/i, 'a worked example of tension, not a definition')
  assert.match(inf, /A stated assumption is recoverable/i)
})

test('an unrecognised conflict stops anyway — the asymmetry is stated', () => {
  assert.match(inf, /Stop and quote both anyway/i)
  assert.match(inf, /Under-detecting a contradiction is recoverable/i)
  // Why silent resolution is the worse error: consistent and wrong is the hardest to see.
  assert.match(inf, /internally consistent and wrong/i)
})

// --- REQ-F-011 / BR-004 / ATEST-011: the ceiling -------------------------------------------

test('ATEST-011 / UTEST-009: there is no ninth round, for any reason', () => {
  assert.match(inf, /There is no ninth round, for any reason/i)
  assert.match(inf, /not if the developer offers/i)
  assert.match(intake, /There is never a ninth round/i)
})

test('unknowns become open questions, and that is the BETTER outcome', () => {
  assert.match(inf, /becomes a `\[TODO\]` with a matching open question/i)
  assert.match(inf, /named decision\s*\n?owner/i)
  // Not a consolation: an abandoned interview loses everything, not one answer.
  assert.match(inf, /a recorded gap is visible/i)
  assert.match(inf, /loses everything rather than one answer/i)
})

// --- ADR-001: the modules stay separate ----------------------------------------------------

test('derivation rules live in inference.md; questions only point at them', () => {
  assert.match(questions, /Check `instructions\/inference\.md` before composing any round/i)
  assert.match(questions, /May be suppressed entirely by inference/i)
  // The rules themselves must not leak into the question set.
  assert.doesNotMatch(questions, /Do not infer aggressively|Tension is not contradiction/i)
  assert.doesNotMatch(inf, /^## Q\d\./m, 'and question text does not belong in inference.md')
})

test('intake consults inference BEFORE composing a round', () => {
  assert.match(intake, /First consult `instructions\/inference\.md`/i)
  assert.ok(
    intake.search(/First consult `instructions\/inference\.md`/) < intake.search(/Then ask what remains/),
    'inference precedes asking, or it is not inference'
  )
})

test('the question set still asks what is NOT derivable', () => {
  // The other direction: three questions carry a suppression marker, and the rest do not.
  const marked = (questions.match(/May be (suppressed|narrowed)/g) ?? []).length
  assert.equal(marked, 3, 'exactly the three the rules cover')
  assert.ok(inRound(1).length === 4, 'Round 1 is never inferable — it is where the answers come from')
})
