// UTEST-034 — the integrity check can actually be performed, on a host that refuses things.
// Requirement: FF-017 · REQ-NF-001 · BUG-005 · BR-009.
//
// BUG-005 was fixed by requiring the library to be hashed in ONE command, and the fix named
// three. A traced run in a guarded session had every one of them refused — a pipe into a
// hasher, a script block, `-exec` — and the run then began hashing blueprints one at a time
// with literal paths. Each step was correct. Each was permitted. The developer was four
// minutes into a silent screen, having been asked nothing. BUG-005, exactly, arrived through
// the one door the fix left open.
//
// The door was a sentence: stop only if the host "cannot compute a digest at all". It plainly
// could — one file at a time — so the rule did not fire. A rule that only covers total
// inability does not cover refusal, and refusal is the common case.
//
// These tests hold the two things that keep the check performable: a ladder of forms ordered
// by how little of a shell they need, and an explicit ban on the per-file fallback.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const DOC = readFileSync('plugin/instructions/integrity.md', 'utf8')

const blueprints = (dir = 'plugin/blueprints', acc = []) => {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) blueprints(p, acc)
    else if (entry !== 'MANIFEST.md') acc.push(p.split(/[\\/]/).slice(2).join('/'))
  }
  return acc
}
const LIBRARY = blueprints()

test('UTEST-034: more than one command form is offered', () => {
  // One form is not a ladder. A host that refuses it leaves the run with nothing to try and
  // nothing to do but improvise, which is how the per-file fallback got invented.
  const forms = DOC.match(/^\s*\d\s{2,}\S+\s+\S.*$/gm) ?? []
  assert.ok(forms.length >= 3, `only ${forms.length} command forms offered`)
})

test('UTEST-034: the first form needs nothing but filename expansion', () => {
  // Ordered by what a cautious host allows, not by elegance. A pipe, a redirection, a script
  // block and `-exec` are each refused somewhere; a glob is refused nowhere.
  const first = (DOC.match(/^\s*1\s+\S+\s+(.*)$/m) ?? [])[1]
  assert.ok(first, 'no first form found')
  for (const construct of ['|', '$(', '`', '-exec', '>', ';'])
    assert.ok(!first.includes(construct), `the first form uses ${construct}, which some hosts refuse`)
  assert.match(first, /sha256sum/, 'the first form must actually hash')
})

test('UTEST-034: the glob reaches every blueprint in the library', () => {
  // THE FIXED DEPTH IS THE RISK. A glob written for three levels silently misses the fourth,
  // and a check that misses files is the failure this repository has hit six times.
  const first = (DOC.match(/^\s*1\s+\S+\s+(.*)$/m) ?? [])[1]
  const depths = [...first.matchAll(/(?:\*\/)*\*\.md/g)].map((m) => m[0].split('/').length)
  const deepest = Math.max(...LIBRARY.map((p) => p.split('/').length))
  assert.ok(
    Math.max(...depths) >= deepest,
    `the glob reaches ${Math.max(...depths)} levels; the library is ${deepest} deep`
  )
})

test('UTEST-034: a refused command is not permission to hash one file at a time', () => {
  // The sentence that closes the door BUG-005 came back through.
  assert.match(DOC, /refused command is not permission to hash one file at a time/i)
  assert.match(DOC, /Per-file hashing is forbidden even when it is the only thing that works/i)
})

test('UTEST-034: the stop message distinguishes no hasher from refusal', () => {
  // Different causes, different fixes: one is a missing tool, the other is a permission rule
  // the developer can change. One message for both helps with neither — the same argument the
  // altered/missing/unlisted split already makes.
  assert.match(DOC, /no hasher, or refused/i)
})

test('UTEST-034: the doc counts the library correctly', () => {
  // The cost argument is the reason the one-command rule survives review. It is made with a
  // number, and a stale number makes it arguable.
  const claimed = [...DOC.matchAll(/Hashing all (\d+) blueprints/g)].map((m) => Number(m[1]))
  assert.deepEqual(claimed, [LIBRARY.length], `the doc says ${claimed}; the library has ${LIBRARY.length}`)
})

test('UTEST-034: MANIFEST.md hashing itself is called out, not left to be discovered', () => {
  // Forms 1 to 3 cannot exclude it, so its digest appears in the output and the manifest does
  // not list it. Unwarned, that reads as an unlisted blueprint and stops a healthy run.
  assert.match(DOC, /ignore that one line/i)
  assert.match(DOC, /It is not an unlisted blueprint/i)
})
