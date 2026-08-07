// UTEST-066 — an identifier being described is not an identifier being used.
// Requirement: BR-009 · BR-010 · BUG-032.
//
// Two more checks that failed the first eight-round workspace for content that was correct, and
// both turn on the same distinction FF-018 draws about paths: a citation is a promise that
// something exists, an example is a thing being talked about.
//
// Check 1 read "Test ID | Unique identifier such as `TEST-001`" as a reference to a test called
// TEST-001. That sentence is kept blueprint prose in the test-plan template, so it ships into
// EVERY workspace — the check could not pass a complete run, ever.
//
// Check 2 read every row of `traceability-review.md` as a second definition of the requirement
// it reviews. Its columns are "Has design decision? | Has task? | Has test? | Has code link? |
// Reviewed?" — a checklist whose subject is the identifier in column one.
//
// Both directions are tested. A check that stops reporting duplicates is worse than one that
// over-reports, because the over-reporting kind gets argued with and the silent kind does not.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CHECKS } from '../../ci/validation.mjs'

const back = '\n> Blueprint: blueprints/x.md\n'

// --- Check 1: a format example is not a citation -----------------------------------------------

test('UTEST-066: an ID shown as a format example is not a dangling reference', () => {
  const ws = { 'spec/a.md': `# Fields\n\n| Test ID | Unique identifier such as \`TEST-001\`. |${back}` }
  assert.equal(CHECKS[1].run(ws).state, 'passed')
})

test('UTEST-066: the other introducing phrases work too', () => {
  for (const lead of ['such as', 'e.g.', 'eg', 'for example', 'like'])
    assert.equal(
      CHECKS[1].run({ 'spec/a.md': `An identifier ${lead} \`REQ-F-042\` goes here.${back}` }).state,
      'passed',
      `"${lead}" was not recognised as introducing an example`
    )
})

test('UTEST-066: a genuinely dangling reference still fails', () => {
  // The direction that matters. If the exemption were loose, a real missing definition would
  // hide behind any stray "for example" on the line.
  assert.equal(CHECKS[1].run({ 'spec/a.md': `This is blocked on REQ-F-042.${back}` }).state, 'failed')
})

test('UTEST-066: a defined identifier is still recognised through the exemption', () => {
  // Stripping examples must not strip DEFINITIONS. The definition scan reads the original text
  // for exactly this reason — an ID defined in a row that also says "such as" would otherwise
  // vanish and every reference to it would dangle.
  const ws = { 'spec/a.md': `| REQ-F-042 | Save a recipe, such as REQ-F-041 does | Must |\n\nSee REQ-F-042.${back}` }
  assert.equal(CHECKS[1].run(ws).state, 'passed')
})

// --- Check 2: a review table reviews, it does not define ---------------------------------------

const REVIEW =
  '| Req ID | Has design decision? | Has task? | Has test? | Reviewed? | Gap |\n' +
  '|---|---|---|---|---|---|\n' +
  '| REQ-F-001 | ✔ | ✔ | ✔ | ✘ | Blocked on Q-006 (auth) |\n'

test('UTEST-066: a table of questions about an ID is not a second definition', () => {
  const ws = {
    'spec/requirements.md': `| REQ-F-001 | Save a recipe with its ingredients | Must |${back}`,
    'spec/review.md': `# Review\n\n${REVIEW}${back}`,
  }
  assert.equal(CHECKS[2].run(ws).state, 'passed')
})

test('UTEST-066: two real definitions are still caught', () => {
  // The whole point of check 2. One requirement, two documents each stating what it is, is how
  // a workspace comes to contradict itself without anyone editing anything.
  const head = '| ID | Requirement | Priority |\n|---|---|---|\n'
  const ws = {
    'spec/a.md': `${head}| REQ-F-001 | Save a recipe with its ingredients | Must |${back}`,
    'spec/b.md': `${head}| REQ-F-001 | Save a recipe and its photograph | Must |${back}`,
  }
  assert.equal(CHECKS[2].run(ws).state, 'failed')
})

test('UTEST-066: one question header is not enough to excuse a table', () => {
  // Two or more, because a definition table can legitimately carry a single question column —
  // "Blocking?" or "Agreed?" — and excusing on one would switch check 2 off wholesale.
  const ws = {
    'spec/a.md': `| ID | Requirement | Priority |\n|---|---|---|\n| REQ-F-001 | Save a recipe with its ingredients | Must |${back}`,
    'spec/b.md': `| Req ID | Description | Blocking? |\n|---|---|---|\n| REQ-F-001 | Save a recipe and its photograph | yes |${back}`,
  }
  assert.equal(CHECKS[2].run(ws).state, 'failed')
})
