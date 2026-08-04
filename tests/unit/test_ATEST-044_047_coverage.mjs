// ATEST-044/047, UTEST-031, TEST-019, FTEST-021 — blueprint coverage, check 13.
// Requirement: REQ-F-040, REQ-F-043 · FF-015, FF-018.
//
// This exists because of a gap nothing else caught. The structural checks verify a generated
// file MATCHES its blueprint; a blueprint the intake never reached produces no file, no
// mismatch and no complaint. A workspace could pass everything while missing a whole
// specification document.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CHECKS, validate } from '../../ci/validation.mjs'

const coverage = readFileSync('plugin/instructions/coverage.md', 'utf8')
const intake = readFileSync('plugin/instructions/intake.md', 'utf8')
const validation = readFileSync('plugin/instructions/validation.md', 'utf8')

const LIBRARY = ['01-docs/01-intent/intent.md', 'README.md', 'frontend-component-spec.md']

const workspace = (extra = '') => ({
  'spec/01-docs/01-intent/intent.md': '# Intent\n\n> Blueprint: blueprints/01-docs/01-intent/intent.md\n',
  'spec/README.md': '# P\n\n> Blueprint: blueprints/README.md\n',
  'spec/01-docs/09-change-control/spec-change-log.md':
    `# Change log\n\n| Date | Type | Artifact | Reason |\n|---|---|---|---|\n${extra}`,
})

// --- FTEST-021: seen to fail ---------------------------------------------------------------

test('FTEST-021: a blueprint no round reached fails check 13, named by path', () => {
  const r = CHECKS[13].run(workspace(), LIBRARY)
  assert.equal(r.state, 'failed')
  assert.match(r.detail.join('\n'), /frontend-component-spec\.md/, 'the path is the actionable part')
  assert.match(r.detail[0], /neither filled nor skipped/)
})

test('ATEST-044: a recorded skip WITH a reason satisfies coverage', () => {
  const ws = workspace('| 2026-08-04 | Skipped | frontend-component-spec.md | API-only product; no interface |\n')
  assert.equal(CHECKS[13].run(ws, LIBRARY).state, 'passed')
})

test('UTEST-031: a skip with no reason does NOT satisfy coverage', () => {
  // "A skip with no reason is a silent skip wearing a label." It must not pass.
  const ws = workspace('| 2026-08-04 | Skipped | frontend-component-spec.md |  |\n')
  assert.equal(CHECKS[13].run(ws, LIBRARY).state, 'failed')
})

test('appendix-index.md is a permanent exclusion, never a per-run skip', () => {
  const r = CHECKS[13].run(workspace(), [...LIBRARY.slice(0, 2), '01-docs/10-reference/appendix-index.md'])
  assert.equal(r.state, 'passed', 'it is scaffolding, not an artifact of anyone project')
  assert.match(coverage, /never generated and never skipped/i)
})

test('check 13 reports NOT RUN when the manifest is unavailable — never passed', () => {
  const r = CHECKS[13].run(workspace(), null)
  assert.equal(r.state, 'not-run')
  const v = validate(workspace(), null)
  assert.equal(v.mayClaimSuccess, false)
})

test('a coverage failure blocks the success claim like any other', () => {
  const v = validate(workspace(), LIBRARY)
  assert.equal(v.mayClaimSuccess, false)
  assert.equal(v.total, 13)
})

// --- REQ-F-043 / FF-018: derived, never listed ---------------------------------------------

test('REQ-F-043: the hardcoded file list is gone from intake.md', () => {
  assert.doesNotMatch(intake, /spec\/01-docs\/01-intent\/project-brief\.md/, 'no list survives')
  assert.match(intake, /derived from the manifest, never from a list written here/i)
  assert.match(intake, /adding a blueprint changes nothing until someone/i)
})

test('ATEST-047 / FF-018: rounds own DIRECTORIES, so a new blueprint needs no edit', () => {
  assert.match(coverage, /Rounds own directories, not files/i)
  assert.match(coverage, /makes it required, with no change to any\s*\n?instruction/i)
  // And the failure case is a finding, not an implicit pass.
  assert.match(coverage, /a directory no round owns is a coverage failure, not an implicit skip/i)
  assert.match(coverage, /the round map has a hole or the blueprint should not ship/i)
})

test('an unreached blueprint is never auto-skipped', () => {
  assert.match(coverage, /Never auto-skip what the run did not reach/i)
  // The distinction that makes the check worth having.
  assert.match(coverage, /a skip is a decision someone made about this product/i)
  assert.match(coverage, /quietly producing less than it promised/i)
})

test('the skip record reuses an existing artifact rather than adding a file', () => {
  assert.match(coverage, /spec-change-log\.md/)
  assert.match(coverage, /\*\*No new file\*\*/i)
  assert.match(coverage, /accumulates files nobody reads/i)
})

test('check 13 is documented in the validation module and names paths', () => {
  assert.match(validation, /\| 13 \| Every blueprint was filled, or recorded as skipped/i)
  assert.match(validation, /names every uncovered blueprint by path/i)
  assert.match(validation, /the path is the only actionable part/i)
})

test('the gap this task closes is stated, not assumed', () => {
  assert.match(coverage, /a gap nothing else caught/i)
  assert.match(coverage, /no file, no mismatch and no complaint/i)
  assert.match(coverage, /will it use all the templates\?/i)
})
