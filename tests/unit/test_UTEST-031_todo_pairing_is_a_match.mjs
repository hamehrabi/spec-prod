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
  //
  // "Beside itself" means IN THE MARKER OR IN THE ROW THAT CARRIES IT, and the cited question
  // has to exist. This fixture used to put `See Q-004 below.` two lines above a marker with no
  // Q-004 row anywhere, and it passed — on 300 characters of proximity rather than on any
  // citation at all (UTEST-053). Byte distance is not a reference a reader can follow.
  const ws = {
    'spec/01-docs/01-intent/open-questions.md': openQuestions(
      'Q-004 | Retention period for a generated list | Storage cost | Owner | Design | Open'
    ),
    'spec/x.md': '# X\n\n| Retention | [TODO: how long is data kept? — Q-004] |\n',
  }
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

// --- BUG-014: a marker whose question has been answered ---------------------------------------

test('UTEST-031: a [TODO] whose question is already Answered FAILS as stale', () => {
  // Round 2 answers a question Round 1 wrote as a marker. If the marker stays, the workspace
  // holds a gap whose answer is three files away inside the same workspace. That is worse than
  // an open gap: it teaches the reader that markers mean nothing, and after that none of them
  // get read.
  const ws = {
    'spec/01-docs/01-intent/open-questions.md': openQuestions(
      'Q-001 | Which capabilities must exist in version one? | Everything downstream | Product owner | Design | Answered | Save a recipe, plan a week, generate one list, search'
    ),
    'spec/01-docs/01-intent/intent.md': '# Intent\n\n| Core capabilities | [TODO: which capabilities must exist in version one?] |\n',
  }
  const r = CHECKS[6].run(ws)
  assert.equal(r.state, 'failed')
  assert.match(r.detail[0], /Q-001 is already Answered — the marker is stale/)
})

test('UTEST-031: an Open question with the same text still pairs normally', () => {
  const ws = {
    'spec/01-docs/01-intent/open-questions.md': openQuestions(
      'Q-001 | Which capabilities must exist in version one? | Everything downstream | Product owner | Design | Open |'
    ),
    'spec/01-docs/01-intent/intent.md': '# Intent\n\n| Core capabilities | [TODO: which capabilities must exist in version one?] |\n',
  }
  assert.equal(CHECKS[6].run(ws).state, 'passed')
})

test('UTEST-031: the two failures are told apart, because the fixes are opposite', () => {
  // An orphan needs a question added. A stale marker needs the marker removed. A check that
  // reported both as "TODO problem" would send half its readers the wrong way.
  const ws = {
    'spec/01-docs/01-intent/open-questions.md': openQuestions(
      'Q-001 | Which capabilities must exist in version one? | Scope | Owner | Design | Answered | Four of them',
      'Q-002 | Something nobody marked | Why | Owner | Design | Open |'
    ),
    'spec/a.md': '# A\n\n[TODO: which capabilities must exist in version one?]\n',
    'spec/b.md': '# B\n\n[TODO: an entirely unrecorded unknown]\n',
  }
  const detail = CHECKS[6].run(ws).detail.join('\n')
  assert.match(detail, /already Answered — the marker is stale/)
  assert.match(detail, /an entirely unrecorded unknown\] has no Q-### row/)
})

test('UTEST-031: the count reported is OPEN questions, not every row', () => {
  // Otherwise a workspace that answered everything reports the same number as one that
  // answered nothing, and the line stops carrying information.
  const ws = {
    'spec/01-docs/01-intent/open-questions.md': openQuestions(
      'Q-001 | Answered thing | Why | Owner | Design | Answered | Yes',
      'Q-002 | Unanswered thing | Why | Owner | Design | Open |'
    ),
  }
  assert.match(CHECKS[6].run(ws).detail[0], /^1 open questions/)
})

test('UTEST-031: a later round may close a marker it answers, and only that', () => {
  const fill = readFileSync('plugin/instructions/fill.md', 'utf8')
  const coverage = readFileSync('plugin/instructions/coverage.md', 'utf8')

  assert.match(fill, /Step 4's other half — closing a marker a later round answers/i)
  assert.match(fill, /that round replaces it, in the file where\s*\n?it sits, and changes nothing else in that file/i)
  assert.match(fill, /flips the paired `Q-###` row to\s*\n?\*Answered\*/i)

  // The permission is bounded, and the bound is the point — a round that rewrites a
  // neighbouring decision is editing an accepted round, which review.md forbids.
  assert.match(coverage, /The one thing a round does outside its own directories/i)
  assert.match(coverage, /Not tidy the file, not revise the row beside it/i)
  assert.match(coverage, /editing an accepted\s*\n?round, which `instructions\/review\.md` forbids/i)
})
