// ATEST-021, TEST-009, ETEST-001, FTEST-017, STEST-007 — the entry point.
// Requirement: REQ-F-020, REQ-F-026, REQ-NF-009 · BR-006 · ADR-005.
//
// A build agent opens ninety files with no memory of the interview. This is the one small
// map it reads first, so a broken link here is a broken link in every later context window.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CHECKS } from '../../ci/validation.mjs'

const doc = readFileSync('plugin/instructions/entrypoint.md', 'utf8')
const intake = readFileSync('plugin/instructions/intake.md', 'utf8')

test('TEST-009: the entry point is written LAST, after validation', () => {
  assert.match(doc, /After validation, after every other file, and never before/i)
  assert.match(doc, /a link nobody verified/i)
  assert.ok(
    intake.search(/## Step 2e — Validate/) < intake.search(/## Step 2f — Write the entry point/),
    'validation precedes the entry point'
  )
  assert.ok(intake.search(/### 2b\. Write/) < intake.search(/## Step 2f/), 'and everything it links to is already written')
})

test('a failed or unrun check means the entry point is NOT written', () => {
  assert.match(doc, /the entry point is not written at all/i)
  assert.match(doc, /points at a finished workspace that does not exist/i)
  assert.match(intake, /do not write it at all/i)
})

test('ATEST-021: under 100 lines, and what to do when it does not fit', () => {
  assert.match(doc, /Under 100 lines/i)
  assert.match(doc, /remove rows/i)
  // The cap is a signal, not an obstacle to route around.
  assert.match(doc, /the workspace has become hard to\s*\n?navigate/i)
  assert.match(doc, /rather than a reason to break the cap/i)
})

test('ETEST-001: it is a map, not a manual — links, not copies', () => {
  assert.match(doc, /Links, not copies/i)
  assert.match(doc, /Never restate a requirement, a rule, or a schema/i)
  // Why duplication is the specific danger here.
  assert.match(doc, /the copy drifts, both look\s*\n?authoritative/i)
  assert.match(doc, /links prominently to `AGENT\.md`, and does not summarise it/i)
})

test('no placeholder survives — an unknown command is a TODO, never a guess', () => {
  assert.match(doc, /worse than an empty section/i)
  assert.match(doc, /because it looks\s*\n?answered/i)
  assert.match(doc, /never a guess/i)
  assert.match(doc, /will be run by somebody/i)
})

test('ADR-005: the version is stamped, never invented, and never a timestamp', () => {
  assert.match(doc, /\[TODO: plugin version could not be determined\]/)
  assert.match(doc, /Never invent\s*\n?one/i)
  assert.match(doc, /a wrong stamp is worse than a missing one/i)
  assert.match(doc, /No generation timestamp/i)
  assert.match(doc, /churns every diff/i)
})

test('FTEST-017: the stamp turns a broken back-link into a diagnosis', () => {
  assert.match(doc, /back-links point at a library that has moved/i)
  assert.match(doc, /that is a diagnosis, not a defect report/i)
})

test('STEST-007: an existing CLAUDE.md is never touched, even if offered', () => {
  assert.match(doc, /never modified, never proposed, and never merged into — not even if they offer/i)
  assert.match(doc, /inside `spec\/`/i)
  assert.match(doc, /See spec\/CLAUDE\.md for the specification workspace/i)
  assert.match(doc, /One manual step is the entire cost/i)
  assert.match(intake, /Theirs is never modified and never\s*\nproposed/i)
})

test('inapplicable rows are dropped, and the reason is stated', () => {
  assert.match(doc, /Drop rows that do not apply/i)
  assert.match(doc, /An\s*\n?inapplicable row is not free/i)
  assert.match(doc, /teaches the reader the map is padded/i)
})

test('the structure a build agent needs is named', () => {
  for (const section of [/Start here/, /Working a task/, /Never/, /Commands/, /Where things stand/]) {
    assert.match(doc, section)
  }
})

// --- The cap is checkable, and check 10 already enforces it ------------------------------

test('ATEST-021: check 10 catches an entry point that breaks either rule', () => {
  const tooLong = { 'spec/CLAUDE.md': `# Map\n${'x\n'.repeat(120)}` }
  assert.equal(CHECKS[10].run(tooLong).state, 'failed')

  const brokenLink = { 'spec/CLAUDE.md': '# Map\n\n[gone](01-docs/nowhere.md)\n' }
  const r = CHECKS[10].run(brokenLink)
  assert.equal(r.state, 'failed')
  assert.match(r.detail.join(' '), /which does not exist/)

  const good = {
    'spec/CLAUDE.md': '# Map\n\n[intent](01-docs/intent.md)\n',
    'spec/01-docs/intent.md': '# Intent\n',
  }
  assert.equal(CHECKS[10].run(good).state, 'passed')
})
