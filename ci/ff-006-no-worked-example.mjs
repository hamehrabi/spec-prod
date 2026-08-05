#!/usr/bin/env node
// FF-006 — worked-example content in any generated file. Threshold: 0. On failure: block merge.
//
// Guards BR-002: the developer must never inherit a requirement they did not make. 24 blueprints
// once carried an example ADR-003 step 2 could not strip, and "TeamTask Lite" and "SaaS task
// app" would have shipped as the developer's own decisions (BUG-008).
//
// IT SEARCHES FOR EVERY NAME, NOT ONE. A leak detector that knows a single product name reports
// zero leaks for every other name — which is why the pattern lives in ci/scorers.mjs beside the
// list of what the library's examples are called, and is imported rather than restated here.

import { walkGolden, generated } from './golden.mjs'
import { EXAMPLE_MARKERS } from './scorers.mjs'

process.exit(
  walkGolden({
    id: 'FF-006',
    guards: 'BR-002 — no developer inherits a requirement they did not make',
    threshold: '0 occurrences of any worked-example product or heading',
    measure: (ws) =>
      generated(ws).flatMap(([p, text]) =>
        [...new Set(text.match(new RegExp(EXAMPLE_MARKERS.source, 'g')) ?? [])].map(
          (hit) => `VIOLATION: ${p} contains worked-example content: ${JSON.stringify(hit)}`
        )
      ),
    scope: ['a developer who genuinely names their product the same thing — a false positive worth having'],
  })
)
