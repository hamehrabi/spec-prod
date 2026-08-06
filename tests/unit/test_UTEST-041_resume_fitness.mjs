// UTEST-041 — FF-003, the deterministic half of the resume measure.
// Requirement: REQ-NF-003 · REQ-F-028 · ADR-004 · ADR-006 · BR-009 · fitness-functions.md.
//
// FF-003's register entry is operational — eight live interrupted intakes — and this repository
// cannot run it on a merge. The danger in wiring it up anyway is not that the check is weak; it
// is that a green line claims eight stages when four were walked. So the assertions below are in
// two halves, and the second half is the point:
//
//   1. the check finds what it should, and is seen to FAIL on a workspace that has the fault
//   2. every stage it did not exercise is reported as NOT RUN, by name, and the report cannot be
//      read as 8/8
//
// Each check is demonstrated BOTH ways, for the reason cicd-pipeline.md gives: a check that has
// never been seen to fail is untested. Six of the last twelve defects here were checks that
// passed by matching nothing, and the shape of every one of them was a threshold met over an
// empty set.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { run, check } from '../_helpers.mjs'
import { stages } from '../../ci/ff-003-resume.mjs'

const FF = 'ff-003-resume.mjs'
const STAGES = stages()
const LOG = 'spec/01-docs/09-change-control/spec-change-log.md'

/** A golden root holding one case, with whatever files a test needs. UTEST-037's pattern. */
function goldenSet(files) {
  const root = mkdtempSync(join(tmpdir(), 'ff-golden-'))
  for (const [rel, text] of Object.entries(files)) {
    const full = join(root, 'EV-TEST', rel)
    mkdirSync(dirname(full), { recursive: true })
    writeFileSync(full, text)
  }
  return { root, cleanup: () => rmSync(root, { recursive: true, force: true }) }
}

const onSet = (files) => {
  const set = goldenSet(files)
  try {
    return run(check(FF), [set.root])
  } finally {
    set.cleanup()
  }
}

/** The acceptance table, with whatever rows a test wants in it. */
const changeLog = (rows) =>
  ['# Specification Change Log', '', '| Date | Stage or type | Artifact | Note or reason |', '|---|---|---|---|', ...rows, ''].join('\n')

const acceptRow = (n, label = `Round ${n} — a title`) => `| 2026-08-0${n} | ${label} | — | accepted |`

/**
 * A workspace with rounds 1..n fully written and accepted.
 *
 * The file set comes from `stages()` rather than from a list written here, so this fixture stays
 * true when the round map changes. A hand-written list would go stale silently and turn every
 * assertion below into a NOT RUN nobody reads.
 */
function through(n, { rows = STAGES.slice(0, n).map((s) => acceptRow(s.n)), extra = {} } = {}) {
  const files = {}
  for (const s of STAGES.slice(0, n)) for (const a of s.artifacts) files[a] = `# ${a}\n\n> Blueprint: blueprints/x.md\n`
  return { ...files, [LOG]: changeLog(rows), ...extra }
}

// --- Nothing to walk is NOT RUN, never a pass -------------------------------------------------

test('UTEST-041: no golden workspace is NOT RUN, and exits 2', () => {
  const empty = mkdtempSync(join(tmpdir(), 'ff-empty-'))
  try {
    const { code, stdout } = run(check(FF), [empty])
    assert.equal(code, 2)
    assert.match(stdout, /RESULT: NOT RUN/)
    assert.doesNotMatch(stdout, /RESULT: pass/)
  } finally {
    rmSync(empty, { recursive: true, force: true })
  }
})

test('UTEST-041: a workspace that reaches no stage is NOT RUN, and exits 2', () => {
  // The failure this whole check is shaped around: a workspace exists, so the walk "ran", and
  // zero violations over zero exercised stages reads exactly like eight stages passing.
  const { code, stdout } = onSet({ 'spec/notes.md': '# Nothing a round owns\n' })
  assert.equal(code, 2)
  assert.match(stdout, /RESULT: NOT RUN — no stage could be exercised from EV-TEST/)
  assert.doesNotMatch(stdout, /RESULT: pass/)
})

// --- Partial coverage is reported as partial ---------------------------------------------------

test('UTEST-041: three stages walked reports three, names the other five, and is not 8/8', () => {
  const { code, stdout } = onSet(through(3))
  assert.equal(code, 0)
  assert.match(stdout, /stages exercised: 3 of 8/)
  assert.match(stdout, /stages NOT RUN: +5 of 8/)
  assert.doesNotMatch(stdout, /stages exercised: 8 of 8/)

  // Named, one by one. A count alone tells a reader that something was skipped and not what.
  for (const n of [4, 5, 6, 7, 8]) assert.match(stdout, new RegExp(`Round ${n} NOT RUN`))
  for (const n of [1, 2, 3]) assert.match(stdout, new RegExp(`Round ${n} EXERCISED`))

  // And the last line of the log — the one that actually gets read — says so too.
  assert.match(stdout, /READ THE COUNT: 3 of 8 stages passed/)
  assert.match(stdout, /not passed, not failed/)
})

test('UTEST-041: eight stages walked drops the caveat, so it is not boilerplate', () => {
  // The other direction, and the reason it matters: a warning printed unconditionally is a
  // warning that stops meaning anything. It appears when coverage is thin and only then.
  const { code, stdout } = onSet(through(8))
  assert.equal(code, 0)
  assert.match(stdout, /stages exercised: 8 of 8/)
  assert.match(stdout, /stages NOT RUN: +0 of 8/)
  assert.doesNotMatch(stdout, /READ THE COUNT/)
  assert.doesNotMatch(stdout, /NOT RUN —/)
})

test('UTEST-041: a stage reached behind a hole is NOT RUN, and names the hole', () => {
  // Rounds 1 and 3 written, Round 2 missing. An interrupt at Round 3 cannot be staged from this,
  // and reporting it as a failure would be a statement about the fixture rather than the kit.
  const files = through(1)
  for (const a of STAGES[2].artifacts) files[a] = `# ${a}\n`
  const { code, stdout } = onSet({ ...files, [LOG]: changeLog([acceptRow(1), acceptRow(3)]) })
  assert.equal(code, 0)
  assert.match(stdout, /Round 3 NOT RUN[^\n]*Round 2 is not complete and accepted here/)
  assert.match(stdout, /stages exercised: 1 of 8/)
})

// --- Seen to fail ------------------------------------------------------------------------------

test('UTEST-041: a state file in the workspace fails', () => {
  // ADR-004's other half. Everything this check claims rests on the position coming from the
  // artifacts and the rows; a second source of truth in the workspace makes the claim untestable.
  const { code, stdout } = onSet(through(2, { extra: { 'spec/.progress.json': '{"round":2}\n' } }))
  assert.equal(code, 1)
  assert.match(stdout, /is a state file; resume must derive its position/)
  assert.match(stdout, /RESULT: FAIL/)
})

test('UTEST-041: an acceptance row resume cannot match fails, and quotes the row', () => {
  // The defect this check exists to catch, and it is not hypothetical: the derivation matches a
  // row whose stage cell BEGINS `Round n`. A run that wrote `Stage 1 — the idea` instead would
  // produce a workspace that looks accepted to a reader and unaccepted to resume, and the
  // developer would be shown a gate they had already answered.
  const { code, stdout } = onSet(through(3, { rows: [acceptRow(1, 'Stage 1 — the idea'), acceptRow(2), acceptRow(3)] }))
  assert.equal(code, 1)
  assert.match(stdout, /records Round 1 accepted on 2026-08-01 as "Stage 1 — the idea"/)
  assert.match(stdout, /resume still stops there/)

  // And the knock-on is reported as failures too, because every one of them is a real interrupt
  // case that lands on the wrong round — not as coverage that quietly went missing.
  assert.match(stdout, /interrupted mid-Round 2[^\n]*resume landed on Round 1/)
})

test('UTEST-041: an undated acceptance row fails', () => {
  // Acceptance is a DATED row (ADR-006). Undated, it is a record in the artifact that the
  // derivation cannot see — which reads to a developer as the kit losing their acceptance.
  const rows = [acceptRow(1), '| | Round 2 — scope boundaries | — | accepted |']
  const { code, stdout } = onSet(through(2, { rows }))
  assert.equal(code, 1)
  assert.match(stdout, /records "Round 2 — scope boundaries" with no date in the first column/)
})

test('UTEST-041: the differential assertion is not decoration', () => {
  // Removing a stage's dated row must move resume back to that stage. If it does not, the
  // position came from somewhere other than the row, and the check has to say so.
  //
  // The row below is synthetic — no eight-round intake writes a Round 12. It is here because it
  // is the only way to demonstrate this branch failing, and because it names the soft edge in the
  // matcher it exploits: `startsWith('round 1')` is also satisfied by `Round 12`.
  const rows = [acceptRow(1), '| 2026-08-09 | Round 12 — not a real round | — | accepted |']
  const { code, stdout } = onSet(through(1, { rows }))
  assert.equal(code, 1)
  assert.match(stdout, /removing Round 1's dated row from the change log left resume calling it complete/)
  assert.match(stdout, /the position is not derived from the row/)
})

// --- The stage map is read from the shipped round map, not written down here --------------------

test('UTEST-041: eight stages, each owning at least one artifact', () => {
  assert.deepEqual(STAGES.map((s) => s.n), [1, 2, 3, 4, 5, 6, 7, 8])
  for (const s of STAGES) assert.ok(s.artifacts.length > 0, `${s.name} expects no artifact`)
  // Guards the parsers rather than the map: a regex that matched nothing would make every
  // assertion in this file vacuously true, which is this file's own worst failure mode.
  assert.ok(STAGES.flatMap((s) => s.artifacts).length > 70)
})

test('UTEST-041: a wrapper blueprint is expected at the path it writes, not its own', () => {
  // `gitignore.md` produces `spec/.gitignore`. Expecting `spec/gitignore.md` would make Round 6
  // permanently two files short — a stage that can never be complete, whose probes would report
  // NOT RUN for ever without anything looking wrong.
  const six = STAGES[5].artifacts
  assert.ok(six.includes('spec/.gitignore'), 'the wrapper target is where the artifact lands')
  assert.ok(six.includes('spec/.env.example'))
  assert.ok(!six.includes('spec/gitignore.md'))
})

test('UTEST-041: a blueprint the manifest records as not packaged is not expected', () => {
  // Rounds 7 and 8 own the prefixes the "Deliberately not packaged" table sits under. Expecting
  // a file no run can produce has the same effect as the wrapper mistake above, in the two
  // rounds with the most files and so the least chance of anyone noticing.
  const all = STAGES.flatMap((s) => s.artifacts)
  for (const excluded of ['.gitkeep', 'appendix-index', 'MASTER-PROMPT', 'steps.md'])
    assert.ok(!all.some((a) => a.includes(excluded)), `${excluded} is not packaged and cannot be expected`)
})
