// UTEST-031 — check 6 pairs a [TODO] with a question, rather than with the existence of one.
// Requirement: REQ-F-029 · BR-003 · BR-009 · FF-012.
//
// BUG-013. Check 6 is named "every [TODO] has a matching Q-### row" and ended in:
//
//     return !/\bQ-\d{3}\b/.test(near) && questions.size === 0
//
// `questions` was every Q-### anywhere in the workspace, so a single row made the second
// operand false and NOTHING was ever an orphan. Round 2 creates open-questions.md — so from
// the second round onwards the check passed unconditionally, on every workspace, forever.
//
// This is BUG-008's shape a third time: a check that exempts exactly the workspaces it was
// written to judge, and reports green while doing it. It was found by writing Round 2's
// output and noticing that check 6 would accept it no matter what went in the file.
//
// The tests below are all cases the old rule reported as passing.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CHECKS } from '../../ci/validation.mjs'

const doc = readFileSync('plugin/instructions/validation.md', 'utf8')

const check6 = (ws) => CHECKS[6].run(ws)

/** An open-questions file holding one real row. */
const openQuestions = (...rows) =>
  '# Open Questions\n\n| ID | Question | Why it matters | Decision owner | Must be answered before | Status |\n' +
  '|---|---|---|---|---|---|\n' +
  rows.map((r) => `| ${r} |\n`).join('')

test('UTEST-031: an unrelated Q-### row does NOT pair an unrelated [TODO]', () => {
  // The exact defect. Two facts about the same workspace — one question was recorded, one
  // different thing is unknown — were collapsed into "the workspace has questions, so it's
  // fine". A developer opening that TODO finds no owner and no deadline for it anywhere.
  const ws = {
    'spec/01-docs/01-intent/open-questions.md': openQuestions('Q-001 | Can a recipe exist with no ingredients? | Schema | Owner | Design | Open'),
    'spec/01-docs/01-intent/intent.md': '# Intent\n\n| Constraints | [TODO: what hard constraints already exist?] |\n',
  }
  const r = check6(ws)
  assert.equal(r.state, 'failed')
  assert.match(r.detail[0], /what hard constraints already exist/)
})

test('UTEST-031: a row asking the SAME question pairs it', () => {
  const ws = {
    'spec/01-docs/01-intent/open-questions.md': openQuestions('Q-001 | What hard constraints already exist? | Design ceiling | Owner | Design | Open'),
    'spec/01-docs/01-intent/intent.md': '# Intent\n\n| Constraints | [TODO: what hard constraints already exist?] |\n',
  }
  assert.equal(check6(ws).state, 'passed')
})

test('UTEST-031: matching survives line-wrapping, case, and trailing punctuation', () => {
  // The library hard-wraps at ~95 columns, so the same sentence is broken in one file and
  // whole in another. Comparing raw strings would call those two different questions — which
  // is line-wrap blindness, and it has caused nine defects in this repository.
  const ws = {
    'spec/01-docs/01-intent/open-questions.md': openQuestions(
      'Q-001 | Which capabilities are explicitly ruled out of version one? | Scope | Product owner | Design | Open'
    ),
    'spec/01-docs/01-intent/project-brief.md':
      '# Brief\n\n- [TODO: which capabilities are explicitly ruled\n  out of version one?]\n',
  }
  assert.equal(check6(ws).state, 'passed')
})

test('UTEST-031: a [TODO] citing its Q-### inline still pairs, with no row text to match', () => {
  // The other legitimate pairing, kept: an explicit reference beside the marker.
  const ws = { 'spec/x.md': '# X\n\nSee Q-004 below.\n\n| Retention | [TODO: how long is data kept?] |\n' }
  assert.equal(check6(ws).state, 'passed')
})

test('UTEST-031: with no questions recorded at all, an orphan is still an orphan', () => {
  // This case passed under the old rule ONLY because it also had no Q-###; the moment a
  // workspace grew its first question, the same TODO became acceptable. Same TODO, same
  // absence of an owner, opposite verdict.
  const ws = { 'spec/x.md': '# X\n\n| Retention | [TODO: how long is data kept?] |\n' }
  assert.equal(check6(ws).state, 'failed')
})

test('UTEST-031: every orphan is named, not counted', () => {
  const ws = {
    'spec/01-docs/01-intent/open-questions.md': openQuestions('Q-001 | Something else entirely | Why | Owner | Design | Open'),
    'spec/a.md': '# A\n\n[TODO: first unknown thing]\n',
    'spec/b.md': '# B\n\n[TODO: second unknown thing]\n',
  }
  const r = check6(ws)
  assert.equal(r.state, 'failed')
  assert.equal(r.detail.length, 2)
  assert.match(r.detail.join(' '), /first unknown thing/)
  assert.match(r.detail.join(' '), /second unknown thing/)
})

test('UTEST-031: a workspace with no [TODO] passes, and says what it checked against', () => {
  const ws = { 'spec/x.md': '# X\n\nEverything is decided.\n' }
  const r = check6(ws)
  assert.equal(r.state, 'passed')
  assert.match(r.detail[0] ?? '', /0 open questions/)
})

test('UTEST-031: the written rule says matching means matching', () => {
  assert.match(doc, /A `\[TODO\]` pairs with the question that asks it/i)
  assert.match(doc, /never with the mere existence of a question\s*\n?somewhere in the workspace/i)
})
