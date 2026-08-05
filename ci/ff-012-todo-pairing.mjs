#!/usr/bin/env node
// FF-012 — every [TODO] marker has a matching Q-### row, and no decision row is left blank.
// Threshold: 0 orphans, 0 blank decision rows. On failure: block merge.
//
// Guards BR-003. A [TODO] is the sanctioned outcome when a fact is unknown, but only as half a
// pair: the marker says something is missing, the row says who decides it and by when. A marker
// with no row is a gap nobody owns, and a blank table row is a decision nobody made presented
// as a table that was filled in.

import { walkGolden } from './golden.mjs'
import { validate } from './validation.mjs'
import { library } from './golden.mjs'

const lib = library()

process.exit(
  walkGolden({
    id: 'FF-012',
    guards: 'BR-003 — an unknown is recorded, owned, and never invented',
    threshold: '0 orphan [TODO] markers, 0 blank decision rows',
    measure: (ws) => {
      const check = validate(ws, lib).results.find((c) => c.n === 6)
      return check?.state === 'failed' ? check.detail.map((d) => `VIOLATION: ${JSON.stringify(d)}`) : []
    },
    scope: ['whether the OWNER named in a row is the right person — only that one is named'],
  })
)
