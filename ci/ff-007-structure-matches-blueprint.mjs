#!/usr/bin/env node
// FF-007 — every generated file's headings match its blueprint's, in order, and its back-link
// is present and resolves. Threshold: 100% match, 0 broken links. On failure: block merge.
//
// Guards contract C2 and ADR-003. This is the check that a file was PRODUCED rather than
// written: headings are copied from the blueprint and never invented, so a different outline
// means the fill procedure was not what made the file.
//
// It is also the check that found the first real defect in the golden set. `intent.md` in EV-001
// is missing `### Starter (Appendix A)`, which its blueprint has — the fixture was hand-edited,
// while its own header claims it "was not authored — it was produced".
//
// THE EXPECTED OUTLINE IS NOT THE BLUEPRINT'S RAW HEADINGS. Three of the six fill steps change
// them: step 2 removes the worked example, step 3 removes the prompt sections, and step 4 fills
// a heading that contains a placeholder. The first version of this check compared raw headings
// and reported ten violations in a workspace that had one — which is how a check gets switched
// off, taking its one real finding with it. `expectedHeadings` and `headingMatches` live in
// fill.mjs, beside the procedure that causes the difference.

// WRAPPER ARTIFACTS ARE EXEMPT, AND ONLY THOSE. `spec/.gitignore` and `spec/.env.example` are
// the two files the kit deliberately writes that are not a filled blueprint: their blueprint
// CARRIES them in a fenced block rather than being them (Q-024, fill.md). They have no outline
// to compare, and `headings()` reads their `#` comment lines as Markdown headings — so a
// byte-perfect `.gitignore` diverges at heading 1 (`# Secrets — never commit real values`
// against `# \`.gitignore\` — blueprint`) and `.env.example` produces eleven phantom headings
// including `# DATABASE_URL=…`. A .gitignore cannot stop using `#` for comments, so no
// blueprint edit can fix it and the check would have blocked the merge on correct work the day
// a workspace reached Round 6 — taking FF-007's three genuine golden findings with it.
//
// The exemption is not a path pattern. A file is exempt only when the blueprint it links to
// DECLARES it as its `> Writes:` target — so nothing but a wrapper's own artifact can claim it,
// a stray `spec/notes.txt` is still reported, and a third wrapper needs no edit here.

import { walkGolden, generated, blueprintText } from './golden.mjs'
import { headings, blueprintOf, expectedHeadings, headingMatches, wrapperTarget } from './fill.mjs'

process.exit(
  walkGolden({
    id: 'FF-007',
    guards: 'C2, ADR-003 — a generated file is its blueprint, filled in',
    threshold: '100% heading match, 0 missing or unresolvable back-links',
    measure: (ws) =>
      generated(ws).flatMap(([p, text]) => {
        const rel = blueprintOf(text)
        if (!rel) return [`VIOLATION: ${p} carries no blueprint back-link, so nothing can be checked against it`]
        const source = blueprintText(rel)
        if (source === null) return [`VIOLATION: ${p} links to blueprints/${rel}, which is not in the library`]
        const target = wrapperTarget(source)
        if (target && (p === `spec/${target}` || p.endsWith(`/${target}`))) return []
        const want = expectedHeadings(source)
        const got = headings(text)
        const i = want.findIndex((h, n) => !headingMatches(h, got[n]))
        const extra = i === -1 && got.length > want.length ? want.length : -1
        if (i === -1 && extra === -1) return []
        const at = i === -1 ? extra : i
        return [
          `VIOLATION: ${p} diverges from blueprints/${rel} at heading ${at + 1}: expected ${JSON.stringify(want[at] ?? null)}, found ${JSON.stringify(got[at] ?? null)}`,
        ]
      }),
    scope: [
      'the CONTENT under a heading — only that the structure is the blueprint\'s',
      'a wrapper artifact at all — .gitignore and .env.example have no outline to compare',
    ],
  })
)
