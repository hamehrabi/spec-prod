// UTEST-044 — no user-facing file may promise that a depth setting changes the round count.
// Requirement: REQ-F-011, REQ-F-033, REQ-F-034 · DD-006 · BR-004.
//
// WHY THIS EXISTS
//
// `instructions/intake.md` and `instructions/depth.md` are the authority, they agree with each
// other, and they are unambiguous: the interview is eight rounds at BOTH depths. `express`
// reduces the questions asked inside a round — four becomes two — and never removes a round.
// A round that vanished at express would make express a second flow, exercised half as often,
// which is the exact failure DD-006 and FF-001 exist to prevent.
//
// Thirteen other files said the opposite. Two of them shipped to developers
// (`plugin/commands/spec-intake.md`, `plugin/README.md` — the latter contradicting itself ten
// lines later, where it correctly says "eight rounds of questions"). The rest were the kit's
// own specification, including REQ-F-033 and **AC-031**, the acceptance criterion for express
// depth, which required the run to have "took fewer rounds than the default depth". A correct
// implementation could never satisfy it. The criterion was unpassable by construction, and
// nothing noticed, because no test read the devkit's own spec documents at all.
//
// WHAT THIS PINS
//
// A scan, not a string. Asserting that one sentence now reads correctly would leave the next
// file free to reintroduce the promise — which is how it reached thirteen files in the first
// place. Every Markdown file a developer or a spec reader can open is scanned for the family
// of phrases that assert a depth changes the round count.
//
// SCOPE, stated so nobody reports this as broader than it is:
//   - `tests/` and `ci/` are excluded. They are the checking machinery, and this file has to
//     quote the banned phrases in order to search for them.
//   - Negated prose is allowed and must be: "express ... never removes a round" is the
//     correct sentence, and it necessarily contains the words being hunted. A negation in the
//     same clause clears the match.
//   - This is a prose linter. It catches the phrasings that actually occurred, not every
//     phrasing conceivable.
//
// Prose here is hard-wrapped, so every match runs against whitespace-normalised text. Eleven
// defects in this repo have been a regex dying across a line break.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { REPO } from '../_helpers.mjs'

// Everything a developer or a reader of the kit's specification can open. The shipped payload,
// the kit's own spec, the template copy, and the repository's front door.
const ROOTS = ['plugin', 'spec-driven-devkit', 'spec-driven-template', 'README.md', 'ATTRIBUTION.md']

/** Every .md file under the given roots, as repo-relative POSIX paths. */
function markdownFiles(roots) {
  const out = []
  const visit = (abs) => {
    let st
    try {
      st = statSync(abs)
    } catch {
      return // a root that does not exist is not this test's business
    }
    if (st.isDirectory()) {
      for (const name of readdirSync(abs).sort()) visit(join(abs, name))
    } else if (abs.endsWith('.md')) {
      out.push(relative(REPO, abs).split(sep).join('/'))
    }
  }
  for (const root of roots) visit(join(REPO, root))
  return out
}

// The claim family: a depth setting changes HOW MANY ROUNDS there are. Not "fewer questions",
// which is true and is the whole point of express — only claims about the count of rounds or
// stages themselves.
const CLAIMS = [
  { id: 'fewer rounds', re: /fewer rounds/gi },
  { id: 'less rounds', re: /less rounds/gi },
  { id: 'fewer stages', re: /fewer stages/gi },
  { id: 'shorter interview', re: /shorter interview/gi },
  { id: 'fewer than N rounds', re: /fewer than [\w-]+ rounds/gi },
  { id: 'a reduced set of rounds', re: /reduced (?:set of )?rounds/gi },
  { id: 'reduces the rounds', re: /reduces? (?:the )?(?:number of )?rounds\b/gi },
  { id: 'a reduced round count', re: /reduced (?:round )?count/gi },
  // Two things are deliberately loose here, and both were needed to see the claim as it was
  // actually written — "| Number of rounds | **Derived** from depth |". A pattern that stopped
  // at the cell boundary walked straight past it, and so did one that required a plain space
  // after "Derived", because the emphasis markers sit between the word and the space.
  { id: 'the round count is derived from depth', re: /(?:number of rounds|round count)[^.]{0,60}?\b(?:derived|determined)[\s*_]*(?:from|by)[\s*_]*(?:the[\s*_]+)?depth/gi },
  { id: 'depth determines the round count', re: /\bdepth\b[^.|]{0,60}\bdetermines?\s+the\s+round\s+count/gi },
  { id: 'a round or stage is removed', re: /\b(?:skips?|skipping|skipped|drops?|dropping|dropped|removes?|removing|removed|deletes?|deleting|deleted)\s+(?:a|one|any)\s+(?:round|stage)\b/gi },
]

// A negation in the same clause makes the sentence correct rather than wrong. "never removes a
// round" is exactly what intake.md is supposed to say, and it necessarily contains the words
// being hunted. Clause boundaries include the table pipe, because these documents state rules
// in table cells.
const NEGATION_BEFORE = /\b(?:never|not|no|nor|neither|cannot|can't|rather than|instead of|without)\b[^.;:|]*$/i

// A denial that FOLLOWS the claim, for the "name the bad thing, then forbid it" construction:
// "**Failure path — express depth would drop a stage entirely:** It does not."
//
// This window is deliberately tiny — 40 characters, cut at the first clause boundary — and
// bare "not" is deliberately absent from it. Both limits are load-bearing. A looser window
// clears real offenders: REQ-F-033's "fewer rounds, so that a small or exploratory project is
// **not** forced to carry full depth" denies something else entirely, and TASK-015 puts
// "Express: fewer rounds" one bullet above "a stage is **never** deleted".
const DENIAL_AFTER = /\b(?:is not|are not|does not|do not|did not|was not|were not|never|cannot|can't|must not|forbid(?:s|den)?|prohibit(?:s|ed)?|not allowed)\b/i

const normalise = (text) => text.replace(/\s+/g, ' ')
const firstClause = (s) => s.split(/[.;|]/)[0]

/** Every unnegated claim in one file, with enough context to act on. */
function claimsIn(relPath) {
  return claimsInText(normalise(readFileSync(join(REPO, relPath), 'utf8')))
}

function claimsInText(text) {
  const found = []
  for (const { id, re } of CLAIMS) {
    re.lastIndex = 0
    let m
    while ((m = re.exec(text)) !== null) {
      const end = m.index + m[0].length
      if (NEGATION_BEFORE.test(text.slice(Math.max(0, m.index - 90), m.index))) continue
      if (DENIAL_AFTER.test(firstClause(text.slice(end, end + 40)))) continue
      found.push({ id, quote: text.slice(Math.max(0, m.index - 60), end + 40).trim() })
    }
  }
  return found
}

test('UTEST-044: no user-facing file promises that a depth changes the round count', () => {
  const offenders = []
  for (const file of markdownFiles(ROOTS)) {
    for (const c of claimsIn(file)) offenders.push(`  ${file}\n    [${c.id}] …${c.quote}…`)
  }
  assert.equal(
    offenders.length,
    0,
    `A depth setting does not change the round count — the interview is eight rounds at both\n` +
      `depths, and express reduces the questions asked inside a round (instructions/depth.md,\n` +
      `instructions/intake.md). These files say otherwise:\n\n${offenders.join('\n')}\n`
  )
})

test('UTEST-044: the scanner actually reads the files it claims to cover', () => {
  // BR-009 — a check that silently scanned nothing would report a pass it never earned. This
  // is the whole reason the previous contradiction survived: nothing read these documents.
  const files = markdownFiles(ROOTS)
  assert.ok(files.length > 100, `expected the payload and the devkit spec, got ${files.length} files`)
  for (const required of [
    'plugin/README.md',
    'plugin/commands/spec-intake.md',
    'spec-driven-devkit/01-docs/02-requirements/requirements.md',
    'spec-driven-devkit/03-tests/02-functional/acceptance-tests.md',
  ]) {
    assert.ok(files.includes(required), `${required} must be scanned`)
  }
})

test('UTEST-044: the scanner catches the phrasings that actually shipped, and spares the correct ones', () => {
  // Without this, a regex typo would empty the scan and every file would "pass" — BR-009's
  // failure wearing a green tick. Uses the same matcher the scan uses, so it cannot drift.
  const caught = (s) => claimsInText(normalise(s)).length > 0

  // The sentences that were actually in the repository, including one hard-wrapped exactly as
  // `plugin/commands/spec-intake.md` wrapped it.
  assert.ok(caught('or `express` for a thinner\nworkspace in fewer rounds.'), 'the wrapped command text')
  assert.ok(caught('# thinner, fewer rounds'))
  assert.ok(caught('the workspace is thinner and took fewer rounds than the default depth'))
  assert.ok(caught('depth is an argument that reduces rounds and target depth'))
  assert.ok(caught('Answers a reduced set of rounds.'))
  assert.ok(caught('| Number of rounds | **Derived** from depth |'))
  assert.ok(caught('Express depth reduces rounds and depth'))
  assert.ok(caught('Express depth → the reduced count stated, not eight'))
  assert.ok(caught('express skips a round when the answers are simple'))
  assert.ok(caught('a shorter interview'))

  // And the sentences the kit is supposed to contain. A linter that flagged these would be
  // switched off within a week, which is the failure mode this repo already records for
  // checks that match too much.
  assert.ok(!caught('`express` asks less inside a round and never removes a round'), 'the correct rule')
  assert.ok(!caught('Reduce within a stage; never delete a stage'))
  assert.ok(!caught('`express` reduces\nthe questions asked inside a round, never the number of rounds'))
  assert.ok(!caught('How many rounds there are is fixed at eight, and is not a depth setting.'))
  assert.ok(!caught('Express asks fewer questions per round — up to two instead of four.'))
  assert.ok(!caught('It is eight at both depths.'))

  // Denial that FOLLOWS the claim — "name the bad thing, then forbid it".
  assert.ok(!caught('**Failure path — express depth would drop a stage entirely:** It does not.'))
  assert.ok(!caught('Reducing depth is allowed; deleting a stage is not.'))
  assert.ok(!caught('Skipping a stage is forbidden by the master process.'))

  // But a denial about something ELSE, a little further along, must not clear the claim.
  // Both of these shipped, and a looser window would have waved them through.
  assert.ok(caught('an **express depth** that produces a thinner workspace in fewer rounds, so that a small or exploratory project is not forced to carry full depth.'))
  assert.ok(caught('- Express: fewer rounds, thinner files.\n- **No stage is skipped.** Depth within a stage is reduced; a stage is never deleted.'))
})
