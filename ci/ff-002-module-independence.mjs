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
const changed = files !== undefined
  ? files.split(',').filter(Boolean)
  : gitChanged(arg('range') ?? defaultRange())

function defaultRange() {
  // On a pull request the base branch is the honest comparison point; the merge-base form
  // (three dots) asks what this branch changed, not what has happened on main meanwhile.
  const base = process.env.GITHUB_BASE_REF
  return base ? `origin/${base}...HEAD` : 'HEAD~1...HEAD'
}

function gitChanged(range) {
  return execFileSync('git', ['diff', '--name-only', range], { cwd: repo, encoding: 'utf8' })
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

const matches = (file, prefixes) => prefixes.some((p) => (p.endsWith('/') ? file.startsWith(p) : file === p))

const questions = changed.filter((f) => matches(f, MODULES.questions))
const blueprints = changed.filter((f) => matches(f, MODULES.blueprints))
const flow = changed.filter((f) => matches(f, MODULES.flow) && !matches(f, MODULES.questions))

// One rule, stated once: a blueprint change and a flow-or-question change may not share a
// commit. Either direction of the register's wording reduces to this.
const otherSide = [...questions, ...flow]
const violated = blueprints.length > 0 && otherSide.length > 0

process.exit(
  report({
    id: 'FF-002',
    guards: 'REQ-NF-005 — blueprints and interview logic change independently (ADR-001)',
    threshold: '0 blueprint files in a question/flow commit, and 0 question/flow files in a blueprint commit',
    found: violated ? blueprints.length + otherSide.length : 0,
    detail: [
      `files changed: ${changed.length}`,
      `  question set:  ${questions.length}${questions.length ? ` (${questions.join(', ')})` : ''}`,
      `  blueprints:    ${blueprints.length}${blueprints.length ? ` (${blueprints.join(', ')})` : ''}`,
      `  instruction set / commands: ${flow.length}${flow.length ? ` (${flow.join(', ')})` : ''}`,
      ...(violated
        ? [
            'VIOLATION: one commit changed a blueprint AND the interview logic that reads it.',
            '           REQ-NF-005 requires either to change without the other. Split the commit.',
          ]
        : []),
    ],
    scope: [
      'whether the two changes were semantically related — only that they were separable',
      'commits that predate the range being examined',
    ],
  })
)
