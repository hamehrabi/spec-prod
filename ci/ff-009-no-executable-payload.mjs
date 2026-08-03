#!/usr/bin/env node
// FF-009 — the published plugin payload contains zero files that are not Markdown or the
// plugin manifest. Threshold: 0. On failure: block merge.
//
// Guards ADR-002. cicd-pipeline.md calls this "the stage that must never be made optional":
// it is the check that keeps ADR-002 true, and the one most likely to be waved through when
// a useful script appears. Skipping it does not weaken a rule; it deletes the architecture.

import { existsSync } from 'node:fs'
import { PAYLOAD_ROOT, NOT_PAYLOAD, MANIFEST, isMarkdown, walk, inPayload, report } from './payload.mjs'

const root = process.argv[2] ?? PAYLOAD_ROOT

const files = walk(root)
const offenders = files.filter((f) => {
  const rel = root === PAYLOAD_ROOT ? inPayload(f) : f.slice(root.length + 1)
  return !isMarkdown(rel) && rel !== MANIFEST
})

// The exclusion list is itself part of the check (cicd-pipeline.md). A directory that holds
// check scripts or tests must stay OUTSIDE the payload root, or "no executable code" becomes
// true only by where someone happened to put a file.
const leaked = NOT_PAYLOAD.filter((d) => existsSync(`${root}/${d}`))

const detail = [
  `payload root: ${root}/`,
  `files in payload: ${files.length}`,
  `not payload (excluded by path): ${NOT_PAYLOAD.join(', ')}`,
  ...offenders.map((f) => `VIOLATION: ${f} is neither Markdown nor ${MANIFEST} (ADR-002)`),
  ...leaked.map((d) => `VIOLATION: ${d}/ is inside the payload root; it must not ship (ADR-002)`),
]

process.exit(
  report({
    id: 'FF-009',
    guards: 'ADR-002 — the kit ships no executable code',
    threshold: '0 files that are not Markdown or the plugin manifest',
    found: offenders.length + leaked.length,
    detail,
    scope: [
      'that a .md file contains no executable content — the register calls this structural',
      'anything outside the payload root; ci/ and .github/ may hold scripts, deliberately',
    ],
  })
)
