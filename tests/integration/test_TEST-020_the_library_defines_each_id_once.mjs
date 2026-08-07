// TEST-020 — no identifier is minted with CONTENT by two blueprints.
// Requirement: REQ-F-042 · BR-009 · BR-010 · BUG-036.
//
// A DEFECT IN THE LIBRARY IS A DEFECT IN EVERY WORKSPACE. Check 2 runs against what a workspace
// contains, and it has been right every time it has fired here — but by then the duplication has
// shipped, been filled in twice, and cost a run to find. This asks the same question of the
// library itself, before anything is generated.
//
// It found one immediately: `FTEST-001`…`FTEST-005` are minted by BOTH `failure-tests.md` and
// `edge-cases-and-failures.md`, with different meanings — `FTEST-002` is "Invalid format" in one
// and "Value too long" in the other. Two files, same identifiers, contradicting each other, in
// every workspace this kit has ever produced.
//
// WHAT IT CANNOT CATCH, and this is the important half. Check 2 reads a row with no cell of three
// or more words as a CITATION, not a definition — otherwise every traceability row would be a
// redefinition. An empty template row is exactly that shape, so:
//
//   technical-spec.md §7.1        | SEC-A-001 | | |
//   security-specification.md §1  | SEC-A-001 | | |
//
// are invisible here. That collision — the one BUG-036 is named for — only became visible once a
// run FILLED both rows, and it took a complete generated workspace to see it.
//
// So this is a cheap early net, not a replacement for the check that runs on real output. Saying
// which is which is the point: a scan that were believed to cover both would make the expensive
// one look redundant, and the expensive one is the only thing that found the worse defect.
//
// The worked example is stripped first, because ADR-003 step 2 deletes it before anything ships.
// The examples deliberately reuse ids across files — that is what makes them readable as one
// story — so scanning them would report collisions that cannot reach a developer, and a control
// that cries wolf is switched off within a day.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { stripWorkedExample } from '../../ci/fill.mjs'
import { CHECKS } from '../../ci/validation.mjs'
import { library, blueprintText } from '../../ci/golden.mjs'

/** The library as a workspace-shaped map, in the state a fill would actually deliver. */
const shipped = () => {
  const ws = {}
  for (const rel of library()) {
    const t = blueprintText(rel)
    if (t !== null) ws[`spec/${rel}`] = stripWorkedExample(t)
  }
  return ws
}

test('TEST-020: no identifier is defined with content by two blueprints', () => {
  const check2 = CHECKS[2].run(shipped())
  assert.equal(
    check2.state,
    'passed',
    `the library ships a duplicate definition, so every workspace it generates will have one:\n  ${(check2.detail ?? []).join('\n  ')}`
  )
})

test('TEST-020: the scan reads a real library, not an empty map', () => {
  // THE FAILURE THIS REPOSITORY KEEPS FINDING. A check that matches nothing passes, and
  // `library()` returning [] — a renamed directory, a manifest that stopped parsing — would make
  // the assertion above green while judging no files at all.
  const ws = shipped()
  assert.ok(Object.keys(ws).length > 70, `only ${Object.keys(ws).length} blueprints were read`)
  assert.ok(ws['spec/01-docs/07-security-and-reliability/security-specification.md'])
  assert.ok(ws['spec/03-tests/04-failure/failure-tests.md'])
  // And the files carry content — `blueprintText` returning empty strings would satisfy every
  // count above while giving check 2 nothing to read.
  assert.ok(Object.values(ws).every((t) => t.length > 200), 'a blueprint came back empty')
})

test('TEST-020: and it would fail — a real definition table, copied into a second file', () => {
  // A mutation seen to turn it red. Without one, "check 2 passes on the library" is a claim about
  // check 2 being lenient as easily as about the library being clean.
  //
  // The copied rows are `failure-tests.md`'s own, because they are the shape check 2 counts: a
  // cell of three or more words. Inventing a row here would test the mutation, not the library.
  const ws = shipped()
  const rows = ws['spec/03-tests/04-failure/failure-tests.md']
    .split(/\r?\n/)
    .filter((l) => /^\| FTEST-\d{3} \|/.test(l))
  assert.ok(rows.length >= 3, 'failure-tests.md must still define FTEST ids, or this proves nothing')

  ws['spec/01-docs/02-requirements/requirements.md'] +=
    `\n\n| Test ID | Requirement | Failure condition | Input / trigger | Expected result | Log event expected | Status |\n|---|---|---|---|---|---|---|\n${rows.join('\n')}\n`

  const check2 = CHECKS[2].run(ws)
  assert.equal(check2.state, 'failed')
  assert.match(check2.detail.join(' '), /FTEST-\d{3} is defined in .*requirements\.md/)
})

test('TEST-020: an EMPTY duplicate row is invisible here, on purpose and on the record', () => {
  // The limitation stated as a test rather than as a comment, so it cannot quietly stop being
  // true. If check 2 ever starts counting empty rows as definitions, this fails and the header
  // above — which tells a reader this scan would not have caught BUG-036 — has to be rewritten.
  // Built from two files rather than from the library, so it states the claim about EMPTY ROWS
  // and nothing else. Over the whole library it would also be reporting whatever else is wrong
  // in there, which is how a test comes to pass or fail for a reason it does not name.
  const table = '| ID | Authentication requirement | Acceptance criteria |\n|---|---|---|\n| SEC-A-001 | | |\n'
  const back = '\n> Blueprint: blueprints/x.md\n'
  const empty = { 'spec/a.md': table + back, 'spec/b.md': table + back }
  assert.equal(CHECKS[2].run(empty).state, 'passed', 'an empty row is a citation to check 2; the header comment says so')

  // The same two files, with the rows FILLED, is the collision BUG-036 was named for — and it
  // is caught. That is the line: content makes it visible, emptiness hides it.
  const filled = {
    'spec/a.md': table.replace('| SEC-A-001 | | |', '| SEC-A-001 | A user must sign in before reading any data. | Signed-out request is refused. |') + back,
    'spec/b.md': table.replace('| SEC-A-001 | | |', '| SEC-A-001 | A user must verify their email address. | Unverified account cannot sign in. |') + back,
  }
  assert.equal(CHECKS[2].run(filled).state, 'failed')
})

test('TEST-020: the worked example is stripped, or the check reports itself', () => {
  const raw = {}
  for (const rel of library()) {
    const t = blueprintText(rel)
    if (t !== null) raw[`spec/${rel}`] = t
  }
  assert.equal(CHECKS[2].run(raw).state, 'failed', 'if the unstripped library is clean too, this stripping is untested')
})
