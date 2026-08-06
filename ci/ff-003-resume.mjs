#!/usr/bin/env node
// FF-003 — an interrupted intake resumes at the stage it stopped in, and the position it
// resumes to is derived from the workspace. Threshold: 8/8 stages. On failure: block merge.
//
// WHAT THIS CHECK DOES NOT DO, SAID FIRST. The register defines FF-003 operationally: interrupt
// a golden intake mid-stage, re-run it, assert it resumes there and completes — eight times.
// That is eight live model-driven intakes at real cost apiece. It cannot run in CI, and nobody
// is going to spend it on every merge. Wiring that register entry up to something cheaper and
// calling the result 8/8 is precisely the failure BR-009 names, so this file does not: every
// stage it could not exercise is printed as NOT RUN, by name, with the reason.
//
// WHAT CAN BE VERIFIED WITHOUT A MODEL. Resume takes no state file (ADR-004): its position is a
// pure function of (artifacts present, dated acceptance rows) — see ci/resume.mjs. A workspace
// on disk holds both inputs, so the derivation can be exercised against the golden set for every
// stage the golden set actually reaches, and the two claims that matter can be made falsifiable:
//
//   interrupt    stages 1..n-1 complete and accepted, stage n half-written -> resume lands on
//                stage n. The FF-003 scenario, staged from real artifact names and a real change
//                log rather than from invented ones.
//
//   derivation   stage n complete and accepted -> resume moves past it; remove that one dated
//                row from the change log and nothing else -> resume moves back to it and
//                re-presents the gate. Same files, two logs, two answers. That difference IS the
//                claim "the position is derived from the artifact": if removing the row changed
//                nothing, the position came from somewhere else.
//
// THE PRECONDITIONS ARE READ FROM THE ARTIFACT, NEVER FROM RESUME'S OWN VERDICT. Ask `derive`
// whether stages 1..n-1 are complete and the assertion that follows is true by construction —
// `derive` returns the first stage it did not call complete, so it could not answer anything
// else. Six of the last twelve defects here were checks that passed by matching nothing; a check
// that passes by arithmetic is the same defect with better manners. So completeness is counted
// from the file list and acceptance is read from the dated rows, both here, and what is asserted
// is that resume AGREES.

import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { derive, PARTIAL, WRITTEN, COMPLETE } from './resume.mjs'
import { acceptanceRows, forbiddenStateFiles } from './acceptance.mjs'
import { goldenWorkspaces, GOLDEN_ROOT, blueprintText } from './golden.mjs'
import { wrapperTarget } from './fill.mjs'
import { CHANGE_LOG } from './workspace.mjs'
import { PAYLOAD_ROOT, report } from './payload.mjs'

const MANIFEST = `${PAYLOAD_ROOT}/blueprints/MANIFEST.md`
const COVERAGE = `${PAYLOAD_ROOT}/instructions/coverage.md`

/**
 * Every blueprint that ships, from the manifest's checksum table.
 *
 * Deliberately not `library()` from golden.mjs: that regex matches the "Deliberately not
 * packaged" table as well, and Rounds 7 and 8 own the prefixes those exclusions sit under. A
 * round whose expected artifact set contains a file no run can ever produce is a round that can
 * never be complete — its derivation probe would report NOT RUN for ever, and a permanent
 * silent hole is the one thing this check exists to refuse.
 */
const shipped = () =>
  readFileSync(MANIFEST, 'utf8')
    .split(/\r?\n/)
    .map((l) => (l.match(/^\|\s*`([^`]+)`\s*\|\s*`[0-9a-f]{64}`\s*\|/) || [])[1])
    .filter(Boolean)

/** The round map: round -> the paths and prefixes it owns (`instructions/coverage.md`). */
const roundMap = () => {
  const map = new Map()
  for (const line of readFileSync(COVERAGE, 'utf8').split(/\r?\n/)) {
    const row = line.match(/^\| ([1-8]) \| (.+) \|$/)
    if (row) map.set(Number(row[1]), [...row[2].matchAll(/`([^`]+)`/g)].map((m) => m[1]))
  }
  return map
}

// An entry ending in `/` or `-` is a prefix and covers everything beneath it; anything else is
// one exact path. coverage.md states the rule, and ATEST-050 holds the map to it.
const owns = (entry, path) => (/[/-]$/.test(entry) ? path.startsWith(entry) : path === entry)

/**
 * Where a blueprint's artifact lands in a workspace.
 *
 * Almost always `spec/` plus the blueprint's own path. A WRAPPER blueprint declares its target
 * instead — `gitignore.md` produces `spec/.gitignore` — and a check that assumed the two paths
 * matched would decide Round 6 never wrote two files it did write, then report the round as
 * permanently partial (`instructions/fill.md`, wrapper blueprints).
 */
const artifactPath = (rel) => `spec/${wrapperTarget(blueprintText(rel) ?? '') ?? rel}`

/**
 * The eight stages, with the artifacts each is expected to produce.
 *
 * Derived from the shipped round map rather than written down here. A list of file names in this
 * file would be a second round map, and the second one is always the one nobody updates.
 */
export function stages() {
  const lib = shipped()
  return [...roundMap()]
    .map(([n, entries]) => ({
      n,
      name: `Round ${n}`,
      artifacts: lib.filter((p) => entries.some((e) => owns(e, p))).map(artifactPath),
    }))
    .sort((a, b) => a.n - b.n)
}

/**
 * `Round 3 — users, roles, and data` -> 3.
 *
 * Loose on purpose, and it has to be: the strict matcher is the one under test. `acceptanceRows`
 * has already established that the cell names a round or a stage, so this only reads the number
 * out of it. Recognising the row here and letting resume's own prefix match decide whether the
 * row counts is what makes a mislabelled row — `Stage 1 — the idea`, where the instructions say
 * `Round 1 — …` — a violation rather than an invisible absence.
 */
const roundOf = (stage) => Number((stage.match(/\b(?:round|stage)\s*(\d+)/i) ?? [])[1]) || null

/**
 * The change log with some of its dated acceptance rows removed, line by line.
 *
 * Rows are identified with acceptance.mjs's own parser rather than a second regex of the same
 * shape. Two regexes for one row format drift, and the one that drifts is the one that decides
 * whether a stage counts as accepted.
 */
const withoutRows = (log, drop) =>
  log
    .split(/\r?\n/)
    .filter((line) => !acceptanceRows(line).some((r) => drop(roundOf(r.stage))))
    .join('\n')

/**
 * A row a reader would call an acceptance that the derivation cannot see.
 *
 * `acceptanceRows` requires the date in the first column, because that is what makes a row
 * findable — the change-control blueprint says so, and the nine-column change-entries table
 * above it starts with an identifier, so it cannot serve. A stage recorded without a date is
 * recorded nowhere resume will look, and the developer is shown a gate they already answered.
 */
const UNDATED_STAGE_ROW = /^\|[^|]*\|\s*(?:round|stage)\s*\d+\b[^|]*\|/i
const undatedRows = (log) =>
  log
    .split(/\r?\n/)
    .filter((l) => UNDATED_STAGE_ROW.test(l) && acceptanceRows(l).length === 0)
    .map((l) => l.split('|')[2].trim())

/**
 * Exercise one workspace, stage by stage.
 *
 * @returns { probes, violations } — one probe result per (stage, probe), each `passed`,
 *          `failed`, or `not-run` with the reason it could not be staged.
 */
function exercise(ws, all) {
  const files = Object.keys(ws)
  const log = ws[CHANGE_LOG] ?? ''
  const rows = acceptanceRows(log)

  const present = (s) => s.artifacts.filter((a) => files.includes(a))
  const complete = (s) => s.artifacts.length > 0 && present(s).length === s.artifacts.length
  const rowsFor = (s) => rows.filter((r) => roundOf(r.stage) === s.n)
  // The first earlier stage that is not both fully written and recorded accepted. An interrupt
  // at stage n cannot be staged from a workspace that never had 1..n-1 finished — resume would
  // correctly land on the hole, and reporting that as a failure would be a statement about the
  // fixture rather than about the kit.
  const holeBefore = (n) => all.slice(0, n - 1).find((s) => !complete(s) || !rowsFor(s).length)

  const probes = []
  const violations = []
  const record = (s, probe, state, why) => probes.push({ n: s.n, probe, state, why })

  // ADR-004's other half, and the reason it is checked here as well as in FF-010: everything
  // above claims the position comes from the artifacts and the rows and from nothing else. A
  // check whose central claim rests on an absence has to look for it rather than assume another
  // check did — and if one ever appeared, both probes below would keep passing while resume read
  // it.
  for (const p of forbiddenStateFiles(files))
    violations.push(`${p} is a state file; resume must derive its position, never read one (ADR-004, ADR-006)`)

  for (const cell of undatedRows(log))
    violations.push(
      `the change log records "${cell}" with no date in the first column — resume reads dated rows only, so that stage reads as never accepted (ADR-006)`
    )

  for (const s of all) {
    const seen = present(s)
    const hole = holeBefore(s.n)

    // --- interrupt: half-written stage n, everything before it done -----------------------
    if (!seen.length) record(s, 'interrupt', 'not-run', `no ${s.name} artifact exists here, so nothing could be interrupted`)
    else if (hole) record(s, 'interrupt', 'not-run', `${hole.name} is not complete and accepted here, so an interrupt at ${s.name} could not be staged`)
    else if (s.artifacts.length < 2)
      record(s, 'interrupt', 'not-run', `${s.name} produces one artifact, so it has no half-written state to stage`)
    else {
      // Drop one file to make the stage partial, and drop every acceptance row from this stage
      // onward — a session that ended mid-write never reached this stage's gate.
      const halfWritten = seen.length > 1 ? seen.slice(0, -1) : seen
      const staged = [...all.slice(0, s.n - 1).flatMap((p) => p.artifacts), ...halfWritten]
      const r = derive(all, staged, withoutRows(log, (k) => k >= s.n))
      if (r.resumeAt !== s.name)
        record(s, 'interrupt', 'failed', `interrupted mid-${s.name} with ${halfWritten.length} of ${s.artifacts.length} files written, resume landed on ${r.resumeAt ?? 'nothing — it called the workspace complete'}`)
      else if (r.statuses[s.n - 1].status !== PARTIAL)
        record(s, 'interrupt', 'failed', `interrupted mid-${s.name}, resume landed there but called it ${r.statuses[s.n - 1].status} rather than partial`)
      else record(s, 'interrupt', 'passed')
    }

    // --- derivation: the dated row is what moves the position ------------------------------
    if (!complete(s))
      record(s, 'derivation', 'not-run', `${s.name} is ${seen.length} of ${s.artifacts.length} written here, so it has no accepted state to test`)
    else if (!rowsFor(s).length)
      record(s, 'derivation', 'not-run', `no dated row records ${s.name} accepted, so there is no row to remove`)
    else if (hole) record(s, 'derivation', 'not-run', `${hole.name} is not complete and accepted here, so ${s.name} could not be tested in place`)
    else {
      const staged = all.slice(0, s.n).flatMap((p) => p.artifacts)
      const withRow = derive(all, staged, log)
      const withoutRow = derive(all, staged, withoutRows(log, (k) => k === s.n))
      const label = rowsFor(s)[0]
      // Both assertions are about THIS stage's status and not about where the run landed. Where
      // it lands is the interrupt probe's claim, and a stage earlier in the list can move it —
      // so reporting a landing here would blame stage n for a fault at stage 2 and print the
      // same wrong diagnosis once per later stage.
      const after = withoutRow.statuses[s.n - 1].status
      if (withRow.statuses[s.n - 1].status !== COMPLETE)
        record(s, 'derivation', 'failed', `the change log records ${s.name} accepted on ${label.date} as "${label.stage}", every one of its ${s.artifacts.length} files is present, and resume still stops there — it matches a row beginning "${s.name}"`)
      else if (after !== WRITTEN)
        record(s, 'derivation', 'failed', `removing ${s.name}'s dated row from the change log left resume calling it ${after} rather than ${WRITTEN} — the position is not derived from the row (ADR-004, ADR-006)`)
      else record(s, 'derivation', 'passed')
    }
  }

  return { probes, violations }
}

/** One line per stage: which probes ran, which passed, and what stopped the rest. */
function stageLine(n, results) {
  const parts = []
  for (const probe of ['interrupt', 'derivation']) {
    const mine = results.filter((r) => r.probe === probe)
    const ran = mine.filter((r) => r.state !== 'not-run')
    if (mine.some((r) => r.state === 'failed')) parts.push(`${probe}: FAILED`)
    else if (ran.length) parts.push(`${probe}: passed (${ran.map((r) => r.id).join(', ')})`)
    else parts.push(`${probe}: NOT RUN — ${mine.map((r) => `${r.id}: ${r.why}`).join(' · ')}`)
  }
  const exercised = results.some((r) => r.state !== 'not-run')
  return `Round ${n} ${exercised ? 'EXERCISED' : 'NOT RUN  '} — ${parts.join('  |  ')}`
}

const GUARDS = 'REQ-NF-003, REQ-F-028, ADR-004 — an interrupted intake resumes where it stopped'
const THRESHOLD = '8 of 8 stages; a stage not exercised is NOT RUN, and NOT RUN is never a pass'

export function verify(root = GOLDEN_ROOT) {
  const all = stages()
  const cases = goldenWorkspaces(root)
  const results = []
  const violations = []

  for (const c of cases) {
    const { probes, violations: v } = exercise(c.workspace, all)
    results.push(...probes.map((p) => ({ ...p, id: c.id })))
    violations.push(...v.map((line) => `VIOLATION: ${c.id}: ${line}`))
  }

  // A probe that failed IS a violation. Keeping the two lists apart and counting only one of
  // them is how the first version of this file reported `found: 0` over three failed stages —
  // a green line above its own failures, in the check written to make that impossible.
  violations.push(...results.filter((r) => r.state === 'failed').map((r) => `VIOLATION: ${r.id}: ${r.why}`))

  const exercised = all.filter((s) => results.some((r) => r.n === s.n && r.state !== 'not-run'))
  const missed = all.filter((s) => !exercised.includes(s))

  // NOT RUN, and only when there is genuinely nothing to say. A violation already found is a
  // fact about the kit; thin coverage is the absence of facts. Swallowing the first because of
  // the second would report the wrong one of the three states.
  if (!violations.length && !exercised.length) {
    console.log(`FF-003 — guards ${GUARDS}`)
    console.log(`  threshold: ${THRESHOLD}`)
    console.log(
      `  RESULT: NOT RUN — ${cases.length ? `no stage could be exercised from ${cases.map((c) => c.id).join(', ')}` : `no golden workspace exists under ${root}/`}`
    )
    console.log('  no claim is made about the kit either way.')
    return 2
  }

  const code = report({
    id: 'FF-003',
    guards: GUARDS,
    threshold: THRESHOLD,
    found: violations.length,
    detail: [
      `golden workspaces walked: ${cases.map((c) => c.id).join(', ') || 'none'}`,
      // Counted against the round map rather than against a literal 8. The register's measure is
      // eight, and it says so on the threshold line above; if the map ever stopped holding eight
      // rounds, a denominator hardcoded here would keep printing a reassuring "of 8" over a set
      // that had lost one. ATEST-050 is what holds the map to eight.
      `stages exercised: ${exercised.length} of ${all.length}${exercised.length ? ` — ${exercised.map((s) => s.name).join(', ')}` : ''}`,
      `stages NOT RUN:   ${missed.length} of ${all.length}${missed.length ? ` — ${missed.map((s) => s.name).join(', ')}` : ''}`,
      ...all.map((s) => stageLine(s.n, results.filter((r) => r.n === s.n))),
      ...violations,
    ],
    scope: [
      'that a LIVE interrupted run resumes and completes — this reads workspaces, it runs no model',
      'the eight live intakes the register asks for; they cannot run in CI (gate.yml stage 5)',
      'the words resume shows the developer — ETEST-009 and ETEST-014 hold those',
      'anything at all about a stage listed NOT RUN above',
    ],
  })

  // After the RESULT line, deliberately. The last line of a CI log is the one that gets read,
  // and a caveat printed above a green RESULT is a caveat nobody reads.
  if (code === 0 && missed.length)
    console.log(
      `  READ THE COUNT: ${exercised.length} of ${all.length} stages passed. ${missed.map((s) => s.name).join(', ')} were NOT RUN — not passed, not failed. FF-003's 8/8 is not met and is not claimed.`
    )
  return code
}

// The check below RUNS. Everything above is importable — a test that wants the stage map must
// not trigger a full verification and a process exit by asking for it (the shape ff-017 uses).
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) process.exit(verify(process.argv[2] ?? GOLDEN_ROOT))
