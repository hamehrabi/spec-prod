// ATEST-012/013/018, UTEST-010/011/015 — Rounds 2 to 4.
// Requirement: REQ-F-012 (core subdomain), REQ-F-013 (at most three drivers),
// REQ-F-017 (depth by subdomain class) · BR-011, BR-013.
//
// These three rounds produce the decisions everything downstream rests on. Get the
// core-subdomain question wrong and the workspace spends its depth in the wrong place —
// which is how teams lose their first three weeks to authentication.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseQuestions } from '../../ci/questions.mjs'

const { inRound, text } = parseQuestions()
const depth = readFileSync('plugin/instructions/depth.md', 'utf8')

// --- REQ-F-012: the core subdomain --------------------------------------------------------

test('ATEST-012: Round 2 asks which ONE capability they compete on', () => {
  const q = inRound(2).find((x) => /compete on/i.test(x.title))
  assert.ok(q, 'the core-subdomain question must exist')
  assert.match(q.body, /core\s+subdomain/i)
  assert.match(q.body, /decides where depth goes/i)
})

test('UTEST-010: it is asked even when only one capability is in scope', () => {
  // The temptation is to skip it as obvious. The answer is a recorded decision, and "obvious"
  // is not the same as "written down".
  const q = inRound(2).find((x) => /compete on/i.test(x.title))
  assert.match(q.body, /Ask this every time/i)
  assert.match(q.body, /even when only one capability is in scope/i)
})

test('two cores: press once, then record BOTH — never silently pick', () => {
  const q = inRound(2).find((x) => /compete on/i.test(x.title))
  assert.match(q.body, /press once/i)
  assert.match(q.body, /record both and flag[\s>]+it/i)
  assert.match(q.body, /Never silently pick one/i)
  assert.match(q.body, /their decision to make knowingly/i)
})

// --- REQ-F-013 / BR-011: exactly one push-back --------------------------------------------

test('ATEST-013 / UTEST-011: more than three drivers triggers exactly ONE push-back', () => {
  const q = inRound(4).find((x) => /three qualities/i.test(x.title))
  assert.ok(q, 'the driving-characteristics question must exist')
  assert.match(q.title, /maximum three/i)
  assert.match(q.body, /Push back once/i)
  // Both halves matter: pushing back twice is nagging, and never pushing back is no limit.
  assert.match(q.body, /Then accept whatever they say and move on/i)
  assert.match(q.body, /Asking twice is nagging/i)
})

test('BR-011: the rejected characteristics are recorded, with reasons', () => {
  const q = inRound(4).find((x) => /three qualities/i.test(x.title))
  assert.match(q.body, /Record the rejected ones/i)
  // The rejected list is the evidence a decision happened rather than a preference.
  assert.match(q.body, /evidence a decision was\s*\n?made/i)
})

test('UTEST-011: picking three triggers no push-back at all', () => {
  const q = inRound(4).find((x) => /three qualities/i.test(x.title))
  assert.match(q.body, /If they pick more than three/i, 'the push-back is conditional on exceeding three')
})

test('a quality that is already a hard constraint does not need a driver slot', () => {
  // DD-008's reasoning, carried into the question rather than left in an architecture doc
  // nobody reads mid-interview.
  const q = inRound(4).find((x) => /three qualities/i.test(x.title))
  assert.match(q.body, /hard constraint elsewhere does \*\*not\*\* need a driver\s+slot/i)
  assert.match(q.body, /could silently[\s>]+degrade/i)
})

// --- REQ-F-017 / BR-013: depth by class ---------------------------------------------------

test('UTEST-015: core, supporting and generic get three different depths', () => {
  assert.match(depth, /\*\*Core\*\*.*full chain/is)
  assert.match(depth, /\*\*Supporting\*\*.*One page/is)
  assert.match(depth, /\*\*Generic\*\*.*integration contract only/is)
})

test('ATEST-018: a supporting area gets one page and acceptance-level tests', () => {
  assert.match(depth, /Acceptance-level only/i)
  assert.match(depth, /Full pyramid/i, 'and the core area gets the full pyramid, or the distinction is empty')
})

test('BR-013: uniform depth is named as the failure this exists to avoid', () => {
  assert.match(depth, /never applied uniformly/i)
  assert.match(depth, /makes this whole\s*\n?method feel like paperwork/i)
  // It is also the most natural mistake, which is why it is stated rather than implied.
  assert.match(depth, /uniform effort\s*\n?looks like thoroughness/i)
})

test('every subdomain row carries a build-or-buy decision', () => {
  assert.match(depth, /Every row of the generated subdomain map carries a build-or-buy decision/i)
  assert.match(depth, /Generic says\s*\n?\*\*buy\*\*/i)
  // A blank row is not neutral — it becomes whatever the next reader assumes.
  assert.match(depth, /A row with no decision is not a neutral row/i)
})

test('a skipped file records WHY it was skipped', () => {
  assert.match(depth, /Skip it with the reason recorded — never silently/i)
  // Otherwise a deliberate skip and a forgotten blueprint look identical.
  assert.match(depth, /indistinguishable from one the intake forgot/i)
})

test('the class decides the depth, never the filename', () => {
  assert.match(depth, /The class decides the depth. The filename never does/i)
  assert.match(depth, /then the map is wrong, not the rule/i)
})

// --- ADR-001: the modules stay separate ---------------------------------------------------

test('depth rules live in depth.md, not in the question set', () => {
  assert.doesNotMatch(text, /full chain|integration contract only/i, 'depth belongs to depth.md')
  assert.doesNotMatch(depth, /^## Q\d\./m, 'and questions do not belong to depth.md')
})
