// UTEST-094 — an identifier inside a fenced block is an illustration, not a citation.
// Requirement: REQ-F-042 · BR-009 · BUG-017's line, arriving at check 1 last.
//
// The traceability blueprint keeps a fenced "Linking pattern" that walks the whole chain on
// `REQ-AUTH-001` — requirement to decision to task to test — as a worked shape the developer
// copies. The first run to keep that fence FAITHFULLY (which is what the fill is told to do)
// was reported by check 1 for a dangling identifier that exists only as the illustration.
//
// Check 5 learned this distinction in BUG-017 ("a placeholder inside a fenced block is not a
// gap"), and tableRows() applies it to every table check. Check 1 scanned raw text. The fix
// strips fences from the REFERENCE scan only — definitions are still read everywhere, so the
// change can only make check 1 quieter about a fence, never louder.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CHECKS } from '../../ci/validation.mjs'

const back = '\n> Blueprint: blueprints/x.md\n'
const fence = (body) => '```\n' + body + '\n```\n'

test('UTEST-094: a fenced example citing an undefined identifier is not a dangler', () => {
  const ws = {
    'spec/a.md': `# Traceability\n\n${fence('Requirement ID: REQ-AUTH-001\nRequirement: A registered user must be able to sign in.')}${back}`,
  }
  assert.equal(CHECKS[1].run(ws).state, 'passed')
})

test('UTEST-094: the same identifier cited in PROSE still dangles', () => {
  // The direction that matters — stripping fences must not switch the check off.
  const ws = { 'spec/a.md': `# A\n\nThis work is blocked on REQ-AUTH-001.\n${back}` }
  const r = CHECKS[1].run(ws)
  assert.equal(r.state, 'failed')
  assert.match(r.detail.join(' '), /REQ-AUTH-001/)
})

test('UTEST-094: prose beside a fence is still scanned — the strip removes the fence alone', () => {
  const ws = {
    'spec/a.md': `# A\n\n${fence('Requirement ID: REQ-AUTH-001')}\nAnd the rollout is blocked on ITEST-999.\n${back}`,
  }
  const r = CHECKS[1].run(ws)
  assert.equal(r.state, 'failed')
  assert.match(r.detail.join(' '), /ITEST-999/, 'the dangler outside the fence is still reported')
  assert.doesNotMatch(r.detail.join(' '), /REQ-AUTH-001/, 'the illustration inside it is not')
})

test('UTEST-094: a definition inside a fence still counts, so the change is one-directional', () => {
  // Definitions are scanned everywhere. A fence that happens to carry the only definition of
  // an id keeps every citation of it resolving — quieter about fences, never louder.
  const ws = {
    'spec/a.md': `# A\n\n${fence('| REQ-F-001 | A saved item persists. |')}\nDelivery traces to REQ-F-001.\n${back}`,
  }
  assert.equal(CHECKS[1].run(ws).state, 'passed')
})
