// UTEST-080 — a scorer whose input was never supplied reports NOT RUN, not its floor.
// UTEST-081 — `no_code_written` can see a source file.
// Requirement: BR-009 (three states, never two) · BR-001 · ai-evals.md §2, §5.
//
// WHY THIS FILE EXISTS. `inference_stated` and `depth_scaled` read fields the runner has never
// supplied. Both fell through to `?? 0` and `?? []`, both computed 0, and 0 is the best score
// either can have — so both printed `at floor`, in the same column and the same words as
// `no_example_content`, which arrives there by scanning every file in the workspace. A reader
// could not tell the two apart, and one of them is a measurement.
//
// That is BR-009's failure committed by the harness built to enforce BR-009, and it did real
// damage: ai-evals.md §5 recorded "9 of 11 scorers at floor" for the first measured run this
// product ever had. Two of the nine had measured nothing.
//
// The second half is BR-001 — "the kit writes specifications, never code". `no_code_written` is
// the scorer for it, and it delegated to a validation check that opens `.md` files only. A
// workspace consisting of one JavaScript file scored zero. Perfect.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { score } from '../../ci/eval-runner.mjs'
import { SCORERS, sourceFiles } from '../../ci/scorers.mjs'
import { scorerRow } from '../../ci/generate-workspace.mjs'

/** What ci/generate-workspace.mjs actually passes: no suppressed, notices, core or supporting. */
const asTheRunnerCallsIt = (workspace = {}, library = []) => ({ workspace, library, rounds: 3, outside: [] })

const named = (result, name) => result.results.find((r) => r.name === name)

// --- UTEST-080: not run is a third state ------------------------------------------------------

test('UTEST-080: the two scorers the runner cannot feed report NOT RUN, not zero', () => {
  const r = score(asTheRunnerCallsIt())
  for (const name of ['inference_stated', 'depth_scaled']) {
    const s = named(r, name)
    assert.equal(s.notRun, true, `${name} claimed to have measured something`)
    assert.equal(s.atFloor, false, `${name} must not be reported at its floor on no evidence`)
    assert.equal(s.value, null, `${name} must not report a number it did not compute`)
    assert.match(s.why, /nothing was measured/)
  }
  assert.deepEqual(r.notRun.map((s) => s.name), ['inference_stated', 'depth_scaled'])
})

test('UTEST-080: and they still MEASURE when the inputs are there', () => {
  // The other direction, and the one that decides whether this is a check or a switch. A scorer
  // that always says NOT RUN is as useless as one that always says zero.
  const stated = score({ workspace: {}, library: [], suppressed: 3, notices: 1 })
  assert.equal(named(stated, 'inference_stated').notRun, false)
  assert.equal(named(stated, 'inference_stated').value, 2)
  assert.equal(named(stated, 'inference_stated').atFloor, false)

  const clean = score({ workspace: {}, library: [], suppressed: 3, notices: 3 })
  assert.equal(named(clean, 'inference_stated').value, 0)
  assert.equal(named(clean, 'inference_stated').atFloor, true)

  const inverted = score({
    workspace: { 'spec/core.md': '# C\n', 'spec/support.md': `# S\n${'x\n'.repeat(40)}` },
    library: [],
    coreFiles: ['spec/core.md'],
    supportingFiles: ['spec/support.md'],
  })
  assert.equal(named(inverted, 'depth_scaled').notRun, false)
  assert.equal(named(inverted, 'depth_scaled').value, 1)
})

test('UTEST-080: a partial input is still NOT RUN — half a measurement is not a measurement', () => {
  const half = score({ workspace: {}, library: [], suppressed: 3 })
  assert.equal(named(half, 'inference_stated').notRun, true)
  assert.match(named(half, 'inference_stated').why, /notices/)
})

test('UTEST-080: NOT RUN is neither a breach nor a pass', () => {
  const r = score(asTheRunnerCallsIt())
  assert.equal(r.breaches.length, 0, 'an unmeasured scorer must not be reported as a failure')
  assert.equal(r.passes, true, 'nor does it block — nothing failed')
  // But the set may not be described as clean. Same rule and same name as ci/validation.mjs.
  assert.equal(r.mayClaimSuccess, false, '"no failures" and "nothing was measured" are different facts')
  // An ungated scorer is a decision not to set a threshold; an unmeasured one is an absence of
  // evidence. They must not be collapsed into the same list.
  assert.deepEqual(r.ungated, ['todo_density'])
})

test('UTEST-080: NOT RUN and "at floor" do not read the same in the report', () => {
  // The worked example is the real run of 2026-08-07 — EV-001 driven to Round 3, 11 files, 1391 s
  // over 51 turns, $6.91 — which reported `structural_checks 1 BREACH` and every other scorer
  // "at floor" or ungated. Two of those rows were these two, and this is what it should have
  // printed instead.
  const rows = score(asTheRunnerCallsIt()).results.map(scorerRow)
  const row = (name) => rows.find((l) => l.startsWith(name))

  assert.match(row('inference_stated'), /NOT RUN/)
  assert.match(row('depth_scaled'), /NOT RUN/)
  assert.doesNotMatch(row('inference_stated'), /at floor/)
  assert.doesNotMatch(row('depth_scaled'), /at floor/)
  // No number in the value column either: a 0 among 0s is read as a measurement, and 0 is the
  // best score this scorer has.
  assert.doesNotMatch(row('inference_stated'), /\b0\b/)

  // And the rows that DID measure still say so, or the distinction is meaningless.
  assert.match(row('no_example_content'), /at floor/)
  assert.match(row('todo_density'), /ungated/)
})

test('UTEST-080: the runner names the unmeasured scorers where it lists what it did not establish', () => {
  const source = readFileSync(new URL('../../ci/generate-workspace.mjs', import.meta.url), 'utf8')
  const block = source.slice(source.indexOf('this run does NOT establish'))
  assert.match(block, /scored\.notRun/, 'the gaps block is where a reader looks for what is missing')
})

test('UTEST-080: the recorded baseline no longer counts the two unmeasured scorers as at floor', () => {
  // ai-evals.md §5 is the only measurement this product has ever taken, and it read "9 of 11
  // scorers at floor; 2 breaches". Two of those nine had measured nothing. Correcting a published
  // number downwards is the whole point of recording it, so the row says what changed and why —
  // a silent edit would leave a reader unable to tell a correction from a different run.
  // Blockquote markers stripped BEFORE whitespace is collapsed: the note is a blockquote, hard
  // wrapped, so a `>` lands mid-sentence otherwise and every phrase assertion silently misses.
  const evals = readFileSync('spec-driven-devkit/03-tests/03-non-functional/ai-evals.md', 'utf8')
    .replace(/^>\s?/gm, '')
    .replace(/\s+/g, ' ')
  assert.doesNotMatch(evals, /9 of 11 scorers at floor; 2 breaches \|/, 'the inflated figure is back')
  assert.match(evals, /7 of 11 scorers at floor; 2 breaches; \*\*2 not run\*\*/)
  assert.match(evals, /corrected downwards after it was published/)
  assert.match(evals, /inference_stated` and `depth_scaled`/)
  // 7 + 2 + 2 = 11, stated rather than left to the reader.
  assert.match(evals, /the arithmetic is 7 \+ 2 \+ 2/)
})

test('UTEST-080: `requires` is declared, not guessed from an undefined result', () => {
  // A scorer that threw would also produce nothing. The two must not be reported the same way,
  // so the requirement is written down per scorer rather than inferred.
  assert.deepEqual(SCORERS.find((s) => s.name === 'inference_stated').requires, ['suppressed', 'notices'])
  assert.deepEqual(SCORERS.find((s) => s.name === 'depth_scaled').requires, ['coreFiles', 'supportingFiles'])
  // Every other scorer reads only the workspace, and must keep running on the runner's inputs.
  const r = score(asTheRunnerCallsIt())
  assert.equal(r.results.filter((s) => s.notRun).length, 2, 'exactly two, or a working scorer went quiet')
})

// --- UTEST-081: no_code_written can see code ---------------------------------------------------

test('UTEST-081: a workspace that is one JavaScript file does not score zero', () => {
  const r = score({ workspace: { 'spec/app.js': 'function start(p){return p}\n' }, library: [] })
  assert.ok(named(r, 'no_code_written').value > 0, 'the scorer for BR-001 was blind to a source file')
  assert.equal(named(r, 'no_code_written').atFloor, false)
  assert.ok(
    r.breaches.some((b) => b.name === 'no_code_written'),
    'and it is a hard fail — BR-001 is the boundary the whole product is'
  )
})

test('UTEST-081: it does not fail a workspace of specifications', () => {
  // The direction that matters more. A check that fails on correct work gets switched off, and
  // this one guards the product's defining rule.
  const r = score({
    workspace: {
      'spec/01-docs/01-intent/intent.md': '# Intent\n\nProse about a product.\n\n> Blueprint: blueprints/01-docs/01-intent/intent.md\n',
      'spec/README.md': '# Workspace\n\n> Blueprint: blueprints/README.md\n',
    },
    library: ['01-docs/01-intent/intent.md', 'README.md'],
  })
  assert.equal(named(r, 'no_code_written').value, 0)
})

test('UTEST-081: a wrapper artifact is not code, and it is recognised by its back-link', () => {
  // `.gitignore` and `.env.example` are the two non-Markdown files a run is allowed to produce
  // (Q-024). They are exempt because they carry the fill procedure's back-link as a comment —
  // not because their names are on a list, which is how an exemption grows until it means nothing.
  const produced = 'node_modules/\n.env\n\n# Blueprint: blueprints/gitignore.md\n'
  assert.deepEqual(sourceFiles({ 'spec/.gitignore': produced }), [])
  assert.deepEqual(sourceFiles({ 'spec/.gitignore': 'node_modules/\n' }), ['spec/.gitignore'])
  // And a back-link does not launder a file that is plainly code.
  assert.deepEqual(
    sourceFiles({ 'spec/app.js': '// Blueprint: blueprints/README.md\nfunction start(p){return p}\n' }),
    ['spec/app.js']
  )
})
