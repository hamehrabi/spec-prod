// The twelve validation checks, executable (REQ-F-029, BR-009).
//
// Each takes a workspace — a { path: contents } map — and returns
// { state: 'passed' | 'failed' | 'not-run', detail: [...] }.
//
// THREE STATES, NEVER TWO. "No failures" and "nothing was checked" produce identical output
// if you only print failures, and that identity is exactly how a hollow workspace ships
// looking complete. Every check reports which of the three it is, and the report states the
// COUNT THAT RAN rather than asserting from the absence of failures.
//
// Twelve, fixed. Not a rules engine, not a schema language, not configurable — validation is
// a supporting concern and is built simply.

import { placeholders, unfilled, todos, blueprintOf } from './fill.mjs'

const passed = (detail = []) => ({ state: 'passed', detail })
const failed = (detail) => ({ state: 'failed', detail })

/**
 * A check that did not run, and why.
 *
 * `because` is a reason CODE, for the one caller that has to tell two not-runs apart. Everything
 * else treats every not-run identically, which is the whole of BR-009.
 */
const notRun = (reason, because = null) => ({ state: 'not-run', detail: [reason], because })

/** Check 10 has nothing to read until the entry point exists. See `validate()`. */
export const AWAITING_ENTRY_POINT = 'awaiting-entry-point'

const md = (ws) => Object.entries(ws).filter(([p]) => p.endsWith('.md'))

/**
 * Does this file tell the developer to copy it?
 *
 * A workspace ships a few files that are templates for the developer's own later use —
 * `ADR-000-template.md` is one — and those keep their placeholders on purpose. Check 5 flagged
 * twelve violations in that one file on the first eight-round run, for containing exactly the
 * `[Decision Title]` and `[Option A]` markers that make it usable.
 *
 * READ FROM THE FILE, NOT FROM A LIST OF NAMES. The instruction to copy is a sentence the
 * blueprint already carries, so a template added to the library tomorrow is covered the day it
 * arrives — and a file that merely has "template" in its name is not excused for having it.
 *
 * Anchored to the top of the file: this must be the document telling you to copy IT, not a
 * sentence somewhere in the middle telling you to copy something else.
 *
 * NO `m` FLAG, deliberately. With it, `^` matches at every line start, so the twelve-line limit
 * could begin anywhere and the anchor meant nothing — the first version had it, and a file with
 * forty lines of filler before the sentence still passed.
 */
export const isTemplate = (text) => /^(?:.*\n){0,12}?[ \t]*>?[ \t]*Copy this file to /.test(text)
const all = (ws) => Object.values(ws).join('\n')

/** Compare question text the way a reader would: same words, same order, punctuation and
 *  line-wrapping ignored. The library hard-wraps at ~95 columns, so the same sentence appears
 *  broken in one file and whole in another — comparing raw strings would call those different
 *  questions, which is line-wrap blindness for the ninth time in this repository. */
// TRIM BEFORE STRIPPING PUNCTUATION. A table cell is padded — `| What exists? |` collapses to
// " what exists? " and the trailing `?` is no longer at the end, so the strip silently does
// nothing and the cell never matches the marker it came from.
const norm = (s) => s.toLowerCase().replace(/[*`_]/g, '').replace(/\s+/g, ' ').trim().replace(/[.?!,;:]+$/, '')

// Identifiers this workspace uses. Deliberately narrow: a pattern loose enough to catch
// everything also catches prose, and a check with false positives gets switched off.
const ID = /\b(REQ-[A-Z]+|BR|CON|AC|US|ADR|DD|FF|TASK|Q|RISK|SEC-[AZ]|EV|[UAEFSP]?TEST)-\d{3}\b/g

// --- Reading a table the way a reader reads one ------------------------------------------
//
// Four of these checks are about TABLE CELLS — which cell is blank, which column names the
// fitness function, whether a row defines an identifier or merely cites it. Each of them used
// to ask a line-anchored regex instead, and each was wrong in the same direction: a pattern
// over the raw line cannot tell column three from column six, so it either matched nothing
// (check 7 required EVERY cell blank) or matched everything (check 2 read a traceability row
// as a second definition). Parse once, ask questions of cells.

const cellsOf = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())

/**
 * The `|---|:--:|` line. It separates a header from its rows and is not a row.
 *
 * THE DASH IS REQUIRED. Without it `| | |` — a row with every cell empty, the exact thing
 * check 7 is looking for — reads as a delimiter and is skipped, and the check goes quiet on
 * its own subject.
 */
const isDelimiter = (line) => /^\s*\|[\s:|-]+\|\s*$/.test(line) && line.includes('-')

/**
 * Every data row of every table, tagged with the header row it sits under.
 *
 * A table is a header line, a delimiter line, then rows — the three parts a reader sees, and
 * the delimiter is what makes it a table rather than a line with pipes in it.
 *
 * FENCED BLOCKS ARE SKIPPED. Several blueprints keep a template block the developer is meant
 * to COPY, pipes and all (BUG-017). Reading those as decisions somebody failed to make is
 * that same defect arriving from the other side.
 */
function tableRows(text) {
  const lines = text.split('\n')
  const rows = []
  let fenced = false
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(```|~~~)/.test(lines[i])) fenced = !fenced
    if (fenced) continue
    if (!/^\s*\|/.test(lines[i]) || !isDelimiter(lines[i + 1] ?? '')) continue
    const header = cellsOf(lines[i])
    let j = i + 2
    for (; j < lines.length && /^\s*\|/.test(lines[j]) && !/^\s*(```|~~~)/.test(lines[j]); j++) {
      if (!isDelimiter(lines[j])) rows.push({ header, cells: cellsOf(lines[j]), line: j + 1, raw: lines[j].trim() })
    }
    i = j - 1
  }
  return rows
}

/** The identifier a row's first cell IS, or null. `**Q-001**` counts; `see Q-001` does not. */
const firstCellId = (row) => row.cells[0]?.replace(/\*/g, '').match(/^(\w[\w-]*-\d{3})$/)?.[1] ?? null

/** Which column is this, by header. -1 when the table has no such column. */
const columnNamed = (header, re) => header.findIndex((h) => re.test(h))

/** Words, meaning words — not `✔ / ✘`, which splits into three tokens and says nothing. */
const wordCount = (cell) => (cell.match(/[A-Za-z]{2,}/g) ?? []).length

// --- The manifest ------------------------------------------------------------------------

/** Never generated and never skipped — template scaffolding, not an artifact (coverage.md). */
const PERMANENT_EXCLUSION = '01-docs/10-reference/appendix-index.md'

/**
 * The blueprints a manifest lists, read from the manifest's own text.
 *
 * MANIFEST.md holds two tables of backticked paths: the blueprints, each with a SHA-256, and
 * "Deliberately not packaged", each with a reason. Only the first kind can be filled or
 * skipped. Requiring the checksum column is what separates them — a pattern that reads any
 * backticked first cell returns 88 entries for an 81-blueprint library, six of which are not
 * paths at all, and check 13 then fails every possible complete run.
 */
export const manifestBlueprints = (text) =>
  [...text.matchAll(/^\|\s*`([^`]+)`\s*\|\s*`[0-9a-f]{64}`\s*\|/gm)].map((m) => m[1])

export const CHECKS = {
  1: {
    name: 'every referenced identifier resolves',
    run(ws) {
      // AN IDENTIFIER SHOWN AS A FORMAT IS NOT AN IDENTIFIER BEING CITED. The test-plan
      // blueprint documents its own fields with "Test ID | Unique identifier such as
      // `TEST-001`" — illustrating the shape a developer should use, not pointing at a test.
      // That sentence is kept blueprint prose, so it ships into EVERY workspace, and check 1
      // failed all of them for it.
      //
      // The same distinction FF-018 draws about paths: a citation is a promise something
      // exists, an example is a thing being described. Recognised by the words that introduce
      // one — narrow on purpose, because anything looser would let a real dangling reference
      // hide behind a stray "e.g." earlier in the line.
      const text = all(ws).replace(/\b(?:such as|e\.?g\.?|for example|like)\s+`?\w[\w-]*-\d{3}`?/gi, '')
      // Defined = introduced by a table row or heading that starts with the identifier.
      const defined = new Set([...all(ws).matchAll(/^[|#>\s-]*\**(\w[\w-]*-\d{3})\**\s*[|:—-]/gm)].map((m) => m[1]))
      const dangling = [...new Set(text.match(ID) ?? [])].filter((id) => !defined.has(id))
      return dangling.length === 0
        ? passed([`${defined.size} identifiers defined`])
        : failed(dangling.slice(0, 5).map((id) => `${id} is referenced but never defined`))
    },
  },
  2: {
    name: 'no identifier is defined twice',
    run(ws) {
      // A ROW THAT CITES AN IDENTIFIER IS NOT A SECOND DEFINITION OF IT. This used to count
      // every row whose first cell held an identifier, anywhere — and the traceability matrix
      // is a table whose first column IS the requirement ID, by design. So the moment Round 8
      // filled `01-docs/08-traceability/traceability.md`, every requirement in the workspace
      // was reported as defined twice: one failure line per requirement, on correct work.
      //
      // That is the failure mode check 9 records for itself forty lines below — a control that
      // cries wolf is a control that gets switched off — and it is worse here, because the
      // suggested repair is to go and delete the traceability chain.
      //
      // The whole library was surveyed to draw this line, not guessed. Three shapes mark a row
      // as a citation rather than a definition, and every cross-reference table in the library
      // is caught by at least one of them:
      //
      //   the table declares two or more ID columns   `| Req ID | … | Task ID | Test ID |`
      //   the row cites two or more other identifiers `| REQ-F-001 | … | TEST-006, FTEST-001 |`
      //   no cell after the first holds prose         `| REQ-001 | ✔ | ✔ | ✔ | ✔ | |`
      //
      // It errs toward MISSING a duplicate rather than inventing one, deliberately: the cost of
      // a missed reuse is one identifier nobody caught, and the cost of a false positive is the
      // whole check being switched off. The count of rows read as citations is reported, so the
      // blind spot is stated rather than hidden (BR-009 applies to a check's own scope too).
      const seen = new Map()
      let citations = 0
      for (const [path, text] of md(ws)) {
        for (const row of tableRows(text)) {
          const id = firstCellId(row)
          if (!id) continue
          const rest = row.cells.slice(1)
          const others = new Set((rest.join(' ').match(ID) ?? []).filter((x) => x !== id)).size
          // A TABLE THAT ASKS QUESTIONS ABOUT AN IDENTIFIER IS REVIEWING IT, NOT DEFINING IT.
          // `traceability-review.md` heads its columns "Has design decision? | Has task? | Has
          // test? | Has code link? | Reviewed?" — a checklist whose subject is the requirement
          // named in column one. The first eight-round run reported every requirement in it as
          // a duplicate definition of the one in requirements.md.
          //
          // None of the three shapes above catch it: one ID column, one cited identifier, and a
          // Gap cell holding real prose. The question marks are what distinguish it, and they
          // are hard to write by accident.
          const reviewTable = row.header.slice(1).filter((h) => h.includes('?')).length >= 2
          if (
            reviewTable ||
            row.header.filter((h) => /\bIDs?\b/i.test(h)).length >= 2 ||
            others >= 2 ||
            !rest.some((c) => wordCount(c) >= 3)
          ) {
            citations++
            continue
          }
          const at = seen.get(id) ?? []
          if (!at.includes(path)) at.push(path)
          seen.set(id, at)
        }
      }
      const dupes = [...seen].filter(([, at]) => at.length > 1)
      return dupes.length === 0
        ? passed([`${seen.size} identifiers defined once; ${citations} row(s) read as citations, not definitions`])
        : failed(dupes.slice(0, 5).map(([id, at]) => `${id} is defined in ${at.join(' and ')}`))
    },
  },
  3: {
    name: 'every file copied from a blueprint ends with a back-link that resolves',
    run(ws, library = null) {
      // THE ENTRY POINT IS NOT A FILLED BLUEPRINT. `spec/CLAUDE.md` is composed by
      // `instructions/entrypoint.md` from what the workspace already contains — there is no
      // blueprint it is a copy of, so there is nothing for a back-link to point at. Requiring
      // one failed the first eight-round run ever produced, for writing the entry point exactly
      // as specified.
      //
      // Excluded BY NAME, not by a pattern. A rule like "files at the workspace root are
      // exempt" would also excuse `spec/README.md`, which IS a filled blueprint and whose
      // back-link is the only thing tying it to one.
      const files = md(ws).filter(([p]) => p !== 'spec/CLAUDE.md')
      const missing = files.filter(([, text]) => !blueprintOf(text))
      if (missing.length) return failed(missing.slice(0, 5).map(([p]) => `${p} has no blueprint back-link`))
      if (!library) return notRun('the blueprint library was not supplied, so targets could not be resolved')
      const broken = files.filter(([, text]) => !library.includes(blueprintOf(text)))
      return broken.length === 0
        ? passed([`${files.length} back-links resolve`])
        : failed(broken.slice(0, 5).map(([p, t]) => `${p} points at ${blueprintOf(t)}, which is not in the library`))
    },
  },
  4: {
    name: 'no worked-example content survives',
    run(ws) {
      // Every fictional product the library names, not just ProjectBoard — "TeamTask Lite"
      // and "SaaS task app" lived in examples this check could not see (BR-002).
      const hits = md(ws).filter(([, t]) => /^# WORKED EXAMPLE/m.test(t) || /ProjectBoard|TeamTask Lite|SaaS task app/.test(t))
      return hits.length === 0
        ? passed()
        : failed(hits.slice(0, 5).map(([p]) => `${p} still contains worked-example content`))
    },
  },
  5: {
    name: 'no surviving placeholder or instructional italic',
    run(ws) {
      // A FILE THE WORKSPACE SHIPS FOR THE DEVELOPER TO COPY KEEPS ITS PLACEHOLDERS. That is
      // what it is for. `ADR-000-template.md` says so in its own second line — "Copy this file
      // to ADR-001-short-title.md and fill it in" — and the first eight-round run reported
      // twelve violations against it for containing exactly the `[Decision Title]` and
      // `[Option A]` markers that make it usable.
      //
      // Acting on that report would have meant filling the template in, which destroys the
      // file. A check whose fix breaks the thing it checked is worse than no check.
      //
      // DECIDED BY THE FILE'S OWN TEXT, not by a filename list. `isTemplate` asks whether the
      // file tells the developer to copy it — so a new template added to the library is covered
      // the day it arrives, and a file that merely has "template" in its name is not excused.
      const hits = md(ws)
        .filter(([, t]) => !isTemplate(t))
        .map(([p, t]) => [p, unfilled(t)])
        .filter(([, u]) => u.length > 0)
      return hits.length === 0
        ? passed()
        : failed(hits.slice(0, 5).map(([p, u]) => `${p} line ${u[0].line}: ${u[0].text.slice(0, 40)}`))
    },
  },
  6: {
    name: 'every [TODO] has a matching Q-### row',
    run(ws) {
      // MATCHING means matching. The previous rule ended in `&& questions.size === 0`, so the
      // whole check went silent the moment ONE Q-### row existed anywhere in the workspace —
      // and Round 2 creates open-questions.md, so from the second round onwards it passed
      // unconditionally. The check named after the pairing rule exempted every workspace old
      // enough to break it, which is BUG-008's shape exactly (BUG-013).
      //
      // Two things count as a pairing, and both are real:
      //   1. the TODO cites a Q-### beside itself — an explicit reference
      //   2. an open-question row asks the same question — the normal case, since fill.md
      //      writes both from one source, so the texts are the same text
      //
      // Matching on TEXT rather than on a cited ID is deliberate: it needs no ID allocated at
      // the round that writes the TODO, for a row a later round creates. It fails on drift —
      // one side reworded and not the other — which is the defect, not a false positive.
      // A CITATION IS A CITATION, NOT A DISTANCE. The first branch used to accept any `Q-###`
      // within 300 characters of the marker — so an orphan one line below an unrelated
      // question row paired with it, and padding the gap to ~520 characters flipped the same
      // workspace to failed without a word of either changing. The verdict was byte distance;
      // the rule this check is named after asks for a reference a reader can follow.
      //
      // A citation now has to be inside the marker's own brackets or in the row that carries
      // it — and it has to name a `Q-###` that EXISTS. Citing a question nobody wrote down is
      // the orphan case wearing an identifier.
      //
      // A row is { id, answered }. `answered` matters because a marker is stale the moment its
      // question is decided somewhere else in the same workspace — see below.
      const rows = new Map()
      const byId = new Map()
      for (const m of all(ws).matchAll(/^\|\s*\**(Q-\d{3})\**\s*\|([^|]*)\|(.*)$/gm)) {
        const row = { id: m[1], answered: /\|\s*\**Answered\**\s*\|/i.test(`|${m[3]}`) }
        rows.set(norm(m[2]), row)
        byId.set(m[1], row)
      }
      const bad = []
      for (const [p, t] of md(ws)) {
        // Located by scanning forward, so two markers asking the same question are two markers.
        let from = 0
        for (const q of todos(t)) {
          // THE ENTRY POINT'S TWO SANCTIONED MARKERS HAVE NO QUESTION ROW BY DESIGN (BUG-035).
          //
          // `entrypoint.md` instructs both of them in as many words: an unknown command is
          // "`[TODO: ask the team - <the exact question>]`, never a guess", and an unreadable
          // version is "`[TODO: plugin version could not be determined]`". Neither is an open
          // SPECIFICATION question — one is addressed to the developer's colleagues and the
          // other to a file on disk — so neither belongs in `open-questions.md`, which carries
          // a decision owner and a round that will close it.
          //
          // The first complete run wrote the first form exactly as told, and this check called
          // it an orphan. The direction is what makes it a defect rather than a curiosity: the
          // repair a reader makes from "has no Q-### row" is to file a question for a decision
          // already assigned to TASK-001, and then two records disagree about who owns the stack.
          //
          // NARROW ON PURPOSE — the form AND the file. `entrypoint.md` is the only instruction
          // that writes either one, and it writes them only into the entry point. "Any marker
          // beginning 'ask the team'" would hand every round a phrase that switches this check
          // off, which is how BUG-013 worked.
          if (p === 'spec/CLAUDE.md' && (/^ask the team\b/i.test(q) || /^plugin version could not be determined\b/i.test(q))) continue
          const at = t.indexOf(q, from)
          from = at + q.length
          const lineEnd = t.indexOf('\n', at)
          const line = t.slice(t.lastIndexOf('\n', at) + 1, lineEnd === -1 ? t.length : lineEnd)
          // THE MARKER FIRST, THEN ITS LINE. `line` is one line, and a [TODO] long enough to
          // need a citation is long enough to wrap — so the citation lands on the marker's
          // SECOND line and a one-line slice cannot see it:
          //
          //   > [TODO: what is the monitoring appetite — structured logs + error alerts, or
          //   > full metrics and tracing? — Q-018]. Version one plans structured logs...
          //
          // A real eight-round run produced four of those and this check called all four
          // unpaired, on a workspace that had done exactly the right thing. That is the
          // twelfth defect in this repository to be a pattern dying across a hard wrap, and
          // this one arrived in the commit that fixed the opposite failure — the rule used to
          // accept any Q-### within 300 characters, and tightening it to "the marker or its
          // row" replaced matching too much with matching too little.
          const cited = [...new Set(`${q} ${line}`.match(/\bQ-\d{3}\b/g) ?? [])]
          const row = rows.get(norm(q)) ?? cited.map((c) => byId.get(c)).find(Boolean)
          // STALE, not merely unpaired. The question was answered and the marker was left
          // behind, so the workspace now contradicts itself — and a marker its own workspace
          // contradicts is worse than an open one, because it teaches the reader that markers
          // mean nothing (BUG-014). Reported separately: the fix is the opposite of the other
          // one. An orphan needs a question added; a stale marker needs the marker removed.
          if (row?.answered) bad.push([p, q, `${row.id} is already Answered — the marker is stale`])
          else if (row) continue
          else if (cited.length) bad.push([p, q, `cites ${cited.join(', ')}, which has no Q-### row`])
          else bad.push([p, q, 'has no Q-### row'])
        }
      }
      const open = [...rows.values()].filter((r) => !r.answered).length
      return bad.length === 0
        ? passed([`${open} open questions; every [TODO] resolves to one, and none is stale`])
        : failed(bad.slice(0, 5).map(([p, q, why]) => `${p}: [TODO: ${q.slice(0, 40)}] ${why}`))
    },
  },
  7: {
    name: 'no table row requiring a decision is left blank',
    run(ws) {
      // THE ROWS THIS RULE IS WRITTEN ABOUT ARE NOT BLANK ROWS. The old pattern was
      // `/^\|(?:\s*\|){2,}\s*$/` — every cell empty, first one included — which is a row nobody
      // has touched, and `unfilled()` already reports that one as an `empty-row` placeholder.
      // So check 7 duplicated a check 5 finding and caught nothing else.
      //
      // What it exists for is the row that has been touched and not decided:
      //
      //   | Login | | | per IP + per account | 429 + `Retry-After` | |
      //
      // — a real rate-limiting row from `runtime-and-scale.md`, which named the endpoint and
      // left the limit and the window empty. Both checks passed it. *We decided* was not
      // distinguishable from *nobody looked*, which is the one thing this check is named for.
      //
      // TWO OR MORE ADJACENT EMPTY CELLS, wherever they fall in the row. A single gap is how a
      // legitimately sparse table reads — a traceability row with no code link yet, a matrix
      // cell that does not apply — and flagging those would fail correct work in every
      // workspace that reaches Round 8. A RUN of them is a decision nobody made.
      const undecided = (row) => {
        let run = 0
        for (const cell of row.cells) if ((run = cell === '' ? run + 1 : 0) >= 2) return true
        return false
      }
      const blanks = md(ws)
        .map(([p, t]) => [p, tableRows(t).filter(undecided)])
        .filter(([, rows]) => rows.length > 0)
      return blanks.length === 0
        ? passed()
        : failed(
            blanks
              .slice(0, 5)
              .map(([p, rows]) => `${p} line ${rows[0].line}: ${rows[0].raw.slice(0, 60)} (${rows.length} undecided row(s))`)
          )
    },
  },
  8: {
    name: 'every permission rule has at least one deny test',
    run(ws) {
      // THIS CHECK COULD NOT FAIL. It counted the words "must not" and "cannot" across the
      // whole workspace and passed on one — and those are ordinary English: 46 of 81 blueprint
      // bodies ship one, and on the golden workspace the matches included the literal column
      // header `| Role | Can do | Cannot do |`. A three-rule roles table with no denial test
      // anywhere passed, reporting "27 denial statements". The check named after the one thing
      // that distinguishes an enforced permission model from a decorated one was satisfied by
      // prose about anything at all.
      //
      // The same words are still what marks a denial — but only INSIDE a permission rule's own
      // row, never loose in the document. And the pairing is per rule, because that is the
      // claim the check's name makes.
      //
      // Two things count as a permission rule, and both are how this library writes one:
      //   a `REQ-R-###` row      — requirements.md §3 declares the format
      //   a row of a roles table — a table whose first column is Role or Actor
      //
      // Rules are collected BY IDENTIFIER, not by row: `REQ-R-001` cited again in a second
      // table is the same rule, and counting it twice would report a rule set larger than the
      // one the developer wrote.
      const rules = new Map()
      const roles = []
      for (const [path, text] of md(ws)) {
        for (const row of tableRows(text)) {
          const id = firstCellId(row)
          if (id && /^REQ-R-\d{3}$/.test(id)) {
            const seen = rules.get(id) ?? { id, path, text: '' }
            rules.set(id, { ...seen, text: `${seen.text} ${norm(row.cells.slice(1).join(' '))}`.trim() })
            continue
          }
          if (!/^(roles?|actors?)$/i.test(row.header[0] ?? '')) continue
          const cannot = columnNamed(row.header, /cannot|can ?not|may not|denied|denies|forbidden|prohibited|never/i)
          if (row.cells[0]) roles.push({ name: row.cells[0].replace(/\*/g, ''), path, cannot, cell: cannot >= 0 ? (row.cells[cannot] ?? '') : null })
        }
      }
      if (rules.size + roles.length === 0) return notRun('this workspace declares no permission rules')

      // A prohibition, judged on the rule's own words. Same vocabulary as before; the
      // difference is entirely in what it is allowed to read.
      const prohibits = (t) => /\b(must not|may not|cannot|can not|shall not|is not able to|is refused|is denied|never)\b/i.test(t)
      const denials = [...rules.values()].filter((r) => prohibits(r.text))

      // A deny test is an acceptance criterion or a test that CITES one of those denial rules.
      // Requiring the citation rather than sniffing the test's prose is what makes this
      // decidable: AC-005 is a deny test because it is the test OF a denial, and it says so.
      const denyTests = new Map(denials.map((r) => [r.id, []]))
      for (const [path, text] of md(ws)) {
        for (const row of tableRows(text)) {
          const id = firstCellId(row)
          if (!id || !/^(AC|[A-Z]*TEST)-\d{3}$/.test(id)) continue
          for (const cited of new Set(row.cells.slice(1).join(' ').match(/\bREQ-R-\d{3}\b/g) ?? []))
            denyTests.get(cited)?.push(`${id} in ${path}`)
        }
      }

      const roleWithNothingRefused = roles.filter((r) => r.cannot >= 0 && r.cell === '')
      const untested = denials.filter((r) => denyTests.get(r.id).length === 0)
      const problems = [
        // The whole point, stated as a failure rather than assumed: allow-only rules pass
        // identically on a system with no enforcement at all.
        ...(denials.length === 0 && !roles.some((r) => r.cell)
          ? [`${rules.size + roles.length} permission rule(s) and not one denial — an allow-only rule set passes on a system with no enforcement`]
          : []),
        ...untested.map((r) => `${r.id} is a denial with no acceptance criterion or test citing it`),
        ...roleWithNothingRefused.map((r) => `the ${r.name} role is declared with nothing it cannot do`),
      ]
      return problems.length === 0
        ? passed([`${rules.size} rule(s) and ${roles.length} role(s); ${denials.length} denial(s), each with a test that cites it`])
        : failed(problems.slice(0, 5))
    },
  },
  9: {
    name: 'every driving characteristic has at least one fitness function',
    run(ws) {
      // ASK THE FILE THAT DECLARES THEM, not the whole workspace. This used to count any table
      // row anywhere beginning with a quality word — so `| Performance | The dashboard must
      // load within three seconds |`, an EXAMPLE row the requirements blueprint keeps as
      // content, was counted as a declared driver. The check then failed a workspace that had
      // not reached the drivers file yet, which is a false positive on correct work (BUG-018).
      //
      // A control that cries wolf is a control that gets switched off. It is the same lesson
      // as BUG-006, one layer up.
      const declaring = Object.entries(ws).find(([p]) => p.endsWith('driving-characteristics.md'))
      if (!declaring) return notRun('no driving characteristics file exists yet — it is written in Round 4')

      // AND ASK IT PER DRIVER. The second half of the same lesson: having found the file that
      // declares them, the check then tested `/FF-\d{3}/` against the WHOLE WORKSPACE — so one
      // identifier in one file, anywhere, proved that every driver was governed. Three drivers
      // with the fitness-function cell filled for the first one only passed, reporting
      // "3 drivers declared". The evidence is per row and sits in the row; nothing read it.
      //
      // This is BUG-013's shape exactly — the defect check 6 records forty lines above, where
      // the existence of one `Q-###` anywhere exempted every `[TODO]` in the workspace.
      const [, text] = declaring
      const drivers = tableRows(text).filter((r) => /^[123]$/.test(r.cells[0] ?? '') && (r.cells[1] ?? '') !== '')
      if (drivers.length === 0) return notRun('the driving characteristics file exists but declares no driver')

      // The column if the table names one, the whole row if it does not — a driver that names
      // its fitness function somewhere in its row is governed either way, and a table shaped
      // differently from the blueprint must not read as a violation.
      const column = columnNamed(drivers[0].header, /fitness function/i)
      const ungoverned = drivers.filter(
        (d) => !/\bFF-\d{3}\b/.test(column >= 0 ? (d.cells[column] ?? '') : d.cells.join(' '))
      )
      return ungoverned.length === 0
        ? passed([`${drivers.length} drivers declared, each naming its own fitness function`])
        : failed(
            ungoverned.map(
              (d) => `driver ${d.cells[0]} (${d.cells[1].replace(/\*/g, '').slice(0, 40)}) names no fitness function`
            )
          )
    },
  },
  10: {
    name: 'the entry point is under 100 lines and its paths resolve',
    run(ws) {
      const entry = Object.keys(ws).find((p) => /(^|\/)CLAUDE\.md$/.test(p))
      // THE ONE NOT-RUN THAT DOES NOT BLOCK WRITING. The entry point is the last file a run
      // writes, and this walk runs before it — so this state is the ordinary first-pass
      // outcome, not a fault. Reported with a reason code so `mayWriteEntryPoint` can tell it
      // apart from every other not-run, which does block. See the note above `validate()`.
      if (!entry) return notRun('no entry-point file exists yet — it is written last', AWAITING_ENTRY_POINT)
      const text = ws[entry]
      const lines = text.split('\n').length
      // BOTH FORMS A MAP USES. Reading only `](x.md)` meant an entry point whose Start-here
      // table lists backticked bare paths — the house style of the library's own README —
      // reported "0 paths resolve" as a pass. A check that resolved nothing said so and was
      // counted green.
      //
      // A back-link names a BLUEPRINT, not a file in this workspace (fill.mjs), so
      // `blueprints/…` is not a path this check can resolve and is not one it should try to.
      const paths = [
        ...[...text.matchAll(/\]\(([^)]+\.md)\)/g)].map((m) => m[1]),
        ...[...text.matchAll(/`([^`\s]+\.md)`/g)].map((m) => m[1]),
      ]
        .map((p) => p.replace(/^\.\//, ''))
        .filter((p) => !p.startsWith('blueprints/'))
      const broken = [...new Set(paths.filter((p) => !Object.keys(ws).some((k) => k.endsWith(p))))]
      const problems = [
        ...(lines >= 100 ? [`${entry} is ${lines} lines; the limit is 100`] : []),
        ...broken.slice(0, 4).map((p) => `${entry} links to ${p}, which does not exist`),
        // A navigation surface that navigates nowhere. Scoped to the section that promises
        // one, so an entry point still being assembled is not accused of it.
        ...(/^#{1,6}\s*Start here|\bStart here\b/im.test(text) && paths.length === 0
          ? [`${entry} has a Start here section and resolves no path — the map names no destination`]
          : []),
      ]
      return problems.length === 0 ? passed([`${lines} lines, ${paths.length} paths resolve`]) : failed(problems)
    },
  },
  11: {
    name: 'no generated file contains application source code',
    run(ws) {
      const code = md(ws).filter(([, t]) =>
        /```(js|ts|python|java|go|rb|php|cs|rust|jsx|tsx)\b/i.test(t) ||
        // KEYWORDS NEED A SHAPE, NOT JUST A SPELLING. This used to be a bare alternation, so
        // `def` matched the start of "definition", `class` matched "classification", and
        // `function` matched "functionality" — on any line where the previous line happened to
        // wrap before one of those words.
        //
        // The fitness-functions blueprint ends a wrapped bullet with "definition, not the
        // function.", so EVERY workspace that filled it was reported as containing application
        // source code (BUG-020). A false positive on BR-001, the defining boundary of this
        // product, is the worst possible place for one: the response to "this spec contains
        // code" is to go and delete prose.
        //
        // Each keyword now has to be followed by what it is followed by in real code.
        /^\s*(function\s+\w+\s*\(|class\s+\w+[\s({:]|def\s+\w+\s*\(|import\s+[\w{*].*\sfrom\s|const\s+\w+\s*=\s*\()/m.test(t.replace(/```[\s\S]*?```/g, '')))
      return code.length === 0
        ? passed()
        : failed(code.slice(0, 5).map(([p]) => `${p} appears to contain application source code (BR-001)`))
    },
  },
  12: {
    name: 'no credential appears, and .gitignore excludes .env',
    run(ws) {
      const leaks = Object.entries(ws).filter(([, t]) =>
        /(sk-[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/.test(t))
      if (leaks.length) return failed(leaks.map(([p]) => `${p} contains something shaped like a credential`))
      const ignore = Object.entries(ws).find(([p]) => p.endsWith('.gitignore'))
      if (!ignore) return notRun('this workspace has no .gitignore, so the exclusion could not be checked')
      return /^\.env$/m.test(ignore[1]) ? passed() : failed(['.gitignore does not exclude .env'])
    },
  },
  13: {
    name: 'every blueprint was filled, or recorded as skipped with a reason',
    // Added by TASK-022, for the gap nothing else caught: a blueprint the intake never
    // reached produces no file, no mismatch, and no complaint.
    //
    // `library` is either the manifest's blueprint paths or the manifest TEXT. Given the text,
    // `manifestBlueprints()` reads the one table that carries checksums — which is the only
    // way to tell a blueprint from an entry in the manifest's "Deliberately not packaged"
    // table, and a caller that scrapes both hands this check six paths no run can ever fill.
    run(ws, library = null) {
      if (!library) return notRun('the blueprint manifest was not supplied, so coverage could not be derived')
      const blueprints = typeof library === 'string' ? manifestBlueprints(library) : library
      if (blueprints.length === 0)
        return notRun('the blueprint manifest lists no blueprint, so coverage could not be derived')
      const produced = new Set(Object.values(ws).map((t) => blueprintOf(t)).filter(Boolean))

      // A skip counts ONLY when it carries a reason. A skip with no reason is a silent skip
      // wearing a label, and it must not satisfy this check.
      //
      // AND IT IS RESOLVED AGAINST THE MANIFEST, NOT COMPARED TO IT. The recorded name was
      // matched against the manifest path with `===`, while the instruction that teaches the
      // skip row shows a bare filename — `| 2026-08-04 | Skipped | frontend-component-spec.md |
      // API-only product |` — so a skip recorded exactly as documented matched nothing and the
      // blueprint stayed uncovered. Every API-only product failed check 13 for doing what it
      // was shown. Both forms now resolve; a basename that names two blueprints is reported as
      // ambiguous rather than resolved to whichever came first.
      const recorded = [...all(ws).matchAll(/^\|[^|]*\|\s*Skipped\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/gm)]
        .filter((m) => m[2].trim().length > 3)
        .map((m) => m[1].trim().replace(/^`|`$/g, ''))
      const skipped = new Set()
      const unresolved = []
      for (const name of recorded) {
        const matches = blueprints.filter((b) => b === name || b.endsWith(`/${name}`))
        if (matches.length === 1) skipped.add(matches[0])
        else if (matches.length > 1)
          unresolved.push(`the skip named "${name}" matches ${matches.length} blueprints — record the full manifest path`)
        else unresolved.push(`the skip named "${name}" matches no blueprint in the manifest`)
      }

      // The manifest's own permanent exclusion, named rather than silent. `appendix-index.md`
      // is template scaffolding: never generated, never skipped, not a per-run decision at all
      // (coverage.md). It is stated in the report so the exclusion is visible to whoever reads
      // the coverage claim — a check with a quiet exemption is a check nobody can audit.
      const excluded = blueprints.filter((b) => b === PERMANENT_EXCLUSION)
      const uncovered = blueprints.filter((b) => !produced.has(b) && !skipped.has(b) && b !== PERMANENT_EXCLUSION)
      const note = excluded.map((b) => `${b} is a permanent manifest exclusion — never generated, never skipped`)
      return uncovered.length === 0 && unresolved.length === 0
        ? passed([`${produced.size} filled, ${skipped.size} skipped with a reason`, ...note])
        : failed([
            ...(uncovered.length ? [`${uncovered.length} blueprint(s) neither filled nor skipped:`] : []),
            // Named by path: a count says something is missing without saying what.
            ...uncovered.slice(0, 8).map((b) => `  ${b}`),
            ...unresolved,
          ])
    },
  },
}

/**
 * Run the walk. Returns every result plus the counts — and the counts are the point:
 * "all passed" asserted from an empty failure list is the exact shape of BR-009's failure.
 *
 * THE WALK RUNS TWICE, AND `mayWriteEntryPoint` IS WHY. Check 10 reads the entry point; the
 * entry point is the last file a run writes; and a not-run check forbids writing anything
 * further. Those three rules are a deadlock — the entry point can never be written, so every
 * clean eight-round interview ended with no map and "This workspace is NOT fully validated".
 *
 * It is broken by ordering, not by leniency. The first walk answers *may the entry point be
 * written?* — every check passed except check 10, which has nothing to read yet. The entry
 * point is then written, and the walk runs again; the second answers *may success be claimed?*
 * and check 10 has something to read. Neither question is ever answered by calling a check
 * that did not run passed. (`instructions/integrity.md` runs its check twice for the same kind
 * of reason, and says so.)
 */
export function validate(workspace, library = null) {
  const results = Object.entries(CHECKS).map(([n, c]) => ({ n: Number(n), name: c.name, ...c.run(workspace, library) }))
  const ran = results.filter((r) => r.state !== 'not-run')
  return {
    results,
    total: results.length,
    ran: ran.length,
    passed: results.filter((r) => r.state === 'passed').length,
    failed: results.filter((r) => r.state === 'failed').length,
    notRun: results.filter((r) => r.state === 'not-run').length,
    /** The only condition under which success may be claimed at all. */
    mayClaimSuccess: ran.length === results.length && results.every((r) => r.state === 'passed'),
    /**
     * The first walk's question. Every check passed, except that check 10 is still waiting for
     * the file this permission is about. ONE not-run state qualifies, and it is the one whose
     * cause is the ordering itself — a missing manifest or an unreadable library still blocks,
     * because a map to a workspace nobody could verify is the thing this rule exists to stop.
     */
    mayWriteEntryPoint: results.every((r) => r.state === 'passed' || r.because === AWAITING_ENTRY_POINT),
  }
}

/** The report line. States the count that RAN — never inferred from an absence of failures. */
export function report(v) {
  if (v.mayClaimSuccess) return `All ${v.total} checks ran; all ${v.total} passed.`
  const parts = [`${v.ran} of ${v.total} checks ran`]
  if (v.failed) parts.push(`${v.failed} failed`)
  if (v.notRun) parts.push(`${v.notRun} could not run`)
  // Said plainly, because it is the one incomplete state with a next step rather than a fault.
  // Without this sentence the honest report of a healthy first walk is indistinguishable from
  // the report of a broken run, and the reader's only visible option is to stop.
  const next = v.mayWriteEntryPoint
    ? ' Check 10 is waiting for the entry point: write it, then run the walk again.'
    : ''
  return `${parts.join('; ')}. This workspace is NOT fully validated.${next}`
}
