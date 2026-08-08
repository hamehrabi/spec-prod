// UTEST-096 — an identifier inside a multi-word code span is an illustration, not a citation.
// Requirement: REQ-F-042 · BR-009 · UTEST-094/095's line, arriving at inline code.
//
// The version-control checklist keeps a weak-vs-better commit-message table:
//
//   | `update login` | `feat(auth): add login validation for REQ-AUTH-002` |
//
// Four invented ids across three rows, each inside a backticked phrase, each an illustration
// of a commit style — and check 1 reported all four as dangling references on a run that kept
// the blueprint's table faithfully (the third e2e verification run, 2026-08-08).
//
// The rule is NARROW on purpose: only spans containing whitespace are quotation. A lone
// backticked id — `Q-018`, the kit's normal citation style — keeps counting, so a real
// dangler written the normal way is still reported.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CHECKS } from '../../ci/validation.mjs'

const back = '\n> Blueprint: blueprints/x.md\n'

test('UTEST-096: a commit-message example citing an invented id is not a dangler', () => {
  const ws = {
    'spec/a.md': '# A\n\n| Weak | Better |\n|---|---|\n| `update login` | `feat(auth): add login validation for REQ-AUTH-002` |\n' + back,
  }
  assert.equal(CHECKS[1].run(ws).state, 'passed')
})

test('UTEST-096: a LONE backticked id still dangles — the narrowing is the point', () => {
  const ws = { 'spec/a.md': '# A\n\nThis work is blocked on `REQ-AUTH-002`.\n' + back }
  const r = CHECKS[1].run(ws)
  assert.equal(r.state, 'failed')
  assert.match(r.detail.join(' '), /REQ-AUTH-002/)
})

test('UTEST-096: a bare id outside any code span still dangles', () => {
  const ws = { 'spec/a.md': '# A\n\nBlocked on REQ-AUTH-002.\n' + back }
  assert.equal(CHECKS[1].run(ws).state, 'failed')
})

test('UTEST-096: a quoted phrase does not hide a bare dangler on the same line', () => {
  const ws = {
    'spec/a.md': '# A\n\nUse `feat(auth): follow REQ-AUTH-002 style` and finish REQ-PROJ-003.\n' + back,
  }
  const r = CHECKS[1].run(ws)
  assert.equal(r.state, 'failed')
  assert.match(r.detail.join(' '), /REQ-PROJ-003/, 'the bare reference is still reported')
  assert.doesNotMatch(r.detail.join(' '), /REQ-AUTH-002/, 'the quoted one is not')
})
