// UTEST-093 — every identifier the library mints is one the checks can see.
// Requirement: REQ-F-042 · BR-009 · BR-010 · BUG-044.
//
// `ci/validation.mjs` carries one regex naming every identifier class the checks understand. It
// read `[UAEFSP]?TEST` — unit, acceptance, end-to-end, failure, security, performance, and bare
// TEST — and left out `I` for integration.
//
// ITEST is the MOST-USED test prefix there is: 41 occurrences in the first complete produced
// workspace, more than FTEST, UTEST or ATEST. So the commonest test identifier in the product
// was invisible to every check built on that pattern.
//
// WHAT IT COST. Check 1 could not have reported a dangling `ITEST-999`. And check 2 undercounted
// a citation row: `| REQ-F-001 | Save a recipe with ingredients | ATEST-001, ITEST-001 |` in
// `deployment-plan.md` carries TWO other identifiers and should be read as a citation, but only
// one matched, so the row was counted as a second DEFINITION and reported as a duplicate on
// every workspace the kit produced. I had already decided to leave that report alone as a known
// heuristic limitation — the check was right about its own rule and wrong about the alphabet,
// and the two look identical from the outside.
//
// So this test does not check the regex against a list somebody typed. It DERIVES the alphabet
// from the shipped library, which is the only source that cannot drift from what the kit
// actually mints.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CHECKS } from '../../ci/validation.mjs'
import { library, blueprintText } from '../../ci/golden.mjs'

const back = '\n> Blueprint: blueprints/x.md\n'

/** Every `PREFIX-###` shape the shipped blueprints actually contain. */
const mintedInLibrary = () => {
  const seen = new Set()
  for (const rel of library()) {
    const t = blueprintText(rel)
    if (t === null) continue
    for (const m of t.matchAll(/\b([A-Z][A-Z-]{1,8})-\d{3}\b/g)) seen.add(m[1])
  }
  return seen
}

test('UTEST-093: every test-id prefix in the library is visible to the checks', () => {
  // Test prefixes only — those are the class that grew a member and lost one. A general sweep
  // would drag in the worked examples' invented ids and drown the signal.
  const prefixes = [...mintedInLibrary()].filter((p) => p.endsWith('TEST'))
  assert.ok(prefixes.length >= 6, `only ${prefixes.length} test prefixes found — the library scan is reading nothing`)

  // Check 1 reports an identifier it can SEE and cannot resolve. A prefix the pattern does not
  // match produces no report at all, which is silence rather than a pass.
  for (const p of prefixes) {
    const ws = { 'spec/a.md': `This work is blocked on ${p}-999.${back}` }
    const r = CHECKS[1].run(ws)
    assert.equal(r.state, 'failed', `${p}-999 dangles and check 1 said nothing — ${p} is not in the ID alphabet`)
    assert.match(r.detail.join(' '), new RegExp(`${p}-999`), `${p}-999 was not named in the report`)
  }
})

test('UTEST-093: ITEST specifically, because it is the one that was missing', () => {
  assert.equal(CHECKS[1].run({ 'spec/a.md': `Blocked on ITEST-999.${back}` }).state, 'failed')
})

test('UTEST-093: a row citing two tests is a citation, not a second definition', () => {
  // The deployment-plan shape, which was reported as a duplicate on every produced workspace
  // because only one of its two citations matched the alphabet.
  const head = '| Req ID | Requirement | Test evidence |\n|---|---|---|\n'
  const ws = {
    'spec/requirements.md': `| ID | Requirement | Priority |\n|---|---|---|\n| REQ-F-001 | A home cook must be able to save a recipe with its ingredient lines. | Must |${back}`,
    'spec/deployment-plan.md': `${head}| REQ-F-001 | Save a recipe with ingredients | ATEST-001, ITEST-001 |${back}`,
  }
  assert.equal(CHECKS[2].run(ws).state, 'passed')
})

test('UTEST-093: and one citing only ONE other id is still a definition', () => {
  // The exemption is "two or more identifiers in the other cells". Widening it to one would
  // excuse any row that happened to mention a test, which is most rows in a test plan.
  const head = '| Req ID | Requirement | Test evidence |\n|---|---|---|\n'
  const ws = {
    'spec/requirements.md': `| ID | Requirement | Priority |\n|---|---|---|\n| REQ-F-001 | A home cook must be able to save a recipe with its ingredient lines. | Must |${back}`,
    'spec/deployment-plan.md': `${head}| REQ-F-001 | Save a recipe with ingredients here | ATEST-001 |${back}`,
  }
  assert.equal(CHECKS[2].run(ws).state, 'failed')
})

test('UTEST-093: a real duplicate is still caught for every prefix', () => {
  // The direction that matters. Making the alphabet wider must not make check 2 quieter.
  const head = '| Test ID | Requirement | Scenario | Expected result |\n|---|---|---|---|\n'
  for (const p of ['ITEST', 'UTEST', 'ATEST']) {
    const ws = {
      'spec/a.md': `${head}| ${p}-002 | REQ-F-004 | Generate the shopping list for a week | One list row per ingredient |${back}`,
      'spec/b.md': `${head}| ${p}-002 | REQ-F-004 | Generate a list from the weekly plan | A single consolidated list |${back}`,
    }
    assert.equal(CHECKS[2].run(ws).state, 'failed', `${p}-002 defined twice was not reported`)
  }
})
