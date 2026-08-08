// UTEST-067 — a placeholder describing a shape is not a placeholder waiting for a value.
// Requirement: BR-003 · BR-009 · BR-010 · BUG-033.
//
// The same distinction UTEST-066 drew for check 1, arriving in `unfilled()`. `contextOf` had
// always decided this by POSITION — inside a fence, inside backticks, inside a quote — and
// these four cases sit in ordinary body text and are still not gaps.
//
// They were found by rewriting GOLD-001's assertions against the first complete workspace this
// kit has ever produced. Seven of that workspace's 29 surviving placeholders were this check
// being wrong, and the direction is the dangerous one: the repair a reader makes from
// "release-notes.md has an unfilled placeholder on line 8" is to go and edit `## [Unreleased]`,
// which is the heading Keep-a-Changelog requires.
//
// EVERY RULE IS SIZED AGAINST THE WHOLE LIBRARY, not against the file that surfaced it — the
// counts below are asserted so a rule that quietly widens fails here rather than exempting more
// and more of what it was meant to catch. That is the failure mode of every exemption ever
// added to a check, and this repository has twelve regexes that died of the opposite one.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, statSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { placeholders, unfilled } from '../../ci/fill.mjs'

const LIB = 'plugin/blueprints'
const walk = (d, a = []) => {
  for (const e of readdirSync(d)) {
    const p = join(d, e)
    statSync(p).isDirectory() ? walk(p, a) : p.endsWith('.md') && a.push(p)
  }
  return a
}
const library = walk(LIB).map((p) => [p.split('\\').join('/').slice(LIB.length + 1), readFileSync(p, 'utf8')])

/** Every match the library exempts as a described shape, with where it lives. */
const formatMatches = library.flatMap(([path, text]) =>
  placeholders(text)
    .filter((p) => p.context === 'format')
    .map((p) => ({ path, ...p }))
)

// --- The four rules, each held to the size it was measured at ----------------------------------

test('UTEST-067: exactly eleven matches in the library are exempt as described shapes', () => {
  // The number is the point. An exemption nobody counts is an exemption that grows.
  assert.equal(formatMatches.length, 11, formatMatches.map((m) => `${m.path}:${m.line} ${m.text}`).join('\n'))
})

test('UTEST-067: a changelog version heading is the format, not a gap', () => {
  const found = formatMatches.filter((m) => /^\[(Unreleased|v?\d)/.test(m.text))
  assert.equal(found.length, 4)
  assert.ok(found.every((m) => m.path === '07-ops/04-release/release-notes.md'))

  assert.deepEqual(unfilled('## [Unreleased]\n\n### Added\n'), [])
  assert.deepEqual(unfilled('## [1.0.0]\n'), [])

  // NOT the date beside it. `## [1.0.0] — YYYY-MM-DD` has a real gap on the same line, and an
  // exemption that swallowed its own line would hide it.
  assert.deepEqual(unfilled('## [1.0.0] — YYYY-MM-DD\n').map((p) => p.text), ['YYYY-MM-DD'])
  // NOT a bracket span that merely sits in a heading.
  assert.equal(unfilled('## [project name] — specification\n').length, 1)

  // THIS ASSERTION USED TO READ THE OTHER WAY, and a real run showed it was wrong.
  //
  // It required `[1.0.0]` OUTSIDE a heading to be a gap, on the reasoning that a version in
  // prose is a value somebody must supply. Then a run wrote *"requirements listed under
  // [1.0.0] below"* — a cross-reference to the `## [1.0.0]` section three lines down — and
  // check 5 reported the file's own internal pointer as an unfilled placeholder.
  //
  // The shapes do not overlap, which is what makes widening safe rather than lax. A placeholder
  // names something to supply: `[project name]`, `[Option A]`, `[Decision Title]`. A concrete
  // semver is already the value — there is nothing a developer could write in its place. A
  // blueprint asking for one writes `[version]`, and that is still caught below.
  assert.deepEqual(unfilled('The requirements listed under [1.0.0] below.\n'), [])
  assert.deepEqual(unfilled('## [Unreleased]\n\nSee [Unreleased] above.\n'), [])
  assert.equal(unfilled('The first release is [version].\n').length, 1, 'a slot is still a slot')
  assert.equal(unfilled('Ship it in [the next quarter].\n').length, 1)
})

test('UTEST-067: two id-stubs offered as a choice are describing which kind of id', () => {
  const found = formatMatches.filter((m) => m.kind === 'id-stub')
  assert.equal(found.length, 4)
  assert.deepEqual([...new Set(found.map((m) => m.path))].sort(), [
    '05-review/01-logs/change-log.md',
    '06-agent/01-instructions/AGENT.md',
  ])

  assert.deepEqual(unfilled('- **Requirement covered** (REQ-### / TASK-###)\n'), [])

  // ONE STUB ALONE IS STILL A GAP, and this is the assertion that matters. A slash between two
  // is a sentence saying "either kind of id goes here"; a stub on its own is a value nobody
  // minted — which is exactly `**Related requirements:** SEC-###` on an unfilled review form.
  assert.deepEqual(unfilled('**Related requirements:** SEC-###\n').map((p) => p.text), ['SEC-###'])
  assert.deepEqual(unfilled('| US-001 | As a cook… | REQ-F-002 | TASK-### |\n').map((p) => p.text), ['TASK-###'])
})

test('UTEST-067: a section label above a kept example table is not an instruction', () => {
  const found = formatMatches.filter((m) => m.kind === 'instructional-italic')
  assert.equal(found.length, 2)
  assert.ok(found.every((m) => m.path === '01-docs/03-product-spec/product-spec.md'))

  assert.deepEqual(unfilled('*Example (Ch. 6 §6.3)*\n'), [])
  assert.deepEqual(unfilled('*Examples*\n'), [])

  // A REAL INSTRUCTION IS STILL A GAP even though it starts with a similar word. The label is
  // short and names a section; an instruction tells you what to write and runs on.
  const instruction = '*Add a line here whenever a bug reveals a repeatable AI mistake.*\n'
  assert.deepEqual(unfilled(instruction).map((p) => p.kind), ['instructional-italic'])
  assert.equal(unfilled('*Example: describe what the user sees when the save fails, and why.*\n').length, 1)
})

test('UTEST-067: a bracket slot inside an identifier is part of a name', () => {
  const found = formatMatches.filter((m) => m.text === '[ID]')
  assert.equal(found.length, 1)
  assert.equal(found[0].path, '06-agent/03-prompts/prompt-library.md')

  assert.deepEqual(unfilled('Implement only TASK-[ID]. Follow the specs.\n'), [])
  // NOT a bare bracket span on the same kind of line.
  assert.deepEqual(unfilled('Implement only the task [ID]. Follow the specs.\n').map((p) => p.text), ['[ID]'])
})

// --- The shape of the fix ----------------------------------------------------------------------

test('UTEST-067: exempt matches are REPORTED, never discarded', () => {
  // BR-009's three states, applied to a placeholder. "We saw it and judged it content" is a
  // different claim from "we never looked", and only the first one is honest — so the match
  // still appears in `placeholders()` carrying the reason it was excused.
  const seen = placeholders('## [Unreleased]\n')
  assert.equal(seen.length, 1)
  assert.equal(seen[0].context, 'format')
  assert.deepEqual(unfilled('## [Unreleased]\n'), [])
})

test('UTEST-067: position still wins, so a fence keeps its own reason', () => {
  // A span inside a fenced block is already content (BUG-017), and re-labelling it 'format'
  // would lose WHICH rule excused it — two different exemptions reported as one is how the
  // next person removes the wrong one.
  const inFence = '```\n## [Unreleased]\n```\n'
  assert.equal(placeholders(inFence)[0].context, 'code')
})

test('UTEST-067: the library has not become mostly exempt', () => {
  // The blunt guard. Eleven of 137 body-context candidates is an exemption; a third of them
  // would be a check that has been argued out of existence one rule at a time.
  const body = library.reduce((n, [, t]) => n + unfilled(t).length, 0)
  assert.ok(body > 100, `only ${body} real gaps left in the library — an exemption has gone wide`)
  assert.ok(formatMatches.length / (body + formatMatches.length) < 0.15)
})
