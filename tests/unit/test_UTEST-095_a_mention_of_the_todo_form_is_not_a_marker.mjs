// UTEST-095 — a MENTION of the `[TODO: ...]` form is not a use of it.
// Requirement: BR-003 · FF-012 · the BUG-036 payload fixes' own teaching notes.
//
// The citation-rule notes added to the blueprints quote the marker to teach it — "leave the
// sanctioned marker naming the question — the same `[TODO: ...]` form every other unknown
// uses." The first workspace produced after those notes shipped was reported by check 6 as
// carrying two orphan TODOs, and both were this sentence: the checker read a quotation of the
// form as an instance of it, in two files, on a workspace whose one REAL marker in each file
// was correctly paired with its Q-### row.
//
// Two shapes mark a mention, and `todos()` now skips both:
//   - the marker wrapped in INLINE BACKTICKS — prose quoting code
//   - content of bare `...` / `…` — the form's own placeholder, which by BR-003 can never be
//     a real marker because it names no question
//
// FENCES ARE DELIBERATELY NOT EXCLUDED. The entry point's five real markers live inside its
// command fence, and excluding fences would uncount the exact markers BUG-035 exists to keep
// visible. The mention rule is positional-and-content, not structural.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { todos } from '../../ci/fill.mjs'
import { CHECKS } from '../../ci/validation.mjs'

const back = '\n> Blueprint: blueprints/x.md\n'

test('UTEST-095: the teaching sentence yields no marker', () => {
  const note = '> Until it does, leave the sanctioned marker naming the question — the same `[TODO: ...]` form every other unknown uses.'
  assert.deepEqual(todos(note), [])
})

test('UTEST-095: bare-ellipsis content is a mention even without backticks', () => {
  assert.deepEqual(todos('the [TODO: ...] form'), [])
  assert.deepEqual(todos('the [TODO: …] form'), [])
})

test('UTEST-095: a real marker inside a fence is still counted — the entry point depends on it', () => {
  const entry = '```\ninstall: [TODO: ask the team — the dependency install command (Q-018)]\n```\n'
  assert.deepEqual(todos(entry), ['ask the team — the dependency install command (Q-018)'])
})

test('UTEST-095: a real marker with a real question is still a marker', () => {
  assert.deepEqual(todos('[TODO: what is the retention period?]'), ['what is the retention period?'])
})

test('UTEST-095: check 6 passes on a file whose only [TODO] is the quotation', () => {
  const ws = {
    'spec/a.md': `# A\n\n> leave the sanctioned marker — the same \`[TODO: ...]\` form every other unknown uses.\n${back}`,
  }
  assert.equal(CHECKS[6].run(ws).state, 'passed')
})

test('UTEST-095: and a REAL orphan marker beside the quotation still fails', () => {
  // The direction that matters: the mention rule must not shelter an actual orphan.
  const ws = {
    'spec/a.md': `# A\n\n> the same \`[TODO: ...]\` form every other unknown uses.\n\n[TODO: which cache backend do we use?]\n${back}`,
  }
  const r = CHECKS[6].run(ws)
  assert.equal(r.state, 'failed')
})
