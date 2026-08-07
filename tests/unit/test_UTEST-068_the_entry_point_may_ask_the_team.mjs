// UTEST-068 — the entry point's two sanctioned markers have no question row by design.
// Requirement: BR-003 · BR-009 · BR-010 · BUG-035.
//
// The fourth check found failing correct work on the first complete workspace this kit ever
// produced, and the one where the instructions had said so all along. `entrypoint.md` writes
// both forms in as many words:
//
//   "An unknown command is `[TODO: ask the team - <the exact question>]`, never a guess."
//   "If it cannot be read, write `[TODO: plugin version could not be determined]`."
//
// Neither is an open SPECIFICATION question. One is addressed to the developer's colleagues and
// the other to a file on disk, so neither belongs in `open-questions.md` — which carries a
// decision owner and the round that will close it. The run obeyed the instruction and check 6
// called it an orphan.
//
// The direction is what makes it a defect rather than a curiosity. The repair a reader makes
// from "has no Q-### row" is to file a question for a decision already assigned to TASK-001,
// and then two records disagree about who chooses the stack.
//
// NARROW ON PURPOSE: the form AND the file. "Any marker beginning 'ask the team'" would hand
// every round a phrase that switches this check off, which is precisely how BUG-013 worked —
// so the tests below spend more effort on what is still caught than on what is excused.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CHECKS } from '../../ci/validation.mjs'

const back = '\n> Blueprint: blueprints/x.md\n'
const QROW = (id, q) => `| ID | Question | Status |\n|---|---|---|\n| ${id} | ${q} | Open |${back}`

// --- What is excused ---------------------------------------------------------------------------

test('UTEST-068: the entry point may say "ask the team" without a Q-### row', () => {
  const ws = {
    'spec/CLAUDE.md': '# Start here\n\n| Commands | [TODO: ask the team — the test and lint commands are not chosen yet.] |\n',
  }
  assert.equal(CHECKS[6].run(ws).state, 'passed')
})

test('UTEST-068: and may record a version it could not read', () => {
  const ws = { 'spec/CLAUDE.md': '# Start here\n\nBuilt with [TODO: plugin version could not be determined].\n' }
  assert.equal(CHECKS[6].run(ws).state, 'passed')
})

// --- What is still caught, which is the half that matters --------------------------------------

test('UTEST-068: the SAME words in any other file are still an orphan', () => {
  // The file is half the rule. `entrypoint.md` is the only instruction that writes either form,
  // and it writes them only into the entry point — so a round using the phrase in a
  // specification document is dodging the pairing rule, not obeying an instruction.
  const ws = { 'spec/01-docs/01-intent/intent.md': `> [TODO: ask the team — what is the SLA?]${back}` }
  assert.equal(CHECKS[6].run(ws).state, 'failed')
})

test('UTEST-068: an ordinary marker in the entry point still needs its row', () => {
  // The other half. The exemption is two named forms, not the file — a [TODO] the entry point
  // raises about the specification is an open question like any other.
  const ws = { 'spec/CLAUDE.md': '# Start here\n\n[TODO: which data store was chosen?]\n' }
  assert.equal(CHECKS[6].run(ws).state, 'failed')
  assert.match(CHECKS[6].run(ws).detail[0], /has no Q-### row/)
})

test('UTEST-068: "ask the team" must START the marker, not appear in it', () => {
  // Otherwise the phrase becomes a suffix anyone can append to any question to silence the
  // check — the BUG-013 failure mode, arriving as an exemption instead of as a guard clause.
  const ws = { 'spec/CLAUDE.md': '# Start here\n\n[TODO: which data store was chosen? ask the team]\n' }
  assert.equal(CHECKS[6].run(ws).state, 'failed')
})

test('UTEST-068: a stale marker in the entry point is still reported', () => {
  // The exemption skips the marker entirely, so it must not accidentally cover the OTHER thing
  // check 6 reports. A question answered elsewhere leaves a marker its own workspace
  // contradicts, and that is worse than an open one (BUG-014).
  const ws = {
    'spec/CLAUDE.md': '# Start here\n\n[TODO: which data store was chosen? — Q-004]\n',
    'spec/q.md': `| ID | Question | Status |\n|---|---|---|\n| Q-004 | which data store was chosen? | Answered |${back}`,
  }
  const r = CHECKS[6].run(ws)
  assert.equal(r.state, 'failed')
  assert.match(r.detail[0], /Q-004 is already Answered — the marker is stale/)
})

test('UTEST-068: the exemption does not blind the check to the rest of the workspace', () => {
  // An entry point carrying an excused marker, and a real orphan two files away. If the skip
  // were implemented per FILE rather than per MARKER, the second one would go unreported.
  const ws = {
    'spec/CLAUDE.md': '# Start here\n\n[TODO: ask the team — the run command is not chosen yet.]\n',
    'spec/a.md': `> [TODO: what is the monitoring appetite?]${back}`,
    'spec/q.md': QROW('Q-001', 'something else entirely'),
  }
  const r = CHECKS[6].run(ws)
  assert.equal(r.state, 'failed')
  assert.equal(r.detail.length, 1)
  assert.match(r.detail[0], /^spec\/a\.md/)
})

test('UTEST-068: a normally-paired marker in the entry point still passes on its row', () => {
  // The exemption is a skip, not a replacement — the ordinary pairing route must still work
  // from `spec/CLAUDE.md`, or the entry point would have exactly two legal markers.
  const ws = {
    'spec/CLAUDE.md': '# Start here\n\n[TODO: which data store was chosen?]\n',
    'spec/q.md': QROW('Q-004', 'which data store was chosen?'),
  }
  assert.equal(CHECKS[6].run(ws).state, 'passed')
})
