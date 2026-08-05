#!/usr/bin/env node
// FF-010 — files created outside spec/, and any state, progress, session, cache or answer file
// created anywhere. Threshold: 0 and 0. On failure: block merge.
//
// Guards ADR-004 and the boundary. Both halves matter, and the second is the one a run can fail
// while looking tidy: a workspace that wrote only inside spec/ but left `.accepted.json` there
// has a second source of truth, and it starts disagreeing with the specification the moment
// either changes. Stage acceptance is a dated row, never a file (ADR-006).

import { walkGolden } from './golden.mjs'
import { forbiddenStateFiles } from './acceptance.mjs'

process.exit(
  walkGolden({
    id: 'FF-010',
    guards: 'ADR-004, ADR-006 — one source of truth, and it is the workspace',
    threshold: '0 files outside spec/, 0 state files anywhere',
    measure: (ws) => [
      ...Object.keys(ws)
        .filter((p) => !p.startsWith('spec/'))
        .map((p) => `VIOLATION: ${p} was created outside spec/`),
      ...forbiddenStateFiles(Object.keys(ws)).map((p) => `VIOLATION: ${p} is a state file; acceptance is a dated row (ADR-006)`),
    ],
    scope: ['what the host itself writes — .git/ and .claude/ are not the kit'],
  })
)
