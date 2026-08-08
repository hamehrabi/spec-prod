// UTEST-092 — an italic the RUN wrote is content; one it failed to replace is a gap.
// Requirement: BR-003 · BR-009 · BR-010 · BUG-042.
//
// `unfilled()` reads a whole line in italics as "the blueprint telling you what to write here".
// That is true of the BLUEPRINT's italics and false of the run's, and the first complete
// post-fix workspace was reported as holding five gaps that were all the run stating a fact:
//
//   *No scope changes yet. The first accepted change becomes `SC-001`.*
//   *No improvements logged yet — the first review after building starts this log.*
//   *(The exact set of secrets depends on the auth model, `Q-009`, and any external service.)*
//
// Those are BETTER than the blank tables they replace — they say the section is empty and name
// what will fill it. The repair a reader makes from "unfilled placeholder on line 49" is to
// delete them, which is the destructive-repair shape that got checks 1, 2, 3, 5 and 6 fixed.
//
// DERIVED FROM THE LIBRARY, NOT GUESSED. An italic that appears in the blueprints is one the
// fill was supposed to consume; anything else the run authored. Sorting them by
// imperative-versus-declarative phrasing would have been a guess, and this repository has paid
// for enough of those — twelve regexes and counting.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CHECKS } from '../../ci/validation.mjs'
import { library, blueprintText } from '../../ci/golden.mjs'
import { placeholders } from '../../ci/fill.mjs'

const back = '\n> Blueprint: blueprints/x.md\n'
const ws = (body) => ({ 'spec/a.md': `# A\n\n${body}${back}` })

/** An italic that genuinely lives in the shipped library, found rather than typed. */
const aRealBlueprintItalic = () => {
  for (const rel of library()) {
    const t = blueprintText(rel)
    if (t === null) continue
    const hit = placeholders(t).find((p) => p.kind === 'instructional-italic')
    if (hit) return hit.text
  }
  return null
}

// --- The direction that matters: it must still fail -------------------------------------------

test('UTEST-092: an italic that IS in the library is still reported', () => {
  // Taken from the library at run time. Hard-coding one would pass the day it was edited out,
  // which is the check quietly stopping rather than the workspace improving.
  const real = aRealBlueprintItalic()
  assert.ok(real, 'the library must contain at least one instructional italic, or this proves nothing')
  assert.equal(CHECKS[5].run(ws(real)).state, 'failed')
})

test('UTEST-092: every other placeholder kind is untouched by the exemption', () => {
  // The exemption is scoped to `instructional-italic`. A bracket placeholder, an id stub and a
  // date stub must be unaffected — widening it to all kinds would switch check 5 off wholesale.
  assert.equal(CHECKS[5].run(ws('[Decision Title]')).state, 'failed')
  assert.equal(CHECKS[5].run(ws('**Related requirements:** SEC-###')).state, 'failed')
  assert.equal(CHECKS[5].run(ws('| Date | YYYY-MM-DD |')).state, 'failed')
})

// --- What is excused ---------------------------------------------------------------------------

test('UTEST-092: an empty-state sentence the run wrote is content', () => {
  assert.equal(CHECKS[5].run(ws('*No scope changes yet. The first accepted change becomes `SC-001`.*')).state, 'passed')
  assert.equal(CHECKS[5].run(ws('*No improvements logged yet — the first review after building starts this log.*')).state, 'passed')
})

test('UTEST-092: a parenthetical note citing open questions is content', () => {
  const note = '*(The exact set of secrets depends on the auth model, `Q-009`, and any external service, `Q-007`.)*'
  assert.equal(CHECKS[5].run(ws(note)).state, 'passed')
})

// --- The guard on the guard ---------------------------------------------------------------------

test('UTEST-092: the library set is non-empty, or the exemption would excuse everything', () => {
  // An empty set matches nothing, so EVERY italic would be treated as authored and check 5
  // would silently stop reporting the thing it exists for. `libraryItalics()` returns null in
  // that case and the check falls back to its old behaviour; this asserts the real library does
  // not hit that path.
  const found = new Set()
  for (const rel of library()) {
    const t = blueprintText(rel)
    if (t === null) continue
    for (const p of placeholders(t)) if (p.kind === 'instructional-italic') found.add(p.text)
  }
  assert.ok(found.size >= 20, `only ${found.size} instructional italics in the library — the exemption is reading almost nothing`)
})

test('UTEST-092: a workspace of nothing but authored italics still cannot claim success', () => {
  // The exemption removes a false failure; it must not manufacture a pass. This file has no
  // back-link, so check 3 still has something to say about it.
  const r = CHECKS[3].run({ 'spec/a.md': '# A\n\n*No scope changes yet.*\n' }, ['x.md'])
  assert.equal(r.state, 'failed')
})
