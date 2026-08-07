// UTEST-045 — four library-wide guards against content leaking out of the kit and into a
// developer's own specification.
// Requirement: BR-001 · BR-002 · Contract C2 · REQ-F-027 · REQ-F-029 · ADR-003 step 2.
//
// WHY THIS FILE EXISTS
//
// A 400-agent audit found twelve leaks. Every one of them was individually invisible: each
// was well-formed Markdown in a well-formed blueprint, and no check compared a blueprint to
// the rules the kit applies to the workspaces it generates. The twelve were found by reading.
// Reading does not scale to 81 files and it does not run in CI.
//
// So the twelve fixes are worth less than these four assertions, which state the CLASS each
// defect belonged to and scan the whole library for it:
//
//   1. no blueprint's KEPT body contains application source code (BR-001)
//   2. no blueprint's KEPT body cites one of the kit's own identifiers (BR-002 / BUG-015)
//   3. every blueprint has exactly one worked example and it is LAST (C2)
//   4. every relative link a blueprint carries resolves to something that ships (DD-022)
//
// KEPT BODY means everything above `# WORKED EXAMPLE`. ADR-003 step 2 deletes from that
// heading to end of file, so content below it never reaches the developer and content above
// it always does. That distinction is the whole subject of this file: three of the twelve
// defects were a fenced Python function sitting 82 to 816 lines ABOVE the heading that would
// have removed it.
//
// EXEMPTIONS ARE NAMED, NEVER SILENT. Each map below carries a written reason, for the same
// reason the C2 contract test does: an exemption nobody has to justify is how twenty-four
// blueprints stayed invisible.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { walk, toPosix } from '../../ci/payload.mjs'
import { stripWorkedExample, wrapperTarget } from '../../ci/fill.mjs'
import { CHECKS } from '../../ci/validation.mjs'

const LIB = 'plugin/blueprints'

/** Every packaged blueprint. MANIFEST.md is the integrity control, not a blueprint. */
const blueprints = walk(LIB)
  .map(toPosix)
  .filter((f) => f.endsWith('.md') && !f.endsWith('MANIFEST.md'))

const read = (f) => readFileSync(f, 'utf8')

/** What actually ships into `spec/` (ADR-003 step 2). */
const kept = (f) => stripWorkedExample(read(f))

/** Whitespace-normalised, because the library hard-wraps at ~95 columns and a phrase
 *  assertion against raw text is a line-wrap defect waiting to happen. */
const flat = (s) => s.replace(/\s+/g, ' ')

test('the library is non-empty and every blueprint was read', () => {
  // A glob that matches nothing passes every assertion below it. The count is asserted so
  // "no violations" can never be produced by "nothing was scanned".
  assert.ok(blueprints.length >= 80, `expected the packaged library, found ${blueprints.length} files`)
})

// --- 1. No application source code above the worked example (BR-001) --------------------------
//
// Validation check 11 is the executable form of BR-001 — "the kit writes specifications, never
// code". It runs against a generated workspace. Nobody had ever run it against the blueprints
// that PRODUCE that workspace, and three of them failed it: technical-spec.md §7.2,
// security-specification.md §2 and integration-tests.md each shipped a fenced ```python
// function in retained template body. Every workspace that filled one of those three was
// therefore told, correctly, that its own specification contained source code — a check failing
// on correct work, on the defining boundary of the product.
//
// Asserted by running the product's own check rather than by a new regex: a second, slightly
// different definition of "this is code" would drift from the first and one of them would be
// wrong without anyone noticing.

test('BR-001: no blueprint ships application source code in its kept body', () => {
  const offenders = blueprints
    .map((f) => [f, CHECKS[11].run({ [f]: kept(f) })])
    .filter(([, r]) => r.state !== 'passed')
    .map(([f, r]) => `${f}: ${r.detail.join('; ')}`)

  assert.deepEqual(
    offenders,
    [],
    'a code fence above `# WORKED EXAMPLE` ships into every workspace that fills the blueprint, ' +
      'and makes validation check 11 fail on correct work. Move the block below the heading, ' +
      'or state in prose what the developer should write.'
  )
})

// --- 2. The kit's own identifiers stay in the kit (BR-002) ------------------------------------
//
// BUG-015's rule, generalised: "a blueprint may state a rule; it may not cite the authority for
// a rule, because the authority lives in a repository the reader does not have." It was pinned
// for one file (spec-change-log.md) and for one namespace (ADR-###). technical-spec.md was
// meanwhile ending two paragraphs with `(BUG-019)` — this repository's defect register, which
// resolves nowhere in a developer's workspace, inside a paragraph narrating edits made to the
// blueprint library.
//
// The shape asserted is the PARENTHETICAL CITATION, not the bare identifier. Blueprints
// legitimately carry `TASK-001`, `ADR-000`, `UTEST-001` and `BUG-001` as template rows, example
// cells and file names — those are the developer's identifiers in the developer's namespace. A
// blanket ban would flag eleven correct blueprints and be switched off within a day.

const ID = '[A-Z][A-Z]*(?:-[A-Z]+)*-\\d{3}'
const CITATION = new RegExp(`\\(${ID}(?:\\s*(?:,|·|and)\\s*${ID})*\\)`, 'g')

/** Blueprints allowed to cite the kit's decisions, each for a written reason. */
const MAY_CITE_THE_KIT = {
  'plugin/blueprints/gitignore.md':
    'wrapper blueprint — `wrapperArtifact()` ships only the fenced block, so this prose never ' +
    'reaches the workspace. It is instruction to the fill agent, and the citations are what ' +
    'justify the wrapper mechanism to the next person who edits it.',
  'plugin/blueprints/env-example.md':
    'wrapper blueprint — same reason: the artifact written is the fence, not this page.',
}

test('BR-002: no blueprint cites the kit\'s own identifiers in its kept body', () => {
  const offenders = []
  for (const f of blueprints) {
    if (f in MAY_CITE_THE_KIT) continue
    for (const m of kept(f).match(CITATION) ?? []) offenders.push(`${f}: ${m}`)
  }
  assert.deepEqual(
    offenders,
    [],
    'a parenthetical identifier is a citation of an authority the developer does not have. ' +
      'State the rule; drop the citation — or add the file to MAY_CITE_THE_KIT with a reason.'
  )
})

test('BR-002: the exemption list names only files that exist and are wrappers', () => {
  // An exemption for a file that has since been renamed is a silent hole. And an exemption
  // granted on the grounds of "it is a wrapper" has to be checked against what makes a wrapper.
  for (const [f, reason] of Object.entries(MAY_CITE_THE_KIT)) {
    assert.ok(blueprints.includes(f), `${f} is exempted but is not in the library`)
    assert.ok(wrapperTarget(read(f)), `${f} is exempted as a wrapper but declares no \`> Writes:\` target`)
    assert.ok(reason.length > 40, `${f}'s exemption needs a reason, not a label`)
  }
})

test('BR-002: the kit\'s defect register does not narrate itself into a developer\'s spec', () => {
  // The regression the class above was found from. `technical-spec.md` explained the shape of
  // §5, §6 and §10 by describing edits made to the blueprint library — "This section used to
  // carry all eight of those subsections", "used to repeat the endpoint index … so a developer
  // filled the same table twice". In the developer's own technical specification those are
  // false statements about their document.
  const tech = flat(kept(`${LIB}/01-docs/04-technical-spec/technical-spec.md`))
  assert.doesNotMatch(tech, /BUG-\d{3}/, 'the kit\'s defect IDs must not ship')
  assert.doesNotMatch(tech, /This section used to carry/i)
  assert.doesNotMatch(tech, /used to repeat the endpoint index/i)
  assert.doesNotMatch(tech, /The third instance of the same duplication/i)

  // The ARGUMENT the citations were attached to has to survive; dropping it would invite the
  // next editor to restore the duplicated section the pointer replaced.
  assert.match(tech, /Two copies of a schema is the drift this whole kit exists to prevent/i)
})

// --- 3. Exactly one worked example, and it is last (Contract C2) -------------------------------
//
// C2 already asserts that no H1 follows `# WORKED EXAMPLE`. Two things got past it.
//
// `security-specification.md` carried a SECOND worked example at §7 — `**Worked example (Ch. 21
// §21.9)**` in bold body text, 59 lines above the real heading, declaring `Feature: Invite team
// member to project`, `SEC-INVITE-001` and six acceptance criteria for a feature the developer
// never asked for. Step 2 removes only the last section, so it shipped. It is a label rather
// than a heading, so the heading-level checks could not see it, and it names no product, so the
// worked-example content scan could not either. `technical-spec.md` §7.7 carried the same block.
//
// This asserts the LABEL, at line start, in the kept body. Prose that merely refers the reader
// to the worked example ("a filled version is in the worked example at the end of this file")
// is a pointer, not a second example, and is deliberately not matched.

const EXAMPLE_LABEL = /^\s{0,3}(?:#{1,6}\s+|\*\*)\s*(?:worked|filled|completed)\s+example\b/im

test('C2: no blueprint carries a second, mid-file worked example', () => {
  const offenders = blueprints
    .map((f) => [f, kept(f).split(/\r?\n/).filter((l) => EXAMPLE_LABEL.test(l))])
    .filter(([, hits]) => hits.length > 0)
    .map(([f, hits]) => `${f}: ${hits.map((h) => h.trim()).join(' | ')}`)

  assert.deepEqual(
    offenders,
    [],
    'step 2 deletes from `# WORKED EXAMPLE` to end of file and removes nothing above it. ' +
      'A second example in the kept body ships into the developer\'s specification (BR-002).'
  )
})

/** Blueprints with no `# WORKED EXAMPLE`, each for a written reason. Mirrors — and must agree
 *  with — NO_EXAMPLE_EXPECTED in the C2 contract test. */
const NO_EXAMPLE_EXPECTED = {
  'plugin/blueprints/gitignore.md': 'wrapper blueprint — the artifact it carries is itself the example',
  'plugin/blueprints/env-example.md': 'wrapper blueprint — every value in the artifact is already a placeholder',
}

test('C2: exactly one `# WORKED EXAMPLE` per blueprint, and it is the LAST heading of its level', () => {
  const problems = []
  for (const f of blueprints) {
    const lines = read(f).split(/\r?\n/)
    let fenced = false
    const h1 = []
    lines.forEach((l, i) => {
      if (/^\s*(?:```|~~~)/.test(l)) fenced = !fenced
      else if (!fenced && /^# /.test(l)) h1.push({ n: i + 1, text: l.trim() })
    })
    const examples = h1.filter((h) => /^# WORKED EXAMPLE/.test(h.text))

    if (examples.length === 0) {
      if (!(f in NO_EXAMPLE_EXPECTED)) problems.push(`${f}: no \`# WORKED EXAMPLE\` and no named exemption`)
      continue
    }
    if (examples.length > 1) problems.push(`${f}: ${examples.length} \`# WORKED EXAMPLE\` headings`)
    if (h1[h1.length - 1].n !== examples[examples.length - 1].n) {
      problems.push(`${f}: ${h1[h1.length - 1].text} comes after the worked example`)
    }
  }
  assert.deepEqual(problems, [], 'C2: one worked example, last in the file, removable as a whole')
})

test('C2: the two known orphaned sections were moved back above the worked example', () => {
  // BUG-003 recurring at H2, which `contentAfterWorkedExample` matches `/^# /` and cannot see.
  // `04-src/README.md` left five generic code rules below the example — "Secrets come from the
  // environment, never from source" — and `agent-task-list.md` left the whole "Avoid these task
  // words" section there. Step 2 deleted both, and every check computed from the same strip
  // reported green on a file that had silently lost a section.
  for (const [file, phrase] of [
    ['04-src/README.md', 'Secrets come from the environment, never from source'],
    ['02-tasks/01-planning/agent-task-list.md', 'They sound helpful but leave too much room for interpretation'],
  ]) {
    const body = flat(kept(`${LIB}/${file}`))
    assert.ok(body.includes(phrase), `${file}: "${phrase}" is below the worked example and is deleted at step 2`)
  }
})

// --- 4. Every relative link resolves to something that ships (DD-022) --------------------------
//
// `deployment-checklist.md` listed `Dockerfile.example` in a table headed "Detail documents in
// this folder", asserting the file sat beside it. MANIFEST.md records it as deliberately never
// packaged, and no wrapper produces it — so the row was a dead link in every workspace, in the
// one table whose whole job is to say where things are.
//
// Anchors are resolved too, and they found five more the reading pass missed: three blueprints
// pointed at `intent.md#5-open-questions` and `intent.md#4-non-goals--out-of-scope`, sections
// intent.md does not have and never had (it delegates both onward), and technical-spec.md
// pointed at a security checklist anchor that does not exist in review-log.md.

/** GitHub's heading-anchor rule: lower-case, drop punctuation, spaces become hyphens — and a
 *  run of spaces becomes a run of hyphens, which is why `& ` yields a double hyphen. */
const slug = (heading) =>
  heading.replace(/^#+\s*/, '').trim().toLowerCase()
    .replace(/[`*_]/g, '')
    .replace(/[^\w\- ]+/g, '')
    .replace(/ /g, '-')

const packagedPaths = new Set(blueprints.map((f) => f.slice(LIB.length + 1)))
const anchorsOf = (rel) =>
  new Set([...read(join(LIB, rel)).matchAll(/^#{1,6}\s+(.+?)\s*$/gm)].map((m) => slug(m[1])))

/** Link targets that resolve to nothing in the library, each for a written reason. */
const LINKS_TO_NOTHING_PACKAGED = {
  '03-tests/05-executable/unit': 'the folder the developer puts executable unit tests in; MANIFEST.md records its .gitkeep as deliberately not packaged (DD-020)',
  '03-tests/05-executable/integration': 'same — the integration-test folder',
  '03-tests/05-executable/end-to-end': 'same — the end-to-end-test folder',
}

test('DD-022: every relative link in a blueprint resolves to something that ships', () => {
  const broken = []
  for (const f of blueprints) {
    const dir = f.slice(LIB.length + 1).split('/').slice(0, -1)
    const lines = read(f).split(/\r?\n/)
    lines.forEach((line, i) => {
      for (const m of line.matchAll(/\]\(([^)\s]+?)(?:\s+"[^"]*")?\)/g)) {
        const target = m[1]
        if (/^(?:https?:|mailto:)/.test(target)) continue
        const [pathPart, fragment] = target.split('#')

        let rel = f.slice(LIB.length + 1)
        if (pathPart) {
          const parts = [...dir]
          for (const seg of pathPart.split('/')) {
            if (seg === '' || seg === '.') continue
            if (seg === '..') parts.pop()
            else parts.push(seg)
          }
          rel = parts.join('/')
        }

        const full = join(LIB, rel)
        const isDirectory = rel === '' || (existsSync(full) && statSync(full).isDirectory())
        if (!packagedPaths.has(rel) && !isDirectory) {
          if (!(rel in LINKS_TO_NOTHING_PACKAGED)) broken.push(`${f}:${i + 1} → ${target} (no such file)`)
          continue
        }
        if (fragment && packagedPaths.has(rel) && !anchorsOf(rel).has(fragment)) {
          broken.push(`${f}:${i + 1} → ${target} (no such heading in ${rel})`)
        }
      }
    })
  }
  assert.deepEqual(
    broken,
    [],
    'a link that looks authoritative while pointing at nothing is worse than an honest name. ' +
      'Fix the target, or name it in LINKS_TO_NOTHING_PACKAGED with a reason.'
  )
})

test('DD-022: the deployment checklist no longer promises a Dockerfile it does not ship', () => {
  const checklist = flat(read(`${LIB}/07-ops/01-deployment/deployment-checklist.md`))
  assert.doesNotMatch(checklist, /\]\(Dockerfile\.example\)/, 'the dead link is gone')
  assert.match(checklist, /No container file ships with this workspace/i, 'and the absence is stated, not silent')
})

// --- The individual regressions the four classes above were found from --------------------------

test('BR-002: requirements.md §3 does not mint four roles the developer never chose', () => {
  // The canonical BR-002 instance. The DELIVERABLE roles table was pre-filled with Owner /
  // Project manager / Team member / Viewer including "manage billing", and `REQ-R-001` was
  // minted as "The system must support the roles listed above." The only warning was the
  // whole-line italic `*Replace with your project's real roles.*` — which is an item on step
  // 4's placeholder inventory, so a compliant fill DELETES the warning and KEEPS the roles.
  // A single-user tool shipped a specification with four roles and a billing-capable Owner,
  // and a build agent implemented an authorisation layer for them.
  const req = kept(`${LIB}/01-docs/02-requirements/requirements.md`)
  const section = req.split(/^## 3\. /m)[1].split(/^## /m)[0]

  const [deliverable] = section.split(/\*\*Examples/)
  for (const role of ['Owner', 'Project manager', 'Team member', 'Viewer']) {
    assert.ok(!deliverable.includes(role), `"${role}" is pre-filled in the deliverable table`)
  }
  assert.doesNotMatch(deliverable, /The system must support the roles listed above/, 'REQ-R-001 must not be minted')

  // The examples survive — under a BOLD label, which step 4 does not touch, exactly as §2 and
  // §4 of the same file already do it. Deleting them would have been the wrong fix.
  assert.match(section, /\*\*Examples \(Ch\. 5 §5\.4\)\*\*/)
  assert.ok(section.includes('| Owner | Create workspace, invite users, manage billing'))
  assert.match(flat(section), /A role you list here is a role the agent will build/)
})

test('BR-002: decisions.md does not ship a password decision nobody made', () => {
  // The "Design decision format" block was not an empty skeleton: it named `REQ-AUTH-001` and
  // asserted server-side email/password auth, password hashing and a short-lived session token.
  // Check 1 then failed on any workspace with no authentication requirement, because
  // `Related requirement: REQ-AUTH-001` is a reference and not a definition.
  const decisions = kept(`${LIB}/01-docs/05-architecture/decisions.md`)
  assert.doesNotMatch(decisions, /REQ-AUTH-001/)
  assert.doesNotMatch(decisions, /Use server-side email\/password authentication/)
  assert.match(decisions, /Design Decision ID: DD-###/, 'the block is a skeleton, with stubs step 4 must fill')
  assert.match(decisions, /Related requirement: REQ-###/)

  // And the filled form is still shown — in the worked example, where step 2 removes it.
  assert.match(read(`${LIB}/01-docs/05-architecture/decisions.md`), /^# WORKED EXAMPLE[\s\S]*DD-AUTH-001/m)
})

test('C3: technical-spec.md §3 points at frontend-component-spec.md instead of restating it', () => {
  // The fourth instance of the duplication C3 exists to stop, invisible because the C3 test's
  // OWNED_ELSEWHERE was a hardcoded list of three. Both copies were Round 4, in the same
  // directory, and had already drifted apart on the empty-state rule.
  const tech = flat(kept(`${LIB}/01-docs/04-technical-spec/technical-spec.md`))
  const section = flat(kept(`${LIB}/01-docs/04-technical-spec/technical-spec.md`).split(/^## 3\. /m)[1].split(/^## /m)[0])

  assert.match(section, /The interface specification is not written here/i)
  assert.ok(section.includes('frontend-component-spec.md'), '§3 must name where the content lives')
  assert.match(section, /\| What you need \| Where it is \|/, 'and route the reader per topic')
  assert.match(section, /What belongs here instead:\*\* the interface decisions that are architectural/i)

  // The restated bodies are gone — asserted on the CONTENT, not on the heading, because the
  // heading was never the duplicate.
  assert.doesNotMatch(tech, /Every data-bound component must handle all five/i)
  assert.doesNotMatch(tech, /Purpose \| Data needed \| States \| Rules/)
  assert.doesNotMatch(tech, /DashboardShell/)
  assert.doesNotMatch(tech, /Supports requirement: REQ-###/)
})
