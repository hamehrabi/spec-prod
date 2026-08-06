// UTEST-040 — a dropped connection is retried; a real failure is not; neither becomes a pass.
// Requirement: TASK-016 · BR-009 · ADR-004 (resume derives its position, so a retry can resume).
//
// TWO VERIFICATION RUNS DIED IDENTICALLY, 25 minutes and about $6.15 each: `API Error: The
// socket connection was closed unexpectedly`. The host exited non-zero, the runner reported NOT
// RUN — which was correct — and the money, the minutes and the part-written workspace went with
// it. A single long non-interactive call is one dropped socket away from having bought nothing.
//
// A RETRY IS THE MOST DANGEROUS THING THAT CAN BE ADDED to a harness whose whole value is that
// it does not overclaim, and it has two failure modes, each worse than the problem it fixes:
// asking again until a genuine failure happens to come back looking different, and reporting a
// run that needed three attempts as though it had needed one. So the decision is a pure
// function, and this file is where both directions are watched happening rather than described
// in a comment — a check that has never been seen to fail is untested.
//
// NOTHING HERE SPAWNS A HOST. Every case below is a `spawnSync` result written out by hand. A
// test that needed a network in order to prove that a lost network is survivable could only ever
// run on the days it was not needed.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classifyHost } from '../../ci/generate-workspace.mjs'

/** What the host said on both dead runs, verbatim. */
const SOCKET = 'API Error: The socket connection was closed unexpectedly'

/** A `spawnSync` result. Defaults to a non-zero exit, which is how every failure here arrives. */
const exited = (fields = {}) => ({ status: 1, signal: null, error: undefined, stdout: '', stderr: '', ...fields })

/** One attempt of three, with twenty minutes of the run's ceiling still unspent. */
const ROOM = { timeoutMin: 45, attempt: 1, attempts: 3, msLeft: 20 * 60_000 }

// --- The failure that has actually happened -----------------------------------------------------

test('UTEST-040: the failure that killed two runs is retried', () => {
  const outcome = classifyHost(exited({ stderr: SOCKET }), ROOM)
  assert.equal(outcome.retry, true, 'a dropped socket must be worth another attempt')
  assert.equal(outcome.ran, false, 'and it is still not a run')
  assert.match(outcome.why, /connection dropped on attempt 1 of 3/)
  assert.ok(outcome.why.includes(SOCKET), 'the host\'s own words must survive into the reason')
})

test('UTEST-040: the signature survives the host hard-wrapping its own error', () => {
  // TEN DEFECTS HERE have been a regex that failed to match across a line break. The host wraps
  // error text to the width it believes the terminal has, so this message arrives broken in a
  // different place each time — and matching it raw would have missed the exact failure the
  // retry exists for, on the exact run it exists because of.
  const wrapped = 'API Error: The socket connection\nwas closed   unexpectedly\n    at ClientRequest.<anonymous>'
  assert.equal(classifyHost(exited({ stderr: wrapped }), ROOM).retry, true, 'a wrapped message was not recognised')

  const crlf = 'API Error: The socket connection was\r\n  closed unexpectedly'
  assert.equal(classifyHost(exited({ stderr: crlf }), ROOM).retry, true, 'CRLF broke the match')
})

// --- What must never be retried -----------------------------------------------------------------

test('UTEST-040: a genuine non-zero exit is not retried, and says what the host said', () => {
  // Each of these is a real outcome of a real run. Asking again changes nothing except the bill,
  // and three identical failures reported as one is how a harness starts hiding its own results.
  for (const stderr of [
    'Error: Invalid API key · Please run /login',
    'Credit balance is too low to run this request',
    'Error: ENOENT: no such file or directory, open \'plugin/blueprints/MANIFEST.md\'',
    'I cannot continue: the workspace already contains a spec/ directory I did not write',
  ]) {
    const outcome = classifyHost(exited({ stderr }), ROOM)
    assert.equal(outcome.retry, false, `retried a genuine failure: ${stderr}`)
    assert.equal(outcome.ran, false)
    assert.match(outcome.why, /the host exited 1/)
    assert.ok(outcome.why.includes(stderr), 'the reason must be the host\'s own words, not a paraphrase')
  }
})

test('UTEST-040: a workspace that talks about sockets does not buy a retry', () => {
  // stdout is a JSON transcript of what the model wrote, and a specification for a networking
  // project will contain the word socket. The classification reads the host's FAILURE REPORT —
  // stderr, and stdout only when stderr is empty — which is the same text the runner prints as
  // its reason, so what decides a retry and what a person reads cannot drift apart. A check that
  // matched the transcript would retry every failure of one kind of project three times over.
  const outcome = classifyHost(
    exited({
      status: 2,
      stderr: 'Error: the plugin at --plugin-dir could not be loaded',
      stdout: '{"result":"REQ-F-012: the socket connection was closed unexpectedly -> reconnect"}',
    }),
    ROOM
  )
  assert.equal(outcome.retry, false, 'the model\'s prose was read as a transport failure')
  assert.match(outcome.why, /the host exited 2/)
})

test('UTEST-040: nothing a second attempt cannot fix is retried', () => {
  const missing = classifyHost(
    exited({ status: null, error: Object.assign(new Error('spawnSync claude ENOENT'), { code: 'ENOENT' }) }),
    ROOM
  )
  assert.equal(missing.retry, false, 'a host that is not installed will not install itself')
  assert.match(missing.why, /not installed/)

  // The wall clock, not the connection — and note this one carries the socket message too. The
  // ceiling is shared across attempts, so a retry would spend the budget it has just exhausted
  // to die in the same place. Which failure a result is classified as cannot be decided by the
  // text alone when the text is present in both.
  const killed = classifyHost(exited({ status: null, signal: 'SIGTERM', stderr: SOCKET }), { ...ROOM, msLeft: 0 })
  assert.equal(killed.retry, false, 'a run killed at its ceiling was retried')
  assert.match(killed.why, /killed at the 45-minute ceiling/)

  const unstartable = classifyHost(exited({ status: null, error: new Error('EACCES, permission denied') }), ROOM)
  assert.equal(unstartable.retry, false)
  assert.match(unstartable.why, /could not be started/)
})

// --- The rule the retry must not bend -----------------------------------------------------------

test('UTEST-040: asking again never changes what an answer means', () => {
  // `ran` is a fact about what the host did. `retry` is a decision about what to do next. Moving
  // the attempt number must move the second and never the first, or "we tried again" would
  // eventually be readable as "it worked" (BR-009).
  const host = exited({ stderr: SOCKET })
  for (const attempt of [1, 2, 3, 4])
    assert.equal(classifyHost(host, { ...ROOM, attempt }).ran, false, `attempt ${attempt} reported a run`)

  // The only route to `ran: true` is a zero exit. No text in the transport list is on it.
  assert.equal(classifyHost(exited({ status: 0, stdout: '{"total_cost_usd":6.15}' })).ran, true)
  assert.equal(classifyHost(exited({ status: 0, stdout: '{}' })).retry, false, 'a run that worked is not retried')
})

test('UTEST-040: the last attempt is a refusal, and it says nothing ran', () => {
  const outcome = classifyHost(exited({ stderr: SOCKET }), { ...ROOM, attempt: 3 })
  assert.equal(outcome.retry, false, 'a fourth attempt was offered where three were allowed')
  assert.equal(outcome.ran, false, 'running out of attempts is NOT RUN — never a pass, never a fail')
  assert.match(outcome.why, /nothing ran to completion/)
  assert.doesNotMatch(outcome.why, /\bpass(ed)?\b/i)
})

test('UTEST-040: a retry that cannot fit inside the run\'s ceiling is not offered', () => {
  // `--timeout` is documented as the ceiling for THE RUN. A retry that renewed it would turn 45
  // minutes into 135 for someone who left the machine on the strength of the first number.
  const outcome = classifyHost(exited({ stderr: SOCKET }), { ...ROOM, msLeft: 0 })
  assert.equal(outcome.retry, false)
  assert.equal(outcome.ran, false)
  assert.match(outcome.why, /45-minute ceiling leaves no time for another attempt/)
})
