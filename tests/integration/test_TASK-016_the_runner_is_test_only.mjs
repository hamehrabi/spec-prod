// TASK-016 — the workspace runner is test scaffolding, and cannot become anything else.
// Requirement: ADR-002 · FF-009 · BR-009 · TASK-016 "None of this ships in the plugin payload".
//
// A runner that drives the kit is useful enough that someone will eventually want it packaged
// — it generates a workspace from a fixed set of answers, which sounds like a feature. It is
// not one. The kit ships instructions and nothing else (ADR-002), and the moment an executable
// lives inside the payload that architecture is gone rather than bent.
//
// The guard is not a comment asking people to remember. It is FF-009, which already blocks the
// merge, and this file demonstrates it blocking — because cicd-pipeline.md's own rule is that
// a check nobody has watched fail is untested.
//
// The second half is BR-009. This runner needs a network, a host and money, so it will often
// be unable to run at all. Every one of those paths must say NOT RUN and claim nothing. A
// harness that reports a pass when it did nothing is worse than no harness: it manufactures
// exactly the false confidence it was built to remove.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { run, check, payloadCopy, REPO } from '../_helpers.mjs'
import { hostArgs } from '../../ci/generate-workspace.mjs'

const RUNNER = 'ci/generate-workspace.mjs'
const MODULES = [RUNNER, 'ci/answers.mjs', 'ci/workspace.mjs']

// --- It cannot ship --------------------------------------------------------------------------

test('TASK-016: the runner lives outside the payload', () => {
  for (const module of MODULES) assert.ok(!module.startsWith('plugin/'), `${module} is inside the payload root`)
})

test('TASK-016: FF-009 blocks the merge if the runner is copied into the payload', () => {
  const payload = payloadCopy()
  try {
    mkdirSync(join(payload.root, 'ci'), { recursive: true })
    copyFileSync(join(REPO, RUNNER), join(payload.root, 'ci', 'generate-workspace.mjs'))
    const result = run(check('ff-009-no-executable-payload.mjs'), [payload.root])
    assert.equal(result.code, 1, 'FF-009 must fail')
    assert.match(result.stdout, /generate-workspace\.mjs is neither Markdown/)
    assert.match(result.stdout, /blocks the merge/)
  } finally {
    payload.cleanup()
  }
})

test('TASK-016: FF-009 passes on the payload as it stands', () => {
  // The other half of the demonstration. A check that fails on everything proves nothing about
  // the case it flagged.
  assert.equal(run(check('ff-009-no-executable-payload.mjs')).code, 0)
})

// --- It never claims a pass it did not earn -----------------------------------------------------

const runner = (args) => run(join(REPO, RUNNER), args)

test('TASK-016: no case id is NOT RUN, not a failure and not a pass', () => {
  const result = runner([])
  assert.equal(result.code, 2, 'not run has its own exit code — three states, never two')
  assert.match(result.stdout, /RESULT: NOT RUN/)
  assert.match(result.stdout, /no claim is made about the kit either way/)
  assert.doesNotMatch(result.stdout, /RESULT: pass/)
})

test('TASK-016: an unknown case is NOT RUN and says which file was missing', () => {
  const result = runner(['EV-999'])
  assert.equal(result.code, 2)
  assert.match(result.stdout, /no answer record at tests\/fixtures\/golden\/EV-999-answers\.md/)
  assert.doesNotMatch(result.stdout, /RESULT: pass/)
})

test('TASK-016: --dry-run composes the prompt, spawns nothing, and claims nothing', () => {
  const result = runner(['EV-001', '--dry-run'])
  assert.equal(result.code, 2, 'a dry run verified nothing, so it is NOT RUN')
  assert.match(result.stdout, /Run the specification intake in this repository\./)
  assert.match(result.stdout, /At each round gate the developer's response is: accept\./)
  assert.match(result.stdout, /RESULT: NOT RUN/)
  assert.doesNotMatch(result.stdout, /RESULT: pass/)
})

test('TASK-016: the prompt a dry run prints carries no harness vocabulary', () => {
  // The same guarantee UTEST-032 makes of drivePrompt, asserted at the boundary a person
  // actually looks at. A leak here would reach a real run.
  const { stdout } = runner(['EV-001', '--dry-run'])
  const prompt = stdout.split('RESULT: NOT RUN')[0]
  for (const leak of ['TASK-016', 'GOLD-001', 'fixture', 'golden', 'harness', 'EV-001'])
    assert.doesNotMatch(prompt, new RegExp(leak, 'i'), `"${leak}" would reach a real run`)
})

test('TASK-016: the run is driven to the round the golden workspace actually accepted', () => {
  // Not to a number written here. The golden records its own position in a dated row, and
  // reading it is the same discipline the kit itself follows — no state file, anywhere (ADR-004).
  const { stdout } = runner(['EV-001', '--dry-run'])
  assert.match(stdout, /After Round 3 is accepted and its row is written/)
  assert.match(stdout, /Do not begin Round 4\./)
})

test('TASK-016: nothing the developer said reaches the host on a command line', () => {
  // The first real run of this script put the prompt in argv. On Windows a shell-spawned
  // argument list is concatenated rather than escaped, the host received nothing usable, and
  // the sandbox came back holding only .git. It is also the injection surface: the prompt is
  // built from a file on disk, and anything that reaches a command line from a file is a
  // command somebody else can write. The prompt goes over stdin, and this is the guard.
  for (const arg of hostArgs({ model: 'sonnet' })) {
    assert.doesNotMatch(arg, /[\r\n]/, `${JSON.stringify(arg)} would be mangled by a shell`)
    assert.ok(arg.length < 300, 'no argument is long enough to be a prompt')
  }
  assert.ok(hostArgs().includes('-p'), 'the host still runs non-interactively')
  assert.ok(!hostArgs().includes('--model'), 'no model is forced when none was asked for')
})

test('TASK-016: the runner states what it does not establish', () => {
  // A harness that lists only what it checked reads as though it checked everything. These
  // three gaps are real and none of them is closeable by this tool.
  const source = readFileSync(join(REPO, RUNNER), 'utf8')
  for (const gap of ['SEC-Z-002', 'ADR-002', 'BR-009']) assert.match(source, new RegExp(gap))
  // And it says so where a person reading a result will see it, not only in a comment.
  assert.match(source, /this run does NOT establish/)
})
