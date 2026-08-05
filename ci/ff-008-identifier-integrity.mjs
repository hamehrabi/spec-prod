#!/usr/bin/env node
// FF-008 — every referenced identifier resolves to a definition in the same workspace, and no
// identifier is defined twice. Threshold: 0 dangling, 0 duplicate. On failure: block merge.
//
// Guards auditability. An identifier is the whole traceability story: REQ-F-003 in a task file
// is a promise that REQ-F-003 exists and says something. A dangling one is worse than no
// reference at all, because it reads as traceable.
//
// This is BUG-023's detector. A run stopped at Round 1 referenced Q-001 through Q-005 with
// nowhere to define them, because open-questions.md belonged to Round 2 — five dangling
// identifiers in a four-file workspace, and no check in CI could see it.

import { walkGolden } from './golden.mjs'
import { validate } from './validation.mjs'
import { library } from './golden.mjs'

const lib = library()

process.exit(
  walkGolden({
    id: 'FF-008',
    guards: 'auditability — a reference is a promise that the thing exists',
    threshold: '0 dangling, 0 duplicate identifiers',
    measure: (ws) => {
      const check = validate(ws, lib).results.find((c) => c.n === 1)
      return check?.state === 'failed' ? check.detail.map((d) => `VIOLATION: ${d}`) : []
    },
    scope: ['whether a definition is any GOOD — only that a reference resolves to one'],
  })
)
