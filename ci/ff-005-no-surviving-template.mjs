#!/usr/bin/env node
// FF-005 — placeholder tokens, instructional italics and prompt boxes surviving into output.
// Threshold: 0. On failure: block merge.
//
// Guards auditability. ADR-003 steps 2 and 3 strip the worked example and the prompt boxes; step
// 4 replaces every placeholder. This is the check that those steps ran. A developer reading
// `[Describe the primary user]` in their own specification learns that the tool half-finished
// the job, and stops trusting the parts that look finished too.

import { walkGolden, generated } from './golden.mjs'
import { unfilled } from './fill.mjs'

const PROMPT_BOX = /^>\s*\*\*(Prompt|Ask|Consider|Guidance)\b/gim

process.exit(
  walkGolden({
    id: 'FF-005',
    guards: 'auditability — the fill procedure ran to completion (ADR-003)',
    threshold: '0 surviving placeholders and 0 prompt boxes',
    measure: (ws) =>
      generated(ws).flatMap(([p, text]) => [
        ...unfilled(text).map((u) => `VIOLATION: ${p} still carries the placeholder ${JSON.stringify(u.token ?? u)}`),
        ...(text.match(PROMPT_BOX) ?? []).map((b) => `VIOLATION: ${p} still carries the prompt box ${JSON.stringify(b.trim())}`),
      ]),
    scope: ['placeholders inside fenced blocks — those are template content to copy, not gaps (BUG-017)'],
  })
)
