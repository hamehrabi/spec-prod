// ATEST-049 — express asks exactly two questions per round, and which two is written down.
// Requirement: REQ-F-009 · ADR-001 · depth.md · inference.md.
//
// BUG-012. depth.md caps express at two questions per round and gives the selection rule
// "drop what only shapes prose, keep what changes what gets built". Round 2 has four
// questions and all four change what gets built, so the rule selected everything and the cap
// demanded two. Nothing resolved the disagreement, which left the choice to the run — and a
// question set decided at run time is not a question set. Two express runs of the same
// product would have asked different things and produced different specifications.
//
// The fix puts the mark on each question, in the module that owns questions. That keeps the
// principle in depth.md (one place) and the per-round application beside the questions (one
// place), which is ADR-001 applied to a decision rather than to a file.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const questions = readFileSync('plugin/instructions/questions.md', 'utf8')
const depth = readFileSync('plugin/instructions/depth.md', 'utf8')

/** Round heading -> its `## Q#.` heading lines, in order. */
const byRound = () => {
  const rounds = new Map()
  let current = null
  for (const line of questions.split('\n')) {
    const round = line.match(/^# Round (\d) — /)
    if (round) { current = Number(round[1]); rounds.set(current, []) }
    else if (current && /^## Q\d+\./.test(line)) rounds.get(current).push(line)
  }
  return rounds
}

test('ATEST-049: every round marks EXACTLY two questions as express-kept', () => {
  const rounds = byRound()
  assert.deepEqual([...rounds.keys()], [1, 2, 3, 4, 5, 6, 7, 8], 'all eight rounds are present')

  const counts = [...rounds].map(([n, qs]) => [n, qs.filter((q) => q.includes('express keeps')).length])
  assert.deepEqual(counts, [[1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2]])
})

test('ATEST-049: the cap is never exceeded — four at default, two at express', () => {
  for (const [n, qs] of byRound()) {
    assert.ok(qs.length <= 4, `Round ${n} asks ${qs.length}; the default cap is four`)
  }
})

test('ATEST-049: every mark carries its reason', () => {
  // A mark with no reason is a preference. The next person to add a question needs something
  // to weigh their new one against, and "it was already marked" is not that.
  const blocks = questions.split(/^## /m).filter((b) => /^Q\d+\..*express keeps/.test(b))
  assert.equal(blocks.length, 16, 'sixteen marks — two per round for eight rounds')
  for (const b of blocks) {
    assert.match(b, /\*\*Why express keeps it:\*\*/, `no reason given on: ${b.split('\n')[0]}`)
  }
})

test('ATEST-049: the two questions depth.md mandates at BOTH depths are among the marks', () => {
  // The core-subdomain question and the driving characteristics. If either lost its mark, an
  // express run would silently contradict depth.md rather than fail anything.
  const rounds = byRound()
  assert.ok(
    rounds.get(2).some((q) => /which ONE do you actually compete on.*express keeps/.test(q)),
    'the core-subdomain question is asked at both depths (depth.md)'
  )
  assert.ok(
    rounds.get(4).some((q) => /three qualities that matter most.*express keeps/.test(q)),
    'driving characteristics are limited to three at both depths, not reduced by depth'
  )
})

test('ATEST-049: the free-text problem statement is not a numbered question, so it never counts', () => {
  // depth.md asks it at both depths. If it were `## Q5.` it would compete for one of the two
  // slots and the cap would be wrong by one in every round that has it.
  assert.match(questions, /^## The free-text question$/m)
  assert.equal((questions.match(/^## The free-text question$/gm) ?? []).length, 1)
  assert.doesNotMatch(questions, /^## Q\d+\..*(free[- ]text|in one or two sentences)/im)
})

// --- The rule that makes a dropped question safe ---------------------------------------------

test('ATEST-049: a dropped question is recorded as unknown, never answered', () => {
  // The whole risk of express in one line. A default and a stated answer produce the same
  // sentence in the same table, so nothing downstream can tell them apart.
  assert.match(depth, /Express asks less\. It never assumes more/i)
  assert.match(depth, /recorded as unknown, never answered on the developer's\s*\n?behalf/i)
  assert.match(depth, /`\[TODO\]` paired with a `Q-###` row carrying a decision owner/)
  assert.match(depth, /which is a \*\*silent inference\*\*/i)

  // And the distinction that keeps "inference" from becoming a licence for defaults.
  assert.match(depth, /An inference is drawn from something the developer actually said/i)
  assert.match(depth, /A\s*\n?default is drawn from nothing/i)
})

test('ATEST-049: a thin workspace of marked gaps is stated as the INTENDED output', () => {
  // Otherwise a run that produces mostly TODOs reads as a failed run, and the next fix is to
  // fill them in with something plausible — which is the defect, not the repair.
  assert.match(depth, /A thin workspace full of marked gaps is the intended output/i)
  assert.match(depth, /A thin workspace full of plausible\s*\n?answers nobody gave is the failure/i)
})

test('ATEST-049: the constraints question names what to do when it is dropped', () => {
  // Round 2 Q3 is the riskiest drop in the kit: constraints change the architecture, and
  // inference.md forbids inferring anything that changes the architecture. Without this note
  // the drop reads as permission to fill the table with the constraints that usually apply.
  assert.match(questions, /At express this one is dropped, and it is the drop most likely to be got wrong/i)
  assert.match(questions, /constraint table is written \*\*empty and\s*\n?> marked\*\*/i)
  assert.match(questions, /A guessed constraint reads exactly like a\s*\n?> stated one/i)
})

test('ATEST-049: the selection is stated to be a decision, not a per-run judgement', () => {
  assert.match(questions, /Which two — decided here, once, not per run/i)
  assert.match(questions, /A rule that selects everything selects\s*\nnothing/i)
  assert.match(depth, /Which two is decided in `instructions\/questions\.md`, not per run/i)
})

test('ATEST-049: the module title matches what the module contains', () => {
  // It said "Rounds 1 to 4" while holding all eight — harmless until someone trusts it and
  // goes looking for rounds 5 to 8 in a file that does not exist.
  assert.match(questions, /^# Questions — Rounds 1 to 8$/m)
})
