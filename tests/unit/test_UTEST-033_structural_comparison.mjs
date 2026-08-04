// UTEST-033 — what two runs of the same answers are allowed to disagree about.
// Requirement: TASK-016 · ADR-002 · ADR-003 · ADR-006.
//
// TASK-016: "Never diff a golden workspace byte-for-byte. ADR-002 makes output
// non-deterministic; assert structure, score quality."
//
// So there are two failure modes to guard against, and they are opposites. A comparison that
// gates too much fails on every run and gets switched off — and a switched-off check is worse
// than none, because the belief that it runs survives it. A comparison that gates too little
// passes a workspace someone typed by hand, which is the exact claim GOLD-001 makes in its
// header and has never been able to support.
//
// Every gated check below is also DEMONSTRATED FAILING. cicd-pipeline.md's own rule: "A check
// that has never been seen to fail is untested." Six of the last ten defects in this repository
// were checks that passed by matching nothing.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compare, fingerprint, firstDifference, idsByPrefix, loadWorkspace, CHANGE_LOG } from '../../ci/workspace.mjs'

const GOLDEN = loadWorkspace('tests/fixtures/golden/EV-001')

/** The golden workspace with one thing changed. Everything else stays byte-identical. */
const variant = (edits) => ({ ...GOLDEN, ...edits })

const kinds = (result) => result.gated.map((d) => d.kind).sort()

// --- The comparison of a workspace with itself ------------------------------------------------

test('UTEST-033: a workspace compared with itself has no gated difference', () => {
  const result = compare(GOLDEN, GOLDEN)
  assert.deepEqual(result.gated, [])
  assert.deepEqual(result.reported, [])
})

test('UTEST-033: rewording prose is not a difference', () => {
  // The whole point. ADR-002 makes this text non-deterministic, and a run that says the same
  // thing in different words has not done anything wrong.
  const intent = 'spec/01-docs/01-intent/intent.md'
  const reworded = GOLDEN[intent].replace(/home cooks/g, 'people who cook at home')
  const result = compare(variant({ [intent]: reworded }), GOLDEN)
  assert.deepEqual(result.gated, [], 'rewording must never gate')
})

// --- What IS gated, each demonstrated failing --------------------------------------------------

test('UTEST-033: a file the run did not produce is gated', () => {
  const { [`spec/README.md`]: _dropped, ...missing } = GOLDEN
  const result = compare(missing, GOLDEN)
  assert.deepEqual(kinds(result), ['missing-file'])
  assert.equal(result.gated[0].path, 'spec/README.md')
})

test('UTEST-033: a file the golden does not have is gated', () => {
  const result = compare(variant({ 'spec/01-docs/01-intent/notes.md': '# Notes\n' }), GOLDEN)
  assert.deepEqual(kinds(result), ['extra-file'])
})

test('UTEST-033: a changed heading outline is gated, and the divergence is located', () => {
  // ADR-003 step 1 copies the blueprint. Headings are not invented, so a different outline
  // means the file did not come through the fill procedure — the one thing worth knowing.
  const intent = 'spec/01-docs/01-intent/intent.md'
  const renamed = GOLDEN[intent].replace(/^## /m, '## Renamed ')
  const result = compare(variant({ [intent]: renamed }), GOLDEN)
  assert.deepEqual(kinds(result), ['headings'])
  assert.match(result.gated[0].detail, /outline diverges at heading \d+/)
})

test('UTEST-033: a heading that is only reordered is still gated', () => {
  // Order carries meaning in a specification, and `headings` returns them in order for exactly
  // this reason. A set comparison would call a reordered document identical.
  const intent = 'spec/01-docs/01-intent/intent.md'
  const lines = GOLDEN[intent].split('\n')
  const first = lines.findIndex((l) => /^## /.test(l))
  const second = lines.findIndex((l, i) => i > first && /^## /.test(l))
  const swapped = [...lines]
  ;[swapped[first], swapped[second]] = [swapped[second], swapped[first]]
  const result = compare(variant({ [intent]: swapped.join('\n') }), GOLDEN)
  assert.deepEqual(kinds(result), ['headings'])
})

test('UTEST-033: a back-link pointing at the wrong blueprint is gated', () => {
  const intent = 'spec/01-docs/01-intent/intent.md'
  const relinked = GOLDEN[intent].replace(/^> Blueprint: blueprints\/.+$/m, '> Blueprint: blueprints/elsewhere.md')
  const result = compare(variant({ [intent]: relinked }), GOLDEN)
  assert.deepEqual(kinds(result), ['back-link'])
  assert.match(result.gated[0].detail, /elsewhere\.md/)
})

test('UTEST-033: a run that accepted a different set of rounds is gated', () => {
  // Acceptance is a dated row and nothing else (ADR-006). A run that reached two rounds where
  // the golden reached three has not reproduced it, however good its two rounds are.
  const shortened = GOLDEN[CHANGE_LOG].split('\n')
    .filter((l) => !/Round 3 — users, roles, and data/.test(l))
    .join('\n')
  const result = compare(variant({ [CHANGE_LOG]: shortened }), GOLDEN)
  assert.deepEqual(kinds(result), ['accepted-stages'])
  assert.match(result.gated[0].detail, /Round 1[\s\S]*Round 3/)
})

// --- What is reported and never gated ----------------------------------------------------------

test('UTEST-033: more requirements than the golden is reported, not gated', () => {
  // Four capabilities can honestly become six requirements or eight. Gating this would gate a
  // judgement, and a check that fails on a legitimate judgement is a check people learn to
  // ignore. Same reason todo_density has no floor until ten real runs exist (Q-014).
  const reqs = 'spec/01-docs/02-requirements/requirements.md'
  const extra = `${GOLDEN[reqs]}\n| REQ-F-099 | One more requirement | Must |\n`
  const result = compare(variant({ [reqs]: extra }), GOLDEN)
  assert.deepEqual(result.gated, [], 'an extra requirement must not gate')
  assert.ok(
    result.reported.some((r) => r.path === reqs && /REQ-F \d+ -> \d+/.test(r.detail)),
    'but it must be visible'
  )
})

test('UTEST-033: a different number of [TODO] markers is reported, not gated', () => {
  const open = 'spec/01-docs/01-intent/open-questions.md'
  const result = compare(variant({ [open]: `${GOLDEN[open]}\n[TODO: one more unknown]\n` }), GOLDEN)
  assert.deepEqual(result.gated, [])
  assert.ok(result.reported.some((r) => /\[TODO\] markers: \d+ -> \d+/.test(r.detail)))
})

// --- The parts, on their own -------------------------------------------------------------------

test('UTEST-033: identifiers are counted per prefix, and dates are not identifiers', () => {
  assert.deepEqual(idsByPrefix('| REQ-F-001 | REQ-F-002 | REQ-NF-001 | 2026-08-04 |'), {
    'REQ-F': 2,
    'REQ-NF': 1,
  })
  assert.deepEqual(idsByPrefix('the same REQ-F-001 twice: REQ-F-001'), { 'REQ-F': 1 })
})

test('UTEST-033: firstDifference finds the shorter list running out', () => {
  assert.equal(firstDifference(['a', 'b'], ['a', 'b']), null)
  assert.equal(firstDifference(['a', 'b'], ['a']), 1)
  assert.equal(firstDifference(['a'], ['a', 'b']), 1)
  assert.equal(firstDifference([], []), null)
})

test('UTEST-033: the fingerprint reads how far the run got from the change log', () => {
  const print = fingerprint(GOLDEN)
  assert.equal(print.accepted.length, 3)
  assert.ok(print.files.includes('spec/README.md'))
  // No state file, anywhere, ever (ADR-004). The count came from a dated row in an artifact
  // the workspace already had to write.
  assert.deepEqual(
    print.files.filter((p) => /\.(json|ya?ml|lock)$/.test(p)),
    []
  )
})

test('UTEST-033: loading a workspace yields POSIX paths on every platform', () => {
  for (const path of Object.keys(GOLDEN)) assert.doesNotMatch(path, /\\/, `${path} carries a backslash`)
})
