#!/usr/bin/env node
// FF-004 — a generated file that carries an unfilled blueprint placeholder but NO [TODO].
// Threshold: 0. On failure: block merge.
//
// Guards reliability. The two halves matter together: a placeholder is a gap, and a [TODO] is
// the gap declared. A file with both is honest and partial. A file with neither is finished. A
// file with a placeholder and no marker is the dangerous one — it PRESENTS AS COMPLETE while
// being partial, and the reader has no way to tell. That is the failure BR-003 names, arriving
// through omission rather than invention.

import { walkGolden, generated } from './golden.mjs'
import { unfilled, todos } from './fill.mjs'

process.exit(
  walkGolden({
    id: 'FF-004',
    guards: 'reliability — a partial file never presents as a complete one',
    threshold: '0 files with an unfilled placeholder and no [TODO] marker',
    measure: (ws) =>
      generated(ws)
        .filter(([, text]) => unfilled(text).length > 0 && todos(text).length === 0)
        .map(([p, text]) => `VIOLATION: ${p} has ${unfilled(text).length} unfilled placeholder(s) and no [TODO]`),
    scope: ['whether a [TODO] is a GOOD description of the gap — only that the gap is declared'],
  })
)
