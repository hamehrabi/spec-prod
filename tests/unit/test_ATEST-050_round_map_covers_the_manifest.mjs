// ATEST-050 — every blueprint the manifest lists is owned by exactly one round.
// Requirement: REQ-F-043 · FF-018 · ADR-001 · coverage.md.
//
// BUG-016. The round map was prose. It said things like `01-docs/01-intent/` *(intent, brief)*
// — readable, and comparable to nothing. Check 13 catches a blueprint the run never reached,
// but only at the END of a run; nothing said whether the map could reach every blueprint at
// all. A hole in it was invisible until someone ran all eight rounds and counted.
//
// It also had a real hole: `driving-characteristics.md` sits in 01-docs/02-requirements/ and
// so belonged to Round 3, while every one of its three steps is Round 4's question. Round 3
// could only have written it as a page of markers for a question not yet asked — and a gate
// that shows the developer an empty document reads as a broken tool.
//
// So the map now writes every path in full, and this test compares it to the manifest.
// Nought owners is a hole. Two is a file written twice.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const coverage = readFileSync('plugin/instructions/coverage.md', 'utf8')
const manifest = readFileSync('plugin/blueprints/MANIFEST.md', 'utf8')

/** Round number -> the paths and prefixes it owns. */
const roundMap = () => {
  const map = new Map()
  for (const line of coverage.split('\n')) {
    const row = line.match(/^\| ([1-8]) \| (.+) \|$/)
    if (!row) continue
    map.set(Number(row[1]), [...row[2].matchAll(/`([^`]+)`/g)].map((m) => m[1]))
  }
  return map
}

/** Everything the manifest requires: the checksum table, minus the permanent exclusions. */
const required = manifest
  .split('\n')
  .map((l) => (l.match(/^\| `([^`]+)` \| `[0-9a-f]{64}` \|$/) || [])[1])
  .filter(Boolean)

// An entry ending in `/` or `-` is a prefix; anything else is one exact path.
const owns = (entry, path) => (/[/-]$/.test(entry) ? path.startsWith(entry) : path === entry)

const ownersOf = (path) => [...roundMap()].filter(([, entries]) => entries.some((e) => owns(e, path))).map(([n]) => n)

test('ATEST-050: the map parses, and holds all eight rounds', () => {
  const map = roundMap()
  assert.deepEqual([...map.keys()], [1, 2, 3, 4, 5, 6, 7, 8])
  for (const [n, entries] of map) assert.ok(entries.length > 0, `Round ${n} owns nothing`)
})

test('ATEST-050: the manifest is non-trivially large, so a pass means something', () => {
  // Guards the parser rather than the map: a regex that silently matched nothing would make
  // every assertion below vacuously true, which is the failure mode of this entire test file.
  assert.ok(required.length > 70, `only ${required.length} blueprints parsed from the manifest`)
})

test('ATEST-050: every required blueprint is owned by EXACTLY one round', () => {
  const unowned = required.filter((p) => ownersOf(p).length === 0)
  const shared = required.filter((p) => ownersOf(p).length > 1)

  assert.deepEqual(unowned, [], 'a blueprint no round owns is a hole in the map, not an implicit skip')
  assert.deepEqual(
    shared.map((p) => `${p} -> rounds ${ownersOf(p).join(', ')}`),
    [],
    'two owners means two rounds write the same file, and the second silently wins'
  )
})

test('ATEST-050: every entry in the map matches something real', () => {
  // The other direction. An entry naming a path that no longer exists is a round quietly
  // owning nothing — and it looks identical to a round owning something.
  const dead = []
  for (const [n, entries] of roundMap()) {
    for (const e of entries) {
      if (!required.some((p) => owns(e, p))) dead.push(`Round ${n}: \`${e}\` matches no blueprint`)
    }
  }
  assert.deepEqual(dead, [])
})

// --- BUG-016: the file moved to the round that can fill it -------------------------------------

test('ATEST-050: driving-characteristics belongs to Round 4, whose question fills it', () => {
  // Round 4 Q3 IS this document: pick three qualities, keep the rejected candidates, state a
  // measure for each. Owned by Round 3 it could only be written as markers.
  assert.deepEqual(ownersOf('01-docs/02-requirements/driving-characteristics.md'), [4])
  assert.deepEqual(ownersOf('01-docs/02-requirements/requirements.md'), [3])

  const questions = readFileSync('plugin/instructions/questions.md', 'utf8')
  const round4 = questions.split(/^# Round /m).find((b) => b.startsWith('4 — '))
  assert.match(round4, /Pick the three qualities that matter most/, 'and the question really is Round 4\'s')
})

test('ATEST-050: a file with a few later-round fields is NOT moved', () => {
  // The rule has to have an edge, or every file drifts to the last round that touches it.
  // api-specification.md cannot know the auth model until Round 5 and stays with Round 3,
  // because the rest of it is Round 3's answer.
  assert.deepEqual(ownersOf('01-docs/06-api-and-data-design/api-specification.md'), [3])
  assert.match(coverage, /A few later-round fields in a file is normal and is not this/i)
  assert.match(coverage, /whether the round that owns it can write something real/i)
})

test('ATEST-050: the split-directory rule is stated, and so is why prose was not enough', () => {
  assert.match(coverage, /An entry ending in `\/` or `-` is a prefix/i)
  assert.match(coverage, /naming a file is how a directory gets split between two rounds/i)
  assert.match(coverage, /A round map nobody can compare to the manifest is a claim/i)
  assert.match(coverage, /Nought is a hole, two is a file written twice/i)
})

test('ATEST-050: a file ONE round can fill belongs to that round', () => {
  // The companion to BUG-010's rule, and the two together decide every ownership question.
  assert.match(coverage, /A file is owned by the round that can fill it/i)
  assert.match(coverage, /a file every round writes to belongs to the\s*\n?first round that writes to it/i)
  assert.match(coverage, /a file \*\*one\*\* round can fill belongs to that round/i)
  assert.match(coverage, /An interview that appears to produce empty files\s*\n?reads as a broken tool/i)
})
