// ATEST-014, UTEST-012/013, ETEST-007 — express depth.
// Requirement: REQ-F-033, REQ-F-034 · DD-006 · FF-001.
//
// A small project should not be made to carry full depth. But a second FLOW would be
// exercised half as often and would rot — so the only way to have express without
// undercutting Simplicity is to make it an argument.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseQuestions } from '../../ci/questions.mjs'
import { table } from '../_helpers.mjs'

const depth = readFileSync('plugin/instructions/depth.md', 'utf8')
const intake = readFileSync('plugin/instructions/intake.md', 'utf8')
const command = readFileSync('plugin/commands/spec-intake.md', 'utf8')
const report = readFileSync('plugin/instructions/report.md', 'utf8')
const { text: questions } = parseQuestions()

// The per-stage table is the whole of REQ-F-033: each row says what a stage does at DEFAULT
// depth and what it does at EXPRESS. Only the Express cell is evidence about express, so every
// assertion below reads that cell by name rather than searching the document.
const stages = table(depth, 'Stage')
const NEVER_DROPPED = ['The free-text problem statement', 'Core-subdomain question']
const DROPPED = /\b(dropp?ed|drop|skipp?ed|skip|omitted|omit|not asked|only if|when time|optional)\b/i

test('UTEST-013 / REQ-F-034: depth is an argument, never a second path', () => {
  assert.match(depth, /It changes how much is asked and written\. It never changes which path runs/i)
  assert.match(intake, /never \*\*which path runs\*\*/i)
  // The reason it is a parameter and not a mode, stated where someone might add the branch.
  assert.match(depth, /exercised half as often\s*\n?and would rot/i)
  assert.match(intake, /would be exercised half as often and\s*\nwould rot/i)
})

test('UTEST-013: depth is the ONLY argument, and bad values are rejected by name', () => {
  assert.match(intake, /\*\*one argument, and only one\*\*/i)
  assert.match(intake, /depth must be `default` or\s*\n?`express`/i)
  assert.match(command, /argument-hint: "\[default\|express\]"/)
})

test('UTEST-012 / ATEST-014: express reduces WITHIN a stage, never deletes one', () => {
  assert.match(depth, /Reduce within a stage; never delete a stage/i)
  assert.match(depth, /Every stage still runs, and every stage still produces its minimum artifacts/i)
  // Every stage carries both cells. A blank Express cell is a deleted stage written as a gap.
  for (const label of stages.labels) {
    assert.ok(stages.cell(label, 'Default').length > 0, `"${label}" has no Default behaviour`)
    assert.ok(stages.cell(label, 'Express').length > 0, `"${label}" has no Express behaviour — a stage express deletes`)
  }
  assert.match(stages.cell('Rounds asked', 'Express'), /\*\*Up to two\*\*/i, 'fewer questions per round')
  assert.match(stages.cell('Rounds asked', 'Default'), /Up to four/i, 'and more of them at default, or express reduces nothing')
})

// THIS TEST USED TO PASS ON A DOCUMENT SAYING THE OPPOSITE. `/free-text problem
// statement.*Always asked.*only thing grounding/is` took its "Always asked" from the DEFAULT
// column, so the Express column — the only cell the test is named after — could have read
// "**Dropped.** It is the only thing grounding the workspace" and the assertion still held.
test('the two questions express never drops are the two that decide the rest', () => {
  for (const label of NEVER_DROPPED) {
    const express = stages.cell(label, 'Express')
    assert.match(express, /^\*\*Always asked\.?\*\*/i, `the EXPRESS cell for "${label}" must itself say it is always asked`)
    assert.doesNotMatch(express, DROPPED, `the EXPRESS cell for "${label}" says it can be dropped`)
  }
  // Each is kept for a stated reason, and the two reasons are different — the free-text
  // statement grounds the workspace; the core subdomain decides where the depth goes.
  assert.match(stages.cell('The free-text problem statement', 'Express'), /only thing grounding/i)
  assert.match(stages.cell('Core-subdomain question', 'Express'), /decides where the remaining depth goes/i)
  assert.match(questions, /asked at \*\*both\*\* depths, always/i)
})

test('the acceptance gate is not a depth setting', () => {
  const gate = stages.cell('Acceptance gate', 'Express')
  assert.match(gate, /Every round/i)
  assert.match(gate, /Never skippable, at any depth/i)
  assert.doesNotMatch(gate, DROPPED)
  // Nor is the three-driver limit: the same number in both columns, and it says so.
  assert.match(stages.cell('Driving characteristics', 'Default'), /Up to three/i)
  assert.match(stages.cell('Driving characteristics', 'Express'), /Up to three\.\*\* The limit is not a depth setting/i)
})

test('ETEST-007: a thinner workspace is not a weaker one', () => {
  assert.match(depth, /Every structural rule holds identically at both depths/i)
  assert.match(depth, /reduces \*\*volume\*\*, never \*\*validity\*\*/i)
  // The distinction that matters: skipping a check is not thinness.
  assert.match(depth, /skipped a check to be faster/i)
  assert.match(depth, /it is an unvalidated one/i)
})

test('two depths, not three — a third would be a configuration system', () => {
  assert.match(depth, /Two depths, not three/i)
  assert.match(depth, /a configuration system is a\s*\n?set of branches nobody exercises evenly/i)
})

test('the closing report names which stages were written thin', () => {
  assert.match(depth, /names which stages were written thin/i)
  assert.match(report, /Which stages were written thin/i)
  assert.match(report, /Written at full depth throughout/i)
  // So the developer knows it was a choice, not a gap.
  assert.match(report, /a choice they made\*\*, not a gap/i)
})
