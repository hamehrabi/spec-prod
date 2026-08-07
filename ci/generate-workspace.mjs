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
import { mkdtempSync, rmSync, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseAnswers, briefing as composeBriefing } from './answers.mjs'
import { loadWorkspace, compare, CHANGE_LOG } from './workspace.mjs'
import { score } from './eval-runner.mjs'
import { acceptedStages } from './acceptance.mjs'
import { library } from './golden.mjs'
import { PAYLOAD_ROOT } from './payload.mjs'

const GOLDEN = 'tests/fixtures/golden'

// Written by the host, not by the kit, and therefore not evidence of anything the kit did.
// Listed rather than pattern-matched: an exclusion that grows quietly is how "wrote nothing
// outside spec/" becomes true by exemption.
const HOST_ARTIFACTS = /^(\.git|\.claude)(\/|$)/

// How many times the host is asked for the same run before the runner gives up.
//
// Three, and the wall clock still binds — see `drive`. Each attempt spends real money (the two
// runs that motivated this cost about $6.15 apiece), so the count is small, and it is a count
// of ATTEMPTS rather than of retries so that the number a person reads here is the number of
// times they can be billed.
const ATTEMPTS = 3

const USAGE = `Usage: node ci/generate-workspace.mjs <case-id> [options]

  <case-id>          e.g. EV-001. Reads ${GOLDEN}/<case-id>-answers.md
                     and compares what the run produces against ${GOLDEN}/<case-id>/.

  --rounds N         drive the interview to Round N and stop. Defaults to the number of
                     rounds the golden workspace records as ACCEPTED, because that is the
                     only point at which the two are comparable.
  --model <alias>    passed to the host unchanged. Default: the host's own.
  --timeout <min>    wall-clock ceiling for the run. Default: 45. Shared across attempts, not
                     renewed by them: a dropped connection is retried in the same workspace,
                     up to ${ATTEMPTS} attempts, within this one ceiling.
  --keep             leave the sandbox on disk and print its path. A run that stopped part-way
                     keeps its sandbox anyway — what it wrote cost money and is resumable.
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

  const command = intakeCommand(record.depth)
  const briefing = composeBriefing(record, through)
  if (args.dryRun) {
    console.log(`# what the developer types\n\n${command}\n\n# what they already answered\n\n${briefing}`)
    return notRun('--dry-run: the run was composed and nothing was executed')
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
  let keep = args.keep
  try {
    const host = drive({ sandbox, command, briefing, model: args.model, timeoutMin: args.timeout })
    if (!host.ran) {
      // WHAT A STOPPED RUN WROTE OUTLIVES IT. A connection that drops 25 minutes in leaves a
      // real, resumable part-workspace on disk, and deleting it charges for those minutes a
      // second time. Kept without being asked for, because nobody passes --keep in advance of a
      // failure they did not expect — and it is kept rather than compared: an unfinished
      // workspace is still NOT RUN, and the line below claims nothing about it.
      if (!keep && existsSync(join(sandbox, 'spec'))) {
        keep = true
        console.log('  part of a workspace was written before the run stopped. Keeping it rather than')
        console.log('  deleting work that cost money — the kit resumes from what is on disk (resume.md).')
      }
      return notRun(host.why, keep ? sandbox : null)
    }

    const all = loadWorkspace(sandbox)
    const produced = {}
    const outside = []
    for (const path of Object.keys(all)) {
      if (HOST_ARTIFACTS.test(path)) continue
      if (path.startsWith('spec/')) produced[path] = all[path]
      else outside.push(path)
    }

    return verdict({ produced, golden, outside, through, host, caseId: args.caseId, sandbox: keep ? sandbox : null })
  } finally {
    if (!keep) rmSync(sandbox, { recursive: true, force: true })
  }
}

/** How many rounds the answer record actually covers up to `through`. */
const countedRounds = (record, through) => record.rounds.filter((r) => r.n <= through).length

/**
 * The command a developer types, derived rather than written down.
 *
 * `/<plugin name>:<command file>` — both read from the payload, so renaming either one moves
 * this runner with it instead of leaving it invoking something that no longer exists. It is
 * the same rule the kit applies to itself: never hardcode what can be derived (REQ-F-043).
 *
 * FF-001 already asserts the payload ships exactly one command. If that ever stops being true
 * this throws rather than picking one, because a runner that guesses which entry point to
 * drive is testing something nobody chose.
 */
export function intakeCommand(depth) {
  const name = JSON.parse(readFileSync(`${PAYLOAD_ROOT}/.claude-plugin/plugin.json`, 'utf8')).name
  const commands = readdirSync(`${PAYLOAD_ROOT}/commands`).filter((f) => f.endsWith('.md'))
  if (commands.length !== 1) throw new Error(`the payload ships ${commands.length} commands; FF-001 requires exactly one`)
  return `/${name}:${commands[0].replace(/\.md$/, '')} ${depth}`
}

/**
 * Everything the host is told on its command line — flags and paths, and nothing else.
 *
 * Exported so a test can assert the property that broke on the first real run: no argument here
 * carries a newline. The developer's words go in a file, and the command they typed goes over
 * stdin; neither belongs on a command line.
 */
export function hostArgs({ model = null, briefingFile = null } = {}) {
  return [
    '-p',
    // Absolute: the host runs with the sandbox as its working directory, and a relative path
    // would resolve against that instead of against this repository.
    '--plugin-dir', resolve(PAYLOAD_ROOT),
    '--permission-mode', 'acceptEdits',
    '--output-format', 'json',
    ...(briefingFile ? ['--append-system-prompt-file', briefingFile] : []),
    ...(model ? ['--model', model] : []),
  ]
}

/**
 * The failures that are the connection dying rather than the run failing.
 *
 * TWO VERIFICATION RUNS DIED HERE, 25 minutes and about $6.15 each, with no verdict:
 * `API Error: The socket connection was closed unexpectedly`. The host exited non-zero, so this
 * runner said NOT RUN and claimed nothing — which was correct and cost a day. Nothing was
 * learned about the kit, and the part-written workspace was deleted on the way out.
 *
 * DELIBERATELY SHORT, AND EVERY ENTRY NAMES THE CONNECTION RATHER THAN THE REQUEST. Six of the
 * last twelve defects in this repository were checks that matched too much or matched nothing,
 * and a list that grew to cover "errors that felt retryable" would eventually retry a genuine
 * failure — three times the bill for the same answer. Absent on purpose: authentication, a
 * rejected request and a refusal by the model are all real outcomes of a real run, and asking
 * again changes nothing but the cost. Rate limits and `Overloaded` are absent too — they want a
 * waiting strategy, and an immediate retry is the one response that makes them worse.
 *
 * A false positive here costs one extra attempt. It CANNOT manufacture a pass: `classifyHost`
 * returns `ran: true` for status 0 and for nothing else, and the verdict is computed from the
 * files on disk long after this list has had its say.
 */
const TRANSPORT = [
  /the socket connection was closed/i, // both dead runs, verbatim
  /socket hang up/i, // the same event as Node reports it rather than as the host does
  /\bECONNRESET\b/,
  /\bETIMEDOUT\b/,
  /\bEAI_AGAIN\b/, // DNS gave up; the request never left the machine
]

/**
 * One line, single-spaced, for a signature to be matched against.
 *
 * The host wraps its error text to the terminal it thinks it has, so `The socket connection was
 * closed unexpectedly` arrives split across a line break as often as not. Ten defects here have
 * been a regex that failed to match across a hard wrap, and a signature applied to raw output
 * would have missed the very run that motivated it.
 */
const flatten = (text) => text.replace(/\s+/g, ' ').trim()

/** The end of what the host said — the part that names the failure. */
const tail = (text) => text.trim().slice(-2000)

/**
 * What the host's exit means, and whether another attempt is honest.
 *
 * Exported and pure — no spawning, no clock, no network — because the decision it makes is the
 * one nobody can afford to establish by experiment: each real observation costs 25 minutes and
 * about $6.15, which is exactly why two of them produced no verdict.
 *
 * THE RULE A RETRY MUST NOT BEND. A transport failure is `ran: false`, like every other
 * failure. Retrying changes how many times the runner asks; it never changes what an answer
 * means, and there is no path through here from a non-zero exit to `ran: true`. When the
 * attempts run out the outcome is still NOT RUN — three states, never two (BR-009).
 *
 * @param host      a `spawnSync` result: `{ status, signal, error, stdout, stderr }`
 * @param attempt   which attempt this was, counting from 1
 * @param attempts  how many attempts are allowed in total
 * @param msLeft    milliseconds left in the run's wall-clock ceiling, measured AFTER this
 *                  attempt returned. A retry that cannot fit inside it is not offered.
 * @returns { ran, retry, why } — `retry` is only ever true when `ran` is false.
 */
export function classifyHost(host, { timeoutMin = null, attempt = 1, attempts = ATTEMPTS, msLeft = Infinity } = {}) {
  const stop = (why) => ({ ran: false, retry: false, why })

  if (host.error?.code === 'ENOENT') return stop('the host is not installed: `claude` is not on PATH')
  // Not retried: the ceiling is shared across attempts, so the budget this one exhausted is the
  // same budget the next one would draw on, and it would die at the same place having spent
  // twice as much to get there.
  if (host.signal) return stop(`the host was killed at the ${timeoutMin}-minute ceiling for the run (signal ${host.signal})`)
  if (host.error) return stop(`the host could not be started: ${host.error.message}`)
  if (host.status === 0) return { ran: true, retry: false, why: null }

  // Matched against the same text the failure is reported with, so what decides a retry and
  // what a person reads afterwards cannot drift apart.
  const said = (host.stderr || host.stdout || '').trim()
  if (!TRANSPORT.some((signature) => signature.test(flatten(said))))
    return stop(`the host exited ${host.status}: ${tail(said)}`)

  const dropped = `the host's connection dropped on attempt ${attempt} of ${attempts}: ${tail(said)}`
  if (attempt >= attempts) return stop(`${dropped} — every attempt dropped its connection, so nothing ran to completion`)
  if (msLeft <= 0) return stop(`${dropped} — the ${timeoutMin}-minute ceiling leaves no time for another attempt`)
  return { ran: false, retry: true, why: dropped }
}

/**
 * Run the host against a clean repository with the plugin loaded from this branch.
 *
 * `--plugin-dir` loads the payload as an installed plugin rather than as loose files, so the
 * run exercises the packaged shape. A run against `plugin/instructions/*.md` read as ordinary
 * files would pass while the published plugin was broken, which is the failure the weekly
 * install test exists to catch and this must not quietly duplicate.
 */
function drive({ sandbox, command, briefing, model, timeoutMin }) {
  const git = spawnSync('git', ['init', '-q', '-b', 'main'], { cwd: sandbox, encoding: 'utf8' })
  if (git.status !== 0) return { ran: false, why: `could not create a sandbox repository: ${git.stderr || git.error?.message}` }

  // OUTSIDE THE SANDBOX, deliberately. The briefing is harness input, not project content, and
  // a file sitting in the repository the kit is about to specify would be read as something the
  // developer wrote — a workspace could come back specifying its own answer sheet.
  const briefingFile = join(mkdtempSync(join(tmpdir(), 'spec-prod-briefing-')), 'briefing.md')
  writeFileSync(briefingFile, briefing, 'utf8')

  const started = Date.now()
  // ONE CEILING FOR THE WHOLE RUN, NOT ONE PER ATTEMPT. `--timeout` is documented as the
  // wall-clock ceiling for the run, and a retry that renewed it would quietly turn 45 minutes
  // into 135 for someone who went to lunch on the strength of the first number. Each attempt is
  // given what is left of it, so the retry can only ever spend time the run already had.
  const deadline = started + timeoutMin * 60_000

  try {
    for (let attempt = 1; ; attempt++) {
      const msLeft = deadline - Date.now()
      if (msLeft <= 0)
        return { ran: false, why: `the ${timeoutMin}-minute ceiling ran out before attempt ${attempt} could start` }

      // NOTHING THAT VARIES GOES IN ARGV. The command a developer types goes over stdin; their
      // answers go in a file. The first real run passed a multi-line prompt as an argument with
      // shell:true, where Windows concatenates rather than escapes, and the host received nothing
      // usable — the sandbox came back holding only .git.
      const host = spawnSync('claude', hostArgs({ model, briefingFile }), {
        cwd: sandbox,
        input: command,
        encoding: 'utf8',
        timeout: msLeft,
        maxBuffer: 64 * 1024 * 1024,
      })

      const outcome = classifyHost(host, { timeoutMin, attempt, attempts: ATTEMPTS, msLeft: deadline - Date.now() })
      if (!outcome.ran) {
        if (!outcome.retry) return { ran: false, why: outcome.why }
        // THE SAME SANDBOX AND THE SAME COMMAND. The kit keeps no state file and works out where
        // it is by reading the workspace every time (resume.md, ADR-004), so a second invocation
        // continues from the first incomplete stage instead of starting again. That property is
        // the only reason retrying is affordable: the minutes the dropped attempt already paid
        // for are still on disk, and it is the kit's own resume path that collects them.
        console.log(`  ${outcome.why}`)
        console.log('  retrying in the same workspace — the kit resumes from what is on disk.\n')
        continue
      }

      let result = {}
      try {
        result = JSON.parse(host.stdout)
      } catch {
        // NOT RETRIED, on the same evidence rule as everything else here: a dropped socket has
        // never been seen to end with a zero exit and unreadable output, and a runner that
        // retried this would triple the bill on a host that was simply printing something else.
        // The sandbox is kept, so the next person starts from what this one wrote.
        return { ran: false, why: 'the host produced output this runner could not read as JSON' }
      }
      return {
        ran: true,
        // Recorded because TASK-016 step 6 asks for it and nothing else in this repository can see
        // it: the developer-side model cost of one intake. THIS ATTEMPT'S cost — an attempt that
        // dropped its connection reports nothing before it dies, so a retried run cost more than
        // this number says, and `verdict` prints the attempt count next to it rather than
        // presenting one attempt's bill as the run's.
        costUsd: result.total_cost_usd ?? null,
        turns: result.num_turns ?? null,
        seconds: Math.round((Date.now() - started) / 1000),
        attempts: attempt,
      }
    }
  } finally {
    rmSync(dirname(briefingFile), { recursive: true, force: true })
  }
}

/**
 * One scorer's line in the report.
 *
 * NOT RUN IS ITS OWN ROW AND IT DOES NOT LOOK LIKE A GOOD ONE. Two scorers used to print
 * `at floor` over inputs nobody supplied — byte-identical to what `no_example_content` prints
 * after genuinely reading every file in the workspace — and that is how a baseline comes to be
 * recorded as better than the evidence for it (ai-evals.md §5). The value column shows `—`
 * rather than 0 for the same reason: a zero in a column of numbers reads as a measurement, and
 * zero is the best score every one of these scorers has.
 *
 * Exported and pure, so the distinction can be asserted rather than eyeballed — the same reason
 * `classifyHost` and `hostArgs` are exported.
 */
export function scorerRow(r) {
  const state = r.notRun
    ? `NOT RUN — ${r.why}`
    : r.floor === null
      ? 'ungated'
      : r.atFloor
        ? 'at floor'
        : r.hardFail
          ? 'BREACH'
          : 'below floor'
  return `${r.name.padEnd(20)} ${String(r.notRun ? '—' : r.value).padStart(6)}  ${state}`
}

/** What the run produced, judged and printed. */
function verdict({ produced, golden, outside, through, host, caseId, sandbox }) {
  // ONE READING OF THE MANIFEST, IN ci/golden.mjs. This used to be a second copy of the same
  // three lines, and the copy carried the same defect: it swept in the manifest's "Deliberately
  // not packaged" table and handed check 13 an 88-member library for an 81-file one.
  const rounds = acceptedStages(produced[CHANGE_LOG] ?? '').length
  const scored = score({ workspace: produced, library: library(), rounds, outside })
  const diff = compare(produced, golden)

  console.log(`${caseId} — driven to Round ${through}`)
  console.log(`  files produced:   ${Object.keys(produced).length}`)
  console.log(`  rounds accepted:  ${rounds}`)
  console.log(`  wall clock:       ${host.seconds}s over ${host.turns ?? '?'} turns`)
  console.log(
    `  model cost:       ${host.costUsd === null ? 'not reported by the host' : `$${host.costUsd.toFixed(4)}`}` +
      (host.attempts > 1 ? ' — the last attempt only; the dropped ones reported nothing' : '')
  )
  if (host.attempts > 1)
    console.log(`  host attempts:    ${host.attempts} — earlier ones dropped their connection part-way through`)

  console.log('\n  scorers')
  for (const r of scored.results) console.log(`    ${scorerRow(r)}`)

  console.log(`\n  structure vs ${GOLDEN}/${caseId}/`)
  if (!diff.gated.length) console.log('    no gated difference — the run reproduced the golden structure')
  for (const d of diff.gated) console.log(`    DIFFERS  ${d.kind}  ${d.path}\n               ${d.detail}`)
  for (const d of diff.reported) console.log(`    varies   ${d.path}  ${d.detail}`)

  if (outside.length) for (const p of outside) console.log(`    OUTSIDE  ${p} — written outside spec/`)
  if (sandbox) console.log(`\n  sandbox kept: ${sandbox}`)

  console.log('\n  this run does NOT establish (BR-009 — an unrun check is never a passed one):')
  console.log('    that the kit asks per file — edits were granted in advance (SEC-Z-002)')
  console.log('    that generated prose is stable — it is not, by design (ADR-002)')
  console.log('    anything about .git/ or .claude/ — the host writes those, not the kit')
  // Named here as well as in the table, because the table is where a reader looks for a number
  // and this block is where they look for what the number leaves out.
  for (const r of scored.notRun) console.log(`    anything about ${r.name} — ${r.why}`)
  // A workspace finished across two sessions was produced by the kit AND by its resume path.
  // That is a different claim from the one a single-session run makes, and a reader who is not
  // told cannot tell the two apart from the output.
  if (host.attempts > 1)
    console.log(`    that one session produces this — it took ${host.attempts}, resumed from disk (resume.md)`)

  const failed = diff.gated.length + scored.breaches.length
  if (failed) console.log(`\n  RESULT: FAIL — ${failed} gated difference${failed === 1 ? '' : 's'}`)
  // A pass here is a claim about STRUCTURE, and it stays a pass — the comparison did run. What
  // it must not do is carry unmeasured scorers along inside it silently.
  else if (scored.mayClaimSuccess) console.log('\n  RESULT: pass')
  else
    console.log(
      `\n  RESULT: pass — the structure reproduced. ${scored.notRun.length} scorer(s) did not run; they are not part of that claim.`
    )
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
