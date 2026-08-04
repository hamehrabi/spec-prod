// EV-001…036 — the golden set and the eval harness.
// Requirement: ai-evals.md · FF-003…FF-014 · REQ-NF-007, REQ-NF-008.
//
// CON-007 forbids telemetry, so the kit is structurally unable to observe its own failure
// rate in the field. This set is the only substitute there is — and the only way to answer
// "did rewording that question help?", which for a product made entirely of prose is every
// question worth asking.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { score, runSet, releaseGate } from '../../ci/eval-runner.mjs'
import { SCORERS, HUMAN_SCORERS } from '../../ci/scorers.mjs'

const SCRIPTS = 'tests/fixtures/answer-scripts'
const scripts = readdirSync(SCRIPTS).map((f) => JSON.parse(readFileSync(`${SCRIPTS}/${f}`, 'utf8')))

// --- The set ------------------------------------------------------------------------------

test('36 cases exist, in the specified proportions', () => {
  assert.equal(scripts.length, 36)
  const count = (k) => scripts.filter((s) => s.category === k).length
  assert.equal(count('happy'), 16)
  assert.equal(count('edge'), 10)
  assert.equal(count('adversarial'), 6)
  assert.equal(count('must-refuse'), 4)
})

test('every script is labelled INVENTED', () => {
  // They cover what the kit author thought of, not what a real developer does. Saying so is
  // the difference between a baseline and a claim about reality.
  for (const s of scripts) assert.match(s.origin, /INVENTED/)
})

test('EV-027 expects the intake to PROCEED, not to judge the product', () => {
  // Deliberately in the set. Without a case testing this boundary, a future change could
  // quietly make the kit judgemental about its users' products — degrading output for
  // projects it disapproves of, with nobody deciding that.
  const ev27 = scripts.find((s) => s.id === 'EV-027')
  assert.equal(ev27.category, 'adversarial')
  assert.match(ev27.expect, /proceeds normally/i)
  assert.match(ev27.expect, /the developer's product is theirs/i)
})

test('EV-036 refuses even though permission was offered', () => {
  // The sharpest must-refuse: consent is given and the answer is still no.
  const ev36 = scripts.find((s) => s.id === 'EV-036')
  assert.equal(ev36.category, 'must-refuse')
  assert.match(ev36.expect, /EVEN THOUGH PERMISSION WAS OFFERED/)
  assert.match(ev36.expect, /design rule, not a consent rule/i)
})

test('the five repository fixtures exist, including the awkward ones', () => {
  const repos = readdirSync('tests/fixtures/repositories')
  for (const r of ['clean', 'has-claude-md', 'has-gitignore', 'populated-spec', 'read-only']) {
    assert.ok(repos.includes(r), `${r} fixture must exist`)
  }
})

// --- The engine / scorer split --------------------------------------------------------------

test('adding a scorer requires NO change to the engine', () => {
  // The property the whole harness is arranged around. If this breaks, every experiment
  // becomes a harness change — an hour each, forever.
  const invented = {
    name: 'headings_present',
    kind: 'deterministic',
    measure: (r) => (Object.values(r.workspace).join('').match(/^# /gm) ?? []).length,
    floor: 1,
    comparator: 'at-most',
    hardFail: false,
  }
  const run = { workspace: { 'spec/a.md': '# One\n' }, library: ['a.md'] }
  const result = score(run, [invented])
  assert.equal(result.results.length, 1)
  assert.equal(result.results[0].name, 'headings_present')
})

test('eleven deterministic scorers, two human — and the ratio is a decision', () => {
  assert.equal(SCORERS.length, 11)
  assert.equal(HUMAN_SCORERS.length, 2)
  assert.ok(SCORERS.every((s) => s.kind === 'deterministic'))
  // There is no model-graded scorer, deliberately: grading a model-driven system with a
  // model drifts on both sides at once, and the drift is invisible because they move together.
  assert.ok(SCORERS.every((s) => s.kind !== 'model'))
})

test('hard-fail scorers block; soft ones are reported', () => {
  const bad = {
    workspace: { 'spec/a.md': '# A\n\n| Owner | [who] |\n\n> Blueprint: blueprints/a.md\n' },
    library: ['a.md'],
    rounds: 3,
  }
  const r = score(bad)
  const leftover = r.results.find((x) => x.name === 'no_leftover_template')
  assert.ok(leftover.value > 0, 'the placeholder is counted')
  assert.equal(r.passes, false, 'and it blocks, because it is a hard-fail scorer')
})

test('rounds_within_limit is an at-most comparison, not an equality', () => {
  const under = score({ workspace: {}, library: [], rounds: 5 })
  assert.equal(under.results.find((s) => s.name === 'rounds_within_limit').atFloor, true)
  const over = score({ workspace: {}, library: [], rounds: 9 })
  assert.equal(over.results.find((s) => s.name === 'rounds_within_limit').atFloor, false)
})

test('todo_density is reported but NOT gated', () => {
  // Q-014 stays open until ten real runs exist. Guessing the threshold now would invent the
  // definition of "hollow", which is the one thing this metric exists to detect.
  const s = SCORERS.find((x) => x.name === 'todo_density')
  assert.equal(s.floor, null)
  assert.equal(s.hardFail, false)
  assert.match(s.note, /no threshold until ten real runs/i)
  assert.ok(score({ workspace: {}, library: [] }).ungated.includes('todo_density'))
})

test('inference_stated counts suppressions with no notice', () => {
  const silent = score({ workspace: {}, library: [], suppressed: 3, notices: 1 })
  assert.equal(silent.results.find((s) => s.name === 'inference_stated').value, 2)
  const stated = score({ workspace: {}, library: [], suppressed: 3, notices: 3 })
  assert.equal(stated.results.find((s) => s.name === 'inference_stated').value, 0)
})

test('boundary_respected counts files outside spec/ AND state files anywhere', () => {
  const leaky = score({
    workspace: { 'spec/.progress': 'round 3\n' },
    library: [],
    outside: ['README.md'],
  })
  assert.equal(leaky.results.find((s) => s.name === 'boundary_respected').value, 2)
})

test('depth_scaled catches a supporting spec longer than the core one', () => {
  const wrong = score({
    workspace: { 'spec/core.md': '# C\n', 'spec/support.md': `# S\n${'x\n'.repeat(40)}` },
    library: [],
    coreFiles: ['spec/core.md'],
    supportingFiles: ['spec/support.md'],
  })
  assert.equal(wrong.results.find((s) => s.name === 'depth_scaled').value, 1)
})

// --- Running a set ---------------------------------------------------------------------------

test('runSet reports per case and per category', () => {
  const execute = () => ({ workspace: {}, library: [], rounds: 4 })
  const r = runSet(scripts, execute)
  assert.equal(r.cases.length, 36)
  assert.deepEqual(r.byCategory.map((c) => c.total), [16, 10, 6, 4])
})

test('the release gate is named, so its absence is visible', () => {
  const g = releaseGate()
  assert.equal(g.humanScorers.length, 2)
  assert.match(g.rule, /at least four cases read by a person/i)
  // Why the human scorers cannot be dropped for being slow.
  assert.match(g.why, /beautifully-formatted empty workspace/i)
})
