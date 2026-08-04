#!/usr/bin/env node
// The workspace runner — TASK-016 stage 3.
//
// TEST SCAFFOLDING. NOT A FEATURE. This script drives the kit; it is not part of the kit, it
// is never installed, and no developer ever invokes it. FF-009 makes that structural rather
// than a promise: `ci/` is outside PAYLOAD_ROOT and is named in NOT_PAYLOAD, so a copy of this
// file placed anywhere inside `plugin/` fails the merge gate on the ground that it is not
// Markdown. The rule is not "please remember"; it is a check that has been seen to fail.
//
// WHAT IT IS FOR. Every defect found in this repository since the golden workspace began was
// invisible to part-tests and surfaced within minutes of a real run — eleven of them now. The
// bottleneck has been that a real run needs a person to sit through eight rounds. This removes
// the person, not the run: the kit is followed exactly as written, and the only thing supplied
// in advance is what the developer would have typed.
//
// WHAT IT DOES NOT ESTABLISH, stated here because a harness that overclaims is worse than none:
//
//   - It does not test the per-file permission prompt (SEC-Z-002). It grants edits up front.
//     A run that asked for blanket write permission would pass this and must not; that check
//     stays with a person.
//   - It does not test that output is stable. It is not (ADR-002). It compares STRUCTURE —
//     see ci/workspace.mjs for which facts are gated and why the rest are only reported.
//   - It does not gate the merge. It costs money, needs a network and a host, and has not been
//     run enough times for anyone to know its variance. Wiring an unmeasured check into the
//     gate is the failure BR-009 names, committed by the tool that exists to catch it.
//
// EXIT CODES — three states, never two (BR-009):
//   0  the run reproduced the golden workspace's structure
//   1  it did not, and the differences are named
//   2  nothing ran. No claim is made either way.

import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseAnswers, drivePrompt } from './answers.mjs'
import { loadWorkspace, compare, CHANGE_LOG } from './workspace.mjs'
import { score } from './eval-runner.mjs'
import { acceptedStages } from './acceptance.mjs'
import { PAYLOAD_ROOT } from './payload.mjs'

const GOLDEN = 'tests/fixtures/golden'

// Written by the host, not by the kit, and therefore not evidence of anything the kit did.
// Listed rather than pattern-matched: an exclusion that grows quietly is how "wrote nothing
// outside spec/" becomes true by exemption.
const HOST_ARTIFACTS = /^(\.git|\.claude)(\/|$)/

const USAGE = `Usage: node ci/generate-workspace.mjs <case-id> [options]

  <case-id>          e.g. EV-001. Reads ${GOLDEN}/<case-id>-answers.md
                     and compares what the run produces against ${GOLDEN}/<case-id>/.

  --rounds N         drive the interview to Round N and stop. Defaults to the number of
                     rounds the golden workspace records as ACCEPTED, because that is the
                     only point at which the two are comparable.
  --model <alias>    passed to the host unchanged. Default: the host's own.
  --timeout <min>    wall-clock ceiling for the run. Default: 45.
  --keep             leave the sandbox on disk and print its path.
  --dry-run          compose the prompt and print it. Spawns nothing, spends nothing.
`

function main(argv) {
  const args = parse(argv)
  if (!args.caseId) return notRun(USAGE.trim())

  const answerFile = `${GOLDEN}/${args.caseId}-answers.md`
  const goldenRoot = `${GOLDEN}/${args.caseId}`
  if (!existsSync(answerFile)) return notRun(`no answer record at ${answerFile}`)
  if (!existsSync(goldenRoot)) return notRun(`no golden workspace at ${goldenRoot}/`)

  const record = parseAnswers(readFileSync(answerFile, 'utf8'))
  if (!record.rounds.length) return notRun(`${answerFile} records no answers`)

  const golden = loadWorkspace(goldenRoot)
  const accepted = acceptedStages(golden[CHANGE_LOG] ?? '')
  const through = args.rounds ?? accepted.length
  if (!through) return notRun(`${goldenRoot}/ records no accepted round, so there is nothing to compare a run against`)

  const prompt = drivePrompt(record, through)
  if (args.dryRun) {
    console.log(prompt)
    return notRun('--dry-run: the prompt was composed and nothing was executed')
  }

  // A golden workspace can hold a round that was written but never accepted — a run
  // interrupted between the write and the decision, which resume.md treats as a legitimate
  // position rather than a mess. Those files belong to no accepted round, so a run driven to
  // the last accepted round will not produce them and they will be reported as missing. Say
  // where the fixture stands before the difference appears, so it is read as the fixture's
  // state and not as this run's failure.
  console.log(
    `${goldenRoot}/ records ${accepted.length} accepted round${accepted.length === 1 ? '' : 's'}; ` +
      `the answer record covers ${countedRounds(record, record.rounds.at(-1).n)}. Driving to Round ${through}.\n`
  )

  const sandbox = mkdtempSync(join(tmpdir(), `spec-prod-${args.caseId}-`))
  try {
    const host = drive({ sandbox, prompt, model: args.model, timeoutMin: args.timeout })
    if (!host.ran) return notRun(host.why, args.keep ? sandbox : null)

    const all = loadWorkspace(sandbox)
    const produced = {}
    const outside = []
    for (const path of Object.keys(all)) {
      if (HOST_ARTIFACTS.test(path)) continue
      if (path.startsWith('spec/')) produced[path] = all[path]
      else outside.push(path)
    }

    return verdict({ produced, golden, outside, through, host, caseId: args.caseId, sandbox: args.keep ? sandbox : null })
  } finally {
    if (!args.keep) rmSync(sandbox, { recursive: true, force: true })
  }
}

/** How many rounds the answer record actually covers up to `through`. */
const countedRounds = (record, through) => record.rounds.filter((r) => r.n <= through).length

/**
 * Run the host against a clean repository with the plugin loaded from this branch.
 *
 * `--plugin-dir` loads the payload as an installed plugin rather than as loose files, so the
 * run exercises the packaged shape. A run against `plugin/instructions/*.md` read as ordinary
 * files would pass while the published plugin was broken, which is the failure the weekly
 * install test exists to catch and this must not quietly duplicate.
 */
function drive({ sandbox, prompt, model, timeoutMin }) {
  const git = spawnSync('git', ['init', '-q', '-b', 'main'], { cwd: sandbox, encoding: 'utf8' })
  if (git.status !== 0) return { ran: false, why: `could not create a sandbox repository: ${git.stderr || git.error?.message}` }

  const argv = [
    '-p', prompt,
    // Absolute: the host runs with the sandbox as its working directory, and a relative path
    // would resolve against that instead of against this repository.
    '--plugin-dir', resolve(PAYLOAD_ROOT),
    '--permission-mode', 'acceptEdits',
    '--output-format', 'json',
    ...(model ? ['--model', model] : []),
  ]
  const started = Date.now()
  const host = spawnSync('claude', argv, {
    cwd: sandbox,
    encoding: 'utf8',
    timeout: timeoutMin * 60_000,
    maxBuffer: 64 * 1024 * 1024,
    shell: process.platform === 'win32',
  })

  if (host.error?.code === 'ENOENT') return { ran: false, why: 'the host is not installed: `claude` is not on PATH' }
  if (host.signal) return { ran: false, why: `the host was killed after ${timeoutMin} minutes (signal ${host.signal})` }
  if (host.error) return { ran: false, why: `the host could not be started: ${host.error.message}` }
  if (host.status !== 0) return { ran: false, why: `the host exited ${host.status}: ${(host.stderr || host.stdout || '').trim().slice(-2000)}` }

  let result = {}
  try {
    result = JSON.parse(host.stdout)
  } catch {
    return { ran: false, why: 'the host produced output this runner could not read as JSON' }
  }
  return {
    ran: true,
    // Recorded because TASK-016 step 6 asks for it and nothing else in this repository can see
    // it: the developer-side model cost of one intake.
    costUsd: result.total_cost_usd ?? null,
    turns: result.num_turns ?? null,
    seconds: Math.round((Date.now() - started) / 1000),
  }
}

/** What the run produced, judged and printed. */
function verdict({ produced, golden, outside, through, host, caseId, sandbox }) {
  const library = readFileSync(`${PAYLOAD_ROOT}/blueprints/MANIFEST.md`, 'utf8')
    .split('\n')
    .map((l) => (l.match(/^\| `([^`]+)` \|/) || [])[1])
    .filter(Boolean)

  const rounds = acceptedStages(produced[CHANGE_LOG] ?? '').length
  const scored = score({ workspace: produced, library, rounds, outside })
  const diff = compare(produced, golden)

  console.log(`${caseId} — driven to Round ${through}`)
  console.log(`  files produced:   ${Object.keys(produced).length}`)
  console.log(`  rounds accepted:  ${rounds}`)
  console.log(`  wall clock:       ${host.seconds}s over ${host.turns ?? '?'} turns`)
  console.log(`  model cost:       ${host.costUsd === null ? 'not reported by the host' : `$${host.costUsd.toFixed(4)}`}`)

  console.log('\n  scorers')
  for (const r of scored.results) {
    const state = r.floor === null ? 'ungated' : r.atFloor ? 'at floor' : r.hardFail ? 'BREACH' : 'below floor'
    console.log(`    ${r.name.padEnd(20)} ${String(r.value).padStart(6)}  ${state}`)
  }

  console.log(`\n  structure vs ${GOLDEN}/${caseId}/`)
  if (!diff.gated.length) console.log('    no gated difference — the run reproduced the golden structure')
  for (const d of diff.gated) console.log(`    DIFFERS  ${d.kind}  ${d.path}\n               ${d.detail}`)
  for (const d of diff.reported) console.log(`    varies   ${d.path}  ${d.detail}`)

  if (outside.length) for (const p of outside) console.log(`    OUTSIDE  ${p} — written outside spec/`)
  if (sandbox) console.log(`\n  sandbox kept: ${sandbox}`)

  console.log('\n  this run does NOT establish:')
  console.log('    that the kit asks per file — edits were granted in advance (SEC-Z-002)')
  console.log('    that generated prose is stable — it is not, by design (ADR-002)')
  console.log('    anything about .git/ or .claude/ — the host writes those, not the kit')

  const failed = diff.gated.length + scored.breaches.length
  console.log(failed ? `\n  RESULT: FAIL — ${failed} gated difference${failed === 1 ? '' : 's'}` : '\n  RESULT: pass')
  return failed ? 1 : 0
}

/** Nothing ran. This is its own outcome and is never printed as a pass (BR-009). */
function notRun(why, sandbox = null) {
  console.log(`  RESULT: NOT RUN — ${why}`)
  if (sandbox) console.log(`  sandbox kept: ${sandbox}`)
  console.log('  no claim is made about the kit either way.')
  return 2
}

function parse(argv) {
  const args = { caseId: null, rounds: null, model: null, timeout: 45, keep: false, dryRun: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--keep') args.keep = true
    else if (a === '--dry-run') args.dryRun = true
    else if (a === '--rounds') args.rounds = Number(argv[++i])
    else if (a === '--model') args.model = argv[++i]
    else if (a === '--timeout') args.timeout = Number(argv[++i])
    else if (!a.startsWith('--')) args.caseId = a
  }
  return args
}

export { main }

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv.slice(2)))
}
