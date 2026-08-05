#!/usr/bin/env node
// FF-014 — each permission rule has at least one deny test, and each driving characteristic has
// at least one fitness function. Threshold: 100% on both. On failure: block merge.
//
// Guards BR-010. A permission rule with only allow tests is a rule nobody has watched refuse
// anything, and a driver with no fitness function is an adjective. Both are the same failure:
// a statement of intent with nothing that would notice its absence.

import { walkGolden } from './golden.mjs'
import { validate } from './validation.mjs'
import { library } from './golden.mjs'

const lib = library()
const CHECKS = { 8: 'a permission rule with no deny test', 9: 'a driving characteristic with no fitness function' }

process.exit(
  walkGolden({
    id: 'FF-014',
    guards: 'BR-010 — an intent with nothing to notice its absence is decoration',
    threshold: '100% of permission rules denied, 100% of drivers measured',
    // Both underlying checks report NOT RUN when the workspace has not yet declared any rule or
    // any driver. That is honest and must not be read as satisfied — so a case only counts as
    // measured once at least one of them actually ran.
    applies: (ws) =>
      validate(ws, lib).results.some((c) => [8, 9].includes(c.n) && c.state !== 'not-run'),
    measure: (ws) =>
      validate(ws, lib)
        .results.filter((c) => CHECKS[c.n] && c.state === 'failed')
        .flatMap((c) => c.detail.map((d) => `VIOLATION: ${CHECKS[c.n]} — ${JSON.stringify(d)}`)),
    scope: ['whether a deny test is a GOOD one — only that the rule has one'],
  })
)
