// ETEST-009 ×8 — interrupt at each stage, re-run, resume there. This is FF-003, and the
// reliability driver's measure is literally 8/8.
// ATEST-032, UTEST-021, FTEST-001, FTEST-011, FTEST-016.
// Requirement: REQ-F-028, REQ-NF-003, ADR-004.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { derive, stageStatus, suspectFiles, ABSENT, PARTIAL, WRITTEN, COMPLETE } from '../../ci/resume.mjs'
import { forbiddenStateFiles } from '../../ci/acceptance.mjs'

const resumeDoc = readFileSync('plugin/instructions/resume.md', 'utf8')
const intake = readFileSync('plugin/instructions/intake.md', 'utf8')

// Eight stages, three artifacts each. Shapes the derivation, not the real round contents —
// rounds 2-8 are not built, and inventing their file lists here would be a guess that later
// tasks would have to unpick.
const STAGES = Array.from({ length: 8 }, (_, i) => ({
  name: `Round ${i + 1}`,
  artifacts: [`spec/r${i + 1}/a.md`, `spec/r${i + 1}/b.md`, `spec/r${i + 1}/c.md`],
}))

const allOf = (n) => STAGES.slice(0, n).flatMap((s) => s.artifacts)
const acceptedThrough = (n) =>
  STAGES.slice(0, n).map((s, i) => `| 2026-08-0${i + 1} | ${s.name} — done | Developer | ok |`).join('\n')

// --- ETEST-009 ×8: the reliability measure ----------------------------------------------

for (let n = 1; n <= 8; n += 1) {
  test(`ETEST-009 (${n}/8): interrupted mid-stage ${n} → resumes at stage ${n}, not past it`, () => {
    // Stages 1..n-1 complete and accepted; stage n half written — the shape of a session
    // that ended while writing.
    const files = [...allOf(n - 1), STAGES[n - 1].artifacts[0]]
    const result = derive(STAGES, files, acceptedThrough(n - 1))

    assert.equal(result.resumeAt, `Round ${n}`, 'must continue exactly where it stopped')
    assert.equal(result.statuses[n - 1].status, PARTIAL)
    assert.match(result.action, /redo this stage from its start/)
    for (let i = 0; i < n - 1; i += 1) {
      assert.equal(result.statuses[i].status, COMPLETE, `Round ${i + 1} must not be re-asked`)
    }
  })
}

// --- The state a two-state check would miss ---------------------------------------------

for (let n = 1; n <= 8; n += 1) {
  test(`ETEST-014 (${n}/8): written but never accepted → the GATE is re-presented`, () => {
    // Every file of stage n exists; the session ended before the developer accepted it.
    const result = derive(STAGES, allOf(n), acceptedThrough(n - 1))
    assert.equal(result.statuses[n - 1].status, WRITTEN)
    assert.equal(result.resumeAt, `Round ${n}`)
    assert.match(result.action, /re-present this stage's acceptance gate/)
    assert.match(result.action, /do not re-ask, do not advance/)
  })
}

// --- ATEST-032 / FTEST-016 ---------------------------------------------------------------

test('ATEST-032: complete through Round 4 → reports 1–4 done and asks Round 5', () => {
  const result = derive(STAGES, allOf(4), acceptedThrough(4))
  assert.equal(result.resumeAt, 'Round 5')
  assert.equal(result.action, 'ask this round')
  assert.deepEqual(result.statuses.slice(0, 4).map((s) => s.status), Array(4).fill(COMPLETE))
  assert.equal(result.statuses[4].status, ABSENT)
})

test('FTEST-016: re-running a complete workspace changes nothing', () => {
  const result = derive(STAGES, allOf(8), acceptedThrough(8))
  assert.equal(result.resumeAt, null)
  assert.match(result.action, /the workspace is complete/)
})

test('the empty case is a normal outcome, not an error', () => {
  const result = derive(STAGES, [], '')
  assert.equal(result.isEmpty, true)
  assert.equal(result.resumeAt, 'Round 1')
  assert.match(resumeDoc, /No workspace found — starting a new intake at Round 1/)
  assert.match(resumeDoc, /stated positively/i)
})

// --- UTEST-021: partial detection ---------------------------------------------------------

test('UTEST-021: a stage with some files but not all is incomplete', () => {
  const stage = { name: 'Round 3', artifacts: ['a.md', 'b.md', 'c.md', 'd.md'] }
  assert.equal(stageStatus(stage, ['a.md', 'b.md', 'c.md']), PARTIAL, '3 of 4 is not done')
  assert.equal(stageStatus(stage, []), ABSENT)
  assert.equal(stageStatus(stage, ['a.md', 'b.md', 'c.md', 'd.md']), WRITTEN, 'all files, no acceptance row')
})

test('FTEST-001: an earlier partial stage is finished before anything later is touched', () => {
  // Round 2 half-written, Rounds 3-4 fully written. Resuming at 3 would leave a hole behind
  // it and call the workspace done.
  const files = [...allOf(1), STAGES[1].artifacts[0], ...STAGES[2].artifacts, ...STAGES[3].artifacts]
  const result = derive(STAGES, files, acceptedThrough(1))
  assert.equal(result.resumeAt, 'Round 2', 'the hole is filled first, never skipped past')
})

// --- ADR-004: no state file, verified by listing ------------------------------------------

test('ADR-004: resuming needs no state file — the workspace listing stays clean', () => {
  // The review checklist requires this be verified by a file listing, not by reading the
  // instructions. The derivation's only inputs are the artifact list and the change log.
  const workspace = [...allOf(8), 'spec/01-docs/09-change-control/spec-change-log.md']
  assert.deepEqual(forbiddenStateFiles(workspace), [])
  const result = derive(STAGES, workspace, acceptedThrough(8))
  assert.equal(result.resumeAt, null, 'position derived from those two inputs alone')
})

test('ADR-004: the instructions forbid a cache as well as a state file', () => {
  assert.match(resumeDoc, /no state file/i)
  assert.match(resumeDoc, /A cache is a state file wearing a hat/i)
  assert.match(intake, /There is no state file and never will be/i)
})

// --- Hand-edits ---------------------------------------------------------------------------

test('a hand-edited workspace is reported and asked about, never overwritten', () => {
  const contents = {
    'spec/ok.md': '# Fine\n\n> Blueprint: blueprints/ok.md\n',
    'spec/stripped.md': '# Someone removed the back-link\n',
    'spec/empty.md': '   \n',
  }
  assert.deepEqual(suspectFiles(contents).sort(), ['spec/empty.md', 'spec/stripped.md'])
  assert.match(resumeDoc, /Never silently overwrite them|never silently overwrite/i)
  // The limit is stated rather than papered over.
  assert.match(resumeDoc, /What is not detectable/i)
  assert.match(resumeDoc, /ask rather than to guess/i)
})
