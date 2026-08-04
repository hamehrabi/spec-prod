// UTEST-002…005 / ATEST-005…008 — the shape rules for one question round.
// Requirement: REQ-F-005, REQ-F-006, REQ-F-007, REQ-F-008 · REQ-NF-006 · ADR-001.
//
// These assert the SHIPPED question module, not generated prose. The round-shape rules are
// requirements with numbers in them — "at most four", "recommended first, marked, with a
// reason" — and a requirement with a number is checkable or it is decoration.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { parseQuestions } from '../../ci/questions.mjs'

const { questions, freeText, text } = parseQuestions()
const intake = readFileSync('plugin/instructions/intake.md', 'utf8')

test('UTEST-002 / ATEST-005: a round asks at most four questions', () => {
  assert.ok(questions.length > 0, 'the round must ask something')
  assert.ok(questions.length <= 4, `REQ-F-005: found ${questions.length}; the limit is four, and it is the requirement that holds, not the question set`)
})

test('UTEST-003 / ATEST-006: every question offers a recommendation FIRST', () => {
  for (const q of questions) {
    assert.ok(q.options.length >= 2, `Q${q.number} must offer a choice`)
    assert.equal(q.options[0].recommended, true, `Q${q.number}: the recommended option must come first`)
    const others = q.options.slice(1).filter((o) => o.recommended)
    assert.deepEqual(others, [], `Q${q.number}: exactly one recommendation, or it recommends nothing`)
  }
})

test('UTEST-003 / ATEST-006: the recommendation is marked IN WORDS, not by position', () => {
  // REQ-NF-006. Ordering is invisible to a reader who is not comparing, and to a screen
  // reader. The marking has to survive being read aloud.
  for (const q of questions) {
    assert.match(
      text,
      new RegExp(`\\*\\*${q.options[0].label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*\\*[^\\n]*\\(Recommended\\)`),
      `Q${q.number}: "(Recommended)" must appear in the text of the first option`
    )
  }
})

test('UTEST-003 / ATEST-006: every option carries a one-line reason', () => {
  for (const q of questions) {
    for (const o of q.options) {
      assert.ok(o.reason.length > 15, `Q${q.number} "${o.label}" needs a reason a developer can disagree with, not a label`)
      assert.ok(!o.reason.includes('\n'), `Q${q.number} "${o.label}": one line`)
    }
  }
})

test('UTEST-005 / ATEST-008: a free-text question is asked, and asks for the PROBLEM', () => {
  // REQ-F-008. The one question that cannot be multiple choice — it is what grounds the
  // workspace in the developer's problem rather than in an option list.
  assert.ok(freeText.length > 0, 'the free-text question must exist')
  assert.match(freeText, /who is affected/i)
  assert.match(freeText, /what does that cost|what difficulty/i)
  assert.match(freeText, /not describe features|do not describe features/i)
})

test('UTEST-004 / ATEST-007: a typed answer is used verbatim, never snapped to an option', () => {
  // REQ-F-007. Someone whose situation is not in the list is exactly the person the list
  // would mislead, so the rule has to be stated where the options are.
  assert.match(text, /verbatim/i)
  assert.match(text, /never snap|Never snap/i)
})

test('ADR-001: the question module holds no orchestration and no blueprint content', () => {
  // FF-002's boundary, checked by inspection: a question set that names destination paths or
  // blueprint structure has absorbed the job of the module next door.
  assert.doesNotMatch(text, /blueprints\//, 'no blueprint paths in the question set')
  assert.doesNotMatch(text, /^spec\/\S+\.md/m, 'no destination paths in the question set')
  assert.doesNotMatch(text, /Round 2|Round 3/, 'no round sequencing in the question set')
})

test('ETEST-008 / BR-005: the round writes BEFORE the next round could be asked', () => {
  // REQ-NF-001. An interrupted intake must leave usable output; a run that holds everything
  // until the end leaves nothing when it is closed at round three.
  const write = intake.search(/### 2b\. Write/)
  const summarise = intake.search(/### 2c\. Summarise/)
  const ask = intake.search(/### 2a\. Ask/)
  assert.ok(ask < write && write < summarise, 'the order is ask -> write -> summarise')
  assert.match(intake, /before the next round is asked/i)
  assert.match(intake, /not at the end of the run/i)
})

test('REQ-R-004: declining a write continues the round rather than failing it', () => {
  assert.match(intake, /declines/i)
  assert.match(intake, /continue the round/i)
  assert.match(intake, /resumable/i)
})

test('REQ-F-015: the round names its three files and reports the count', () => {
  for (const f of ['spec/01-docs/01-intent/project-brief.md', 'spec/01-docs/01-intent/intent.md', 'spec/README.md']) {
    assert.ok(intake.includes(f), `intake must name ${f}`)
  }
  assert.match(intake, /Round 1 — wrote 3 files/)
})

test('every file Round 1 writes has a blueprint to be filled from', () => {
  // TASK-006's third stop condition, inverted: if a named output has no template, the round
  // would have to author it from memory, which ADR-003 forbids outright.
  for (const rel of ['01-docs/01-intent/project-brief.md', '01-docs/01-intent/intent.md', 'README.md']) {
    assert.ok(existsSync(`plugin/blueprints/${rel}`), `blueprints/${rel} must exist`)
  }
})
