// C3 — no blueprint restates a document another blueprint already owns.
// Requirement: REQ-F-029 · BR-002 · ADR-001 · coverage.md.
//
// BUG-019. `technical-spec.md` carried three whole documents inside itself:
//
//   §5.1-5.8   the eight sections of database-design.md, same titles, same order
//   §6.1-6.5   the five sections of api-specification.md, same titles, same order
//   §10.1-10.2 the integration and versioning sections of data-and-integration-spec.md
//
// All three are written in Round 3. The technical spec is Round 4. So the developer filled
// the same entity model, the same endpoint index and the same integration table twice, a
// round apart — and the build agent then had two of each to choose between, with nothing
// saying which one the code was built from.
//
// 163 lines of a 1020-line blueprint. It was invisible to every check: each copy was
// individually well-formed, and no check compares one blueprint to another.
//
// The rule this pins is the same one the kit applies to its own instruction modules: state a
// thing once and link to it. A copy drifts, and both copies look authoritative.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (p) => readFileSync(`plugin/blueprints/${p}`, 'utf8')

/** What actually ships: everything before the worked example (ADR-003 step 2). */
const shipped = (p) => read(p).split(/^# WORKED EXAMPLE/m)[0]

const tech = shipped('01-docs/04-technical-spec/technical-spec.md')

/** Section titles, normalised — numbering, case and source citations removed. */
const sections = (text) =>
  [...text.matchAll(/^#{2,3} +(.+)$/gm)]
    .map((m) => m[1].replace(/^\d+(\.\d+)?\.?\s*/, '').replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase())
    .filter((t) => t && !['contents', 'prompts'].includes(t))

const OWNED_ELSEWHERE = [
  '01-docs/06-api-and-data-design/database-design.md',
  '01-docs/06-api-and-data-design/api-specification.md',
  '01-docs/06-api-and-data-design/data-and-integration-spec.md',
]

test('C3: the technical spec does not restate a section another blueprint owns', () => {
  const mine = new Set(sections(tech))
  const clashes = []
  for (const path of OWNED_ELSEWHERE) {
    for (const title of sections(shipped(path))) {
      if (mine.has(title)) clashes.push(`"${title}" is in technical-spec.md and in ${path}`)
    }
  }
  assert.deepEqual(clashes, [], 'a section owned by two blueprints is filled twice and drifts')
})

test('C3: each duplicated section is now a pointer that names where the content lives', () => {
  // A deleted section would be worse than a duplicated one: the reader who goes looking for
  // the schema in the technical spec has to find out where it went, and silence sends them
  // to write a second copy.
  for (const [heading, target] of [
    ['## 5. Database Requirements', 'database-design.md'],
    ['## 6. API Requirements', 'api-specification.md'],
    ['## 10. Integration & Versioning Requirements', 'data-and-integration-spec.md'],
  ]) {
    const body = tech.split(heading)[1].split(/^## /m)[0]
    assert.match(body, /(is|are) not written here/i, `${heading} must say so plainly`)
    assert.ok(body.includes(target), `${heading} must link to ${target}`)
    assert.match(body, /\| What you need \| Where it is \|/, `${heading} must route the reader per topic`)
  }
})

test('C3: the pointer sections say what DOES belong there', () => {
  // Otherwise the section becomes dead weight and the next editor deletes it, taking the
  // signpost with it.
  assert.match(tech, /What belongs here instead:\*\* anything about the database that only makes sense/i)
  assert.match(tech, /What belongs here instead:\*\* the API decisions that are architectural rather than\s*\n?contractual/i)
  assert.match(tech, /What belongs here instead:\*\* what an outside dependency does to \*this\* system's shape/i)
})

test('C3: all fourteen sections survive, and the numbering the contents list uses is intact', () => {
  // §7's anchor is linked from requirements.md as technical-spec.md#7-security-requirements.
  // Renumbering to close the gap would have broken it silently.
  const numbered = [...tech.matchAll(/^## (\d+)\. /gm)].map((m) => Number(m[1]))
  assert.deepEqual(numbered, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
  assert.match(tech, /^## 7\. Security Requirements$/m)
})

test('C3: the dedicated documents are the supersets, so nothing was lost', () => {
  // The check that makes the deletion safe rather than merely tidy: every section title the
  // technical spec used to carry still exists, in the document that now owns it.
  const db = sections(shipped('01-docs/06-api-and-data-design/database-design.md'))
  for (const title of ['entity model', 'schema', 'ownership and isolation rules', 'sensitive data', 'retention and deletion']) {
    assert.ok(db.some((s) => s.startsWith(title)), `database-design.md must still own "${title}"`)
  }
  const api = sections(shipped('01-docs/06-api-and-data-design/api-specification.md'))
  for (const title of ['endpoint index', 'endpoint template', 'validation rules']) {
    assert.ok(api.includes(title), `api-specification.md must still own "${title}"`)
  }
})

test('C3: the rule is stated where a future editor will hit it', () => {
  assert.match(tech, /Two copies of a schema is the drift this whole kit exists to prevent/i)
  assert.match(tech, /they disagree within a week, both look authoritative/i)
  assert.match(tech, /An empty table with a heading is a statement; a\s*\ncopied schema is a second source of truth/i)
})
