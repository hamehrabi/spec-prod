// ATEST-022/023, TEST-010/011 — the three governance rules.
// Requirement: REQ-F-021 (a deny test per permission rule), REQ-F-022 (a fitness function
// per driver) · BR-010 · REQ-F-017.
//
// RSK-5: a generated workspace can be complete, consistent, well-linked, and govern nothing.
// These three artifacts are where governance is either real or decorative.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseQuestions } from '../../ci/questions.mjs'

const gov = readFileSync('plugin/instructions/governance.md', 'utf8')
const { rounds, inRound, text } = parseQuestions()

// --- Rounds 5 and 6 exist and keep their shape -------------------------------------------

test('Rounds 5 and 6 are asked, four questions each at most', () => {
  assert.ok(rounds.includes(5) && rounds.includes(6), 'rounds 5 and 6 exist')
  for (const r of [5, 6]) {
    const n = inRound(r).length
    assert.ok(n > 0 && n <= 4, `Round ${r} asks ${n}; the limit is four`)
  }
})

test('Round 5 defaults to a modular monolith unless distribution is required', () => {
  const q = inRound(5).find((x) => /architecture style/i.test(x.title))
  assert.ok(q)
  assert.equal(q.options[0].label, 'Modular monolith')
  assert.match(q.body, /Default to a modular monolith/i)
  // The quote is the point: the expensive failure is a good decomposition along wrong lines.
  assert.match(q.body, /beautifully executed one along the wrong lines/i)
})

// --- REQ-F-022 / ATEST-023: a fitness function per driver ---------------------------------

test('ATEST-023 / TEST-011: every driver needs a build-FAILING fitness function', () => {
  assert.match(gov, /A measurable threshold is/i)
  assert.match(gov, /A build that fails/i)
  assert.match(gov, /A warning is a decoration/i)
  // The reason a warning is worse than nothing.
  assert.match(gov, /teaches\s*\n?everyone to ignore red/i)
})

test('an unmeasurable driver is a vague DRIVER, not a missing metric', () => {
  // The tempting fix is to invent a proxy that satisfies the rule. That is how a governance
  // artifact becomes decoration while passing its own check.
  assert.match(gov, /Do not invent a proxy metric/i)
  assert.match(gov, /Fix the definition instead/i)
  assert.match(gov, /swap cost zero files/i, 'shows the vague-to-countable transformation concretely')
  assert.match(gov, /is not governed. It is documented/i)
})

// --- REQ-F-021 / ATEST-022: a deny test per permission rule -------------------------------

test('ATEST-022 / TEST-010: every permission rule needs a deny test', () => {
  assert.match(gov, /every \*cannot\*\s+needs a test/i)
  assert.match(gov, /Allow-only tests are the characteristic failure/i)
  // Why allow-only tests are worse than no tests: they pass with no enforcement at all.
  assert.match(gov, /pass on a system with no\s*\n?enforcement at all/i)
})

test('a deny test must be SEEN to fail before it is trusted', () => {
  assert.match(gov, /seen to fail before it is trusted/i)
  assert.match(gov, /Run it against a version \*\*without\*\* the rule/i)
  // And the trap specific to a product made of prose.
  assert.match(gov, /is a spell-check, not a boundary/i)
})

// --- ADRs ----------------------------------------------------------------------------------

test('an ADR compares two GENUINELY different options and names a cost', () => {
  assert.match(gov, /two genuinely different\s*\n?options/i)
  assert.match(gov, /not one real option and two strawmen/i)
  assert.match(gov, /One option is not a decision; it is a description/i)
})

test('a decision with no visible downside means keep looking, not write it up', () => {
  assert.match(gov, /keep looking/i)
  assert.match(gov, /compared in the abstract/i)
  // It offers the words to say, rather than only the rule.
  assert.match(gov, /what would it stop you\s*\n?doing\?/i)
})

test('ADRs are immutable — a reversal supersedes, never edits', () => {
  assert.match(gov, /immutable once accepted/i)
  assert.match(gov, /naming what it supersedes/i)
  assert.match(gov, /destroys the record of what was believed at the time/i)
})

test('every ADR rule must reach AGENT.md, or it governs nothing', () => {
  // The build agent reads AGENT.md, not the architecture folder.
  assert.match(gov, /A rule that lives\s*\n?only in the index governs nothing/i)
  assert.match(gov, /the build agent reads `AGENT.md`, not the architecture\s*\n?folder/i)
})

// --- No blank rows -------------------------------------------------------------------------

test('no row is left blank — "not needed" carries a reason and a trigger', () => {
  assert.match(gov, /No blank rows/i)
  assert.match(gov, /Revisit when:/i)
  assert.match(gov, /the difference between \*we decided\* and \*nobody\s*\n?looked\*/i)
})

test('an unlimited endpoint in front of a paid API is an unlimited invoice', () => {
  assert.match(gov, /rate-limited/i)
  assert.match(gov, /unlimited invoice/i)
})

test('a skipped specification records why', () => {
  assert.match(gov, /Skip them with the reason recorded/i)
  assert.match(gov, /only one of them\s*\n?is a decision/i)
})

// --- ADR-001: modules stay separate --------------------------------------------------------

test('governance rules live in governance.md, not in the question set', () => {
  // Naming what an answer BECOMES is fine; carrying the rule is not. ADR-001 forbids the
  // question set holding orchestration or structure, not the vocabulary of the project.
  assert.doesNotMatch(text, /Allow-only tests|seen to fail before it is trusted|build that fails/i,
    'the governance rules themselves belong in governance.md')
  assert.doesNotMatch(gov, /^## Q\d\./m, 'and questions do not belong in governance.md')
})
