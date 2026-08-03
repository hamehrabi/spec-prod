#!/usr/bin/env node
// FF-002 — module independence. For a commit touching the question set, the count of
// blueprint files changed must be 0; for a commit touching a blueprint, the count of
// instruction-set or question files changed must be 0. Threshold: 0 in both directions.
// On failure: block merge.
//
// Guards REQ-NF-005 via ADR-001. This is the check that makes the boundary decidable rather
// than arguable: a commit is the unit, because "these could have been changed separately" is
// only provable by them having been.
//
// Usage:
//   ff-002-module-independence.mjs                      # the current PR, or HEAD~1..HEAD
//   ff-002-module-independence.mjs --range=a..b
//   ff-002-module-independence.mjs --files=path,path     # no git needed
//   ff-002-module-independence.mjs --repo=/tmp/fixture   # run git inside another repo

import { execFileSync } from 'node:child_process'
import { MODULES, report } from './payload.mjs'

const arg = (name) => process.argv.slice(2).find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3)

const repo = arg('repo') ?? process.cwd()
const files = arg('files')

function defaultRange() {
  const base = process.env.GITHUB_BASE_REF
  return base ? `origin/${base}..HEAD` : 'HEAD~1..HEAD'
}

const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' })
const lines = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean)

// --no-merges: a merge commit introduces no changes of its own, and its combined diff would
// look exactly like the coupling this check forbids.
const revList = (range) => lines(git('rev-list', '--no-merges', range))
const filesIn = (sha) => lines(git('show', '--name-only', '--format=', sha))

// THE UNIT IS A COMMIT, not a branch. Checking a branch's aggregate diff would conflate two
// commits that were correctly kept separate — and it would make splitting a commit, which is
// the fix this check tells you to apply, do nothing at all. Each commit is judged alone.
const commits = files !== undefined
  ? [{ sha: '(supplied)', changed: files.split(',').filter(Boolean) }]
  : revList(arg('range') ?? defaultRange()).map((sha) => ({ sha, changed: filesIn(sha) }))

const matches = (file, prefixes) => prefixes.some((p) => (p.endsWith('/') ? file.startsWith(p) : file === p))

const short = (list) => (list.length > 3 ? `${list.slice(0, 3).join(', ')} +${list.length - 3} more` : list.join(', '))

const verdicts = commits.map(({ sha, changed }) => {
  const questions = changed.filter((f) => matches(f, MODULES.questions))
  const blueprints = changed.filter((f) => matches(f, MODULES.blueprints))
  const flow = changed.filter((f) => matches(f, MODULES.flow) && !matches(f, MODULES.questions))
  // One rule, stated once: a blueprint change and a flow-or-question change may not share a
  // commit. Either direction of the register's wording reduces to this.
  const otherSide = [...questions, ...flow]
  return { sha, changed, questions, blueprints, flow, otherSide, violated: blueprints.length > 0 && otherSide.length > 0 }
})

const bad = verdicts.filter((v) => v.violated)

process.exit(
  report({
    id: 'FF-002',
    guards: 'REQ-NF-005 — blueprints and interview logic change independently (ADR-001)',
    threshold: '0 blueprint files in a question/flow commit, and 0 question/flow files in a blueprint commit',
    found: bad.length,
    detail: [
      `commits examined: ${verdicts.length}`,
      ...verdicts.flatMap((v) => [
        `  ${v.sha === '(supplied)' ? 'supplied list' : v.sha.slice(0, 8)} — ${v.changed.length} file(s): ${v.blueprints.length} blueprint, ${v.questions.length} question, ${v.flow.length} instruction/command`,
        ...(v.violated
          ? [
              `    VIOLATION: this commit changed a blueprint AND the interview logic that reads it.`,
              `      blueprints:  ${short(v.blueprints)}`,
              `      other side:  ${short(v.otherSide)}`,
              `      REQ-NF-005 requires either to change without the other. Split the commit.`,
            ]
          : []),
      ]),
    ],
    scope: [
      'whether the two changes were semantically related — only that they were separable',
      'merge commits, which introduce no changes of their own',
      'commits that predate the range being examined',
    ],
  })
)
