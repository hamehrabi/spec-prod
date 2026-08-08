// UTEST-097 — `YYYY-MM-DD` on a Keep-a-Changelog version heading is the format, not a gap.
// Requirement: BR-003 · BUG-033's family, one more member.
//
// The release-notes blueprint drafts the first release as `## [1.0.0] — YYYY-MM-DD`, and a
// run that has released nothing keeps the stub — the honest state, because inventing a date
// for a release that has not happened is exactly the guessing BR-003 forbids. Check 5
// reported the stub as an unfilled gap on the third e2e run (2026-08-08), inviting the same
// destructive repair every BUG-033 member invited: delete the honest thing.
//
// describesFormat() already reads `[1.0.0]` and `[Unreleased]` as section names rather than
// placeholders; this extends the same judgement to the date beside them. Scoped to heading
// lines that open with `## [` — a date stub anywhere else is still a gap.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { unfilled } from '../../ci/fill.mjs'
import { CHECKS } from '../../ci/validation.mjs'

const back = '\n> Blueprint: blueprints/x.md\n'

test('UTEST-097: the drafted first-release heading is not an unfilled gap', () => {
  const body = '# Release Notes\n\n## [1.0.0] — YYYY-MM-DD\n\n**Release goal:** the first usable version.\n'
  assert.deepEqual(unfilled(body), [])
  assert.equal(CHECKS[5].run({ 'spec/a.md': body + back }).state, 'passed')
})

test('UTEST-097: a date stub OFF a version heading is still a gap', () => {
  const body = '# Log\n\n| Date | Entry |\n|---|---|\n| YYYY-MM-DD | first deploy |\n'
  const u = unfilled(body)
  assert.equal(u.length, 1)
  assert.equal(u[0].kind, 'date-stub')
  assert.equal(CHECKS[5].run({ 'spec/a.md': body + back }).state, 'failed')
})
