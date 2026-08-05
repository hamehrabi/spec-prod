#!/usr/bin/env node
// FF-013 — the generated entry point is under 100 lines and every path in it resolves.
// Threshold: < 100 lines, 0 broken paths. On failure: block merge.
//
// Guards REQ-NF-009. The entry point is a map, and a map is only useful while it is shorter than
// the territory: past a hundred lines it is another document to read rather than the thing that
// tells you which document to read. A broken link in it is worse than a missing one, because the
// reader stops looking rather than looks elsewhere.
//
// It is the LAST file a run writes (intake.md step 4), for exactly this reason: every link can
// be verified the day it is written. So a workspace that has not finished has no entry point,
// and this reports that as not measured rather than as nothing broken.

import { walkGolden } from './golden.mjs'
import { validate } from './validation.mjs'
import { library } from './golden.mjs'

const lib = library()
const entryPoint = (ws) => Object.keys(ws).find((p) => /(^|\/)CLAUDE\.md$/.test(p))

process.exit(
  walkGolden({
    id: 'FF-013',
    guards: 'REQ-NF-009 — a map shorter than the territory, with no broken link',
    threshold: 'under 100 lines, 0 unresolvable paths',
    applies: (ws) => Boolean(entryPoint(ws)),
    measure: (ws) => {
      const check = validate(ws, lib).results.find((c) => c.n === 10)
      return check?.state === 'failed' ? check.detail.map((d) => `VIOLATION: ${d}`) : []
    },
    scope: ['whether the entry point is WELL written — only that it is short and its links work'],
  })
)
