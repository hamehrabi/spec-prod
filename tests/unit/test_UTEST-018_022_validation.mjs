// ATEST-024/033, UTEST-018/022, TEST-015, FTEST-005/006 — the validation walk.
// Requirement: REQ-F-029, REQ-F-037 · BR-009 · technical-spec §11.
//
// Every check is exercised against a DELIBERATELY BROKEN workspace. A check never seen to
// fail is untested, and an unfalsifiable check is worse than none: it makes the report look
// thorough while proving nothing.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CHECKS, validate, report } from '../../ci/validation.mjs'

const doc = readFileSync('plugin/instructions/validation.md', 'utf8')
const intake = readFileSync('plugin/instructions/intake.md', 'utf8')

const LIBRARY = ['01-docs/01-intent/intent.md', 'README.md', 'gitignore.md']

/** A minimal workspace that passes everything. */
const clean = () => ({
  'spec/01-docs/01-intent/intent.md':
    '# Intent\n\n| ID | Rule |\n|---|---|\n| REQ-F-001 | The system must do the thing. |\n\n' +
    '| Driver | Measure |\n|---|---|\n| Simplicity | FF-001 counts commands |\n\n' +
    'A role **cannot** write outside spec/ — its permission rule has a deny test.\n\n' +
    '> Blueprint: blueprints/01-docs/01-intent/intent.md\n',
  'spec/README.md':
    '# Project\n\nAbout REQ-F-001.\n\n| ID | Guards | Threshold |\n|---|---|---|\n' +
    '| FF-001 | Simplicity | exactly 1 command |\n\n> Blueprint: blueprints/README.md\n',
  'spec/.gitignore': '.env\nnode_modules/\n\n# Blueprint: blueprints/gitignore.md\n',
  // The entry point is written LAST, so check 10 legitimately reports not-run until it
  // exists. A "clean workspace" for these purposes is a finished one.
  'spec/CLAUDE.md':
    '# Project map\n\n| You need | Read |\n|---|---|\n' +
    '| Why this exists | [intent](01-docs/01-intent/intent.md) |\n\n> Blueprint: blueprints/README.md\n',
})

test('a clean workspace passes all twelve, and may claim success', () => {
  const v = validate(clean(), LIBRARY)
  const bad = v.results.filter((r) => r.state !== 'passed')
  assert.deepEqual(bad.map((r) => `${r.n}: ${r.state} — ${r.detail[0]}`), [], 'every check must pass on a clean workspace')
  assert.equal(v.mayClaimSuccess, true)
  assert.equal(report(v), 'All 12 checks ran; all 12 passed.')
})

// --- Each check, seen to fail -------------------------------------------------------------

const BREAKAGES = {
  1: (ws) => { ws['spec/README.md'] = ws['spec/README.md'].replace('REQ-F-001', 'REQ-F-999') },
  2: (ws) => { ws['spec/README.md'] = '# P\n\n| ID | Rule |\n|---|---|\n| REQ-F-001 | Again. |\n\n> Blueprint: blueprints/README.md\n' },
  3: (ws) => { ws['spec/README.md'] = ws['spec/README.md'].replace(/> Blueprint:.*\n/, '') },
  4: (ws) => { ws['spec/README.md'] += '\nProjectBoard is a kanban tool.\n' },
  5: (ws) => { ws['spec/README.md'] += '\n| Owner | [who owns this] |\n' },
  6: (ws) => { ws['spec/README.md'] += '\n[TODO: what is the retention period?]\n' },
  7: (ws) => { ws['spec/README.md'] += '\n| A | B |\n|---|---|\n| | |\n' },
  9: (ws) => { for (const k of Object.keys(ws)) ws[k] = ws[k].replaceAll('FF-001', 'it should feel simple') },
  10: (ws) => { ws['spec/CLAUDE.md'] = `# Map\n\n[missing](01-docs/nowhere.md)\n${'x\n'.repeat(120)}` },
  11: (ws) => { ws['spec/README.md'] += '\n```js\nfunction go() { return 1 }\n```\n' },
  12: (ws) => { ws['spec/.gitignore'] = 'node_modules/\n' },
}

for (const [n, breakIt] of Object.entries(BREAKAGES)) {
  test(`check ${n} (${CHECKS[n].name}) — seen to FAIL on a broken workspace`, () => {
    const ws = clean()
    breakIt(ws)
    const result = CHECKS[n].run(ws, LIBRARY)
    assert.equal(result.state, 'failed', `check ${n} must fail here, or it proves nothing`)
    assert.ok(result.detail.length > 0, 'a failure must name what and where')
  })
}

test('check 8 (deny tests) — seen to FAIL when rules exist without denials', () => {
  // Built separately: the breakage must remove the denial words without removing the rule.
  const ws = { 'spec/x.md': '# Roles\n\nThe admin role can delete records.\n\n> Blueprint: blueprints/README.md\n' }
  assert.equal(CHECKS[8].run(ws, LIBRARY).state, 'failed')
})

// --- BR-009: the three states ---------------------------------------------------------------

test('UTEST-022: a check that cannot run reports NOT RUN, never passed', () => {
  const ws = clean()
  delete ws['spec/.gitignore']
  const r = CHECKS[12].run(ws, LIBRARY)
  assert.equal(r.state, 'not-run')
  assert.match(r.detail[0], /could not be checked/i)

  const v = validate(ws, LIBRARY)
  assert.equal(v.ran, 11)
  assert.equal(v.mayClaimSuccess, false, 'not-run must block a success claim as firmly as failed')
  assert.match(report(v), /11 of 12 checks ran/)
  assert.match(report(v), /NOT fully validated/)
})

test('BR-009: success is never inferred from an absence of failures', () => {
  const ws = clean()
  delete ws['spec/.gitignore']
  const v = validate(ws, LIBRARY)
  assert.equal(v.failed, 0, 'nothing FAILED...')
  assert.equal(v.mayClaimSuccess, false, '...and it still cannot claim success')
  assert.doesNotMatch(report(v), /all \d+ passed/i)
})

test('ATEST-033: any failure blocks the success claim outright', () => {
  const ws = clean()
  ws['spec/README.md'] = ws['spec/README.md'].replace('REQ-F-001', 'REQ-F-999')
  const v = validate(ws, LIBRARY)
  assert.equal(v.mayClaimSuccess, false)
  assert.match(report(v), /NOT fully validated/)
})

// --- The written rules -----------------------------------------------------------------------

test('the module states why two states are not enough', () => {
  assert.match(doc, /Three states, never two/i)
  assert.match(doc, /identical output if you only print[\s>]+failures/i)
  assert.match(doc, /the number of checks that ran/i)
})

test('UTEST-018 / ATEST-024: retry once, then flag — no third attempt', () => {
  assert.match(doc, /re-filled \*\*once\*\*/i)
  assert.match(doc, /No third attempt/i)
  // Why: a file failing twice is evidence about the instruction, not the file.
  assert.match(doc, /evidence about the \*\*instruction\*\*/i)
  assert.match(doc, /converts a diagnosable problem into a loop/i)
})

test('validation reports; it does not repair', () => {
  assert.match(doc, /does not edit a file to make a\s*\n?check pass/i)
  assert.match(doc, /A check that rewrites its input until it agrees is not a check/i)
})

test('FTEST-005: a not-run check blocks the entry point and the hand-off', () => {
  assert.match(doc, /do not claim success\*\*, do not write the entry point/i)
  assert.match(doc, /announced as finished is the failure/i)
})

test('the empty state is an assertion, never silence', () => {
  assert.match(doc, /All 12 checks ran; all 12 passed/)
  assert.match(doc, /indistinguishable from a validation step that never happened/i)
})

test('validation runs before any success claim in the intake', () => {
  assert.match(intake, /Validate, before claiming anything worked/i)
  assert.ok(intake.search(/### 2b\. Write/) < intake.search(/## Step 2e — Validate/))
  assert.match(intake, /claim no success/i)
})

test('twelve, fixed — not a rules engine', () => {
  assert.match(doc, /Twelve, fixed/i)
  assert.match(doc, /has\s*\n?become a second product/i)
  assert.equal(Object.keys(CHECKS).length, 12)
})
