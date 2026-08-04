// The fill procedure, made checkable.
//
// `plugin/instructions/fill.md` states these rules for the agent. This file is the same
// rules as functions, so "did step 4 actually finish?" is a decidable question rather than a
// judgement — which is what technical-spec.md §4 demands:
//
//   "the instruction set must never accept that a file LOOKS filled. Step 4 is the one an
//    agent will do partially and believe it did fully."
//
// This is a copy and a set of replacements. It is NOT a templating engine — subdomain-map.md
// names that as the single most likely over-engineering in this project.

/** Step 2. Remove the worked example WHOLE, never edited around (BR-002, ADR-003). */
export function stripWorkedExample(text) {
  const at = text.search(/^# WORKED EXAMPLE/m)
  return at === -1 ? text : text.slice(0, at).replace(/\s*$/, '\n')
}

/**
 * Step 6. The back-link (DD-022).
 *
 * The blueprint's path below `blueprints/` IS the artifact's path below `spec/`, so the
 * back-link is that same path with the library prefix. There is no depth arithmetic to get
 * wrong — the failure mode UTEST-014 was written for cannot occur by construction.
 *
 * It names a blueprint; it is not a filesystem link. The library lives in the plugin cache,
 * whose location is version-stamped and machine-specific, so a relative path from a
 * developer's workspace would point at nothing on every machine but ours.
 */
export const backLink = (relPath) => `> Blueprint: blueprints/${relPath}`

/**
 * The inverse: which blueprint does this generated file claim to come from?
 *
 * Accepts the comment form too (`# Blueprint: …`), because a wrapper artifact cannot carry a
 * Markdown back-link. Reading only the Markdown form made coverage under-count exactly the
 * two files Q-024 went to the trouble of packaging.
 */
export function blueprintOf(text) {
  const m = text.match(/^(?:>|#|\/\/|--)\s*Blueprint: blueprints\/(.+?)\s*$/m)
  return m ? m[1] : null
}

// --- Step 4: the placeholder inventory -------------------------------------------------
//
// Derived by surveying all 79 blueprints, not guessed. The EXCLUSIONS matter as much as the
// inclusions: of 1032 bracket spans in the library, 565 are checkboxes and 136 are markdown
// links. A checker that flagged those would report 701 false positives and be switched off
// within a day — which is how a control becomes decoration.

const RULES = [
  // A bracket span that is not a link, not a checkbox, and not a sanctioned [TODO].
  { kind: 'placeholder', re: /\[(?!TODO[\s:\]])(?![ xX]\])[^\][\n]{1,80}\](?!\()/g },
  // Identifier stubs left unminted: REQ-F-###, ADR-###, SEC-A-###.
  { kind: 'id-stub', re: /\b[A-Z]{2,6}(?:-[A-Z])?-###/g },
  { kind: 'date-stub', re: /YYYY-MM-DD/g },
  // A table row whose cells are all empty — a decision nobody made.
  { kind: 'empty-row', re: /^\|(?:\s*\|){2,}\s*$/gm },
  // A whole line in italics is the blueprint telling you what to write there.
  { kind: 'instructional-italic', re: /^\*(?!\*)[^*\n]{10,}\*\s*$/gm },
  { kind: 'blank-fill', re: /_{4,}/g },
  { kind: 'angle-stub', re: /<[a-z][a-z-]{2,30}>/g },
  { kind: 'prompt-box', re: /^>\s*\*\*(?:Prompt|Ask|Paste)\b/gm },
]

/**
 * Where a match sits decides whether it is a gap or content (BUG-006).
 *
 * A blueprint's illustrative FORMULA is content it intends to keep:
 *
 *   > [Affected user] currently faces [difficulty], which causes [consequence].
 *   **Your problem statement:** A charity's fundraising team currently tracks donors in...
 *
 * The first line is the shape; the second is the answer. Both are correct, and a checker
 * that calls the first one unfilled is wrong about a *correctly filled file* — which is the
 * one kind of false positive that gets a control switched off. Same for `TASK-###.md` inside
 * backticks, which documents a naming pattern rather than waiting to be replaced.
 */
function contextOf(text, index) {
  const lineStart = text.lastIndexOf('\n', index - 1) + 1
  const lineEnd = text.indexOf('\n', index)
  const line = text.slice(lineStart, lineEnd === -1 ? text.length : lineEnd)
  if (/^\s*>/.test(line)) return 'quote'
  const before = line.slice(0, index - lineStart)
  if ((before.match(/`/g) ?? []).length % 2 === 1) return 'code'
  return 'body'
}

/** Every candidate, each tagged with the context that decides how to read it. */
export function placeholders(text) {
  const found = []
  for (const { kind, re } of RULES) {
    for (const m of text.matchAll(re)) {
      const line = text.slice(0, m.index).split('\n').length
      found.push({ kind, text: m[0].trim(), line, context: contextOf(text, m.index) })
    }
  }
  return found.sort((a, b) => a.line - b.line)
}

/**
 * The gaps that mean step 4 did not finish. Empty array means it did.
 *
 * Illustrative matches are reported by `placeholders()` and excluded here rather than
 * discarded — "we saw it and judged it content" is a different claim from "we never looked",
 * and only the first one is honest.
 */
export const unfilled = (text) => placeholders(text).filter((p) => p.context === 'body')

/**
 * A `[TODO: ...]` is the SANCTIONED outcome of step 4 when a fact is unknown (BR-003), not a
 * leftover. It is only correct if a matching Q-### exists (FF-012), so it is reported
 * separately rather than counted as either filled or unfilled.
 */
export const todos = (text) => [...text.matchAll(/\[TODO:\s*([^\]]+)\]/g)].map((m) => m[1].trim())

// --- Step 5: identifier minting ---------------------------------------------------------

/**
 * Sequential, unique, and never reused — including after the item it named is deleted
 * (BR-007). A reused ID silently re-points a test, a task, and a traceability row at
 * something else, and nothing about the workspace looks wrong afterwards.
 *
 * @param used every identifier ever issued for this prefix, including retired ones
 */
export function mint(prefix, used = []) {
  const taken = used
    .filter((id) => id.startsWith(`${prefix}-`))
    .map((id) => Number.parseInt(id.slice(prefix.length + 1), 10))
    .filter(Number.isInteger)
  const next = taken.length === 0 ? 1 : Math.max(...taken) + 1
  return `${prefix}-${String(next).padStart(3, '0')}`
}

// --- Wrapper blueprints (Q-024) ---------------------------------------------------------
//
// Some artifacts a workspace needs are not Markdown — `.gitignore`, `.env.example`. The
// plugin ships Markdown only, so those blueprints CARRY their file rather than being it:
// a declared target, and one fenced block holding the content.
//
// This is not a special case per file. It is one rule for a category, and a blueprint is
// either a wrapper or it is not — decided by whether it declares a target.

/** `> Writes: \`.gitignore\`` → '.gitignore', or null for an ordinary blueprint. */
export const wrapperTarget = (text) => text.match(/^>\s*Writes:\s*`([^`]+)`/m)?.[1] ?? null

/** `> Comment: \`#\`` → the target's comment prefix, so the back-link survives (C2). */
export const wrapperComment = (text) => text.match(/^>\s*Comment:\s*`([^`]+)`/m)?.[1] ?? null

/**
 * The artifact a wrapper produces: the fenced block, plus the back-link as a comment.
 * A .gitignore cannot carry a Markdown back-link, but it can carry a `#` one — and dropping
 * it would make these two files the only unauditable things in the workspace.
 */
export function wrapperArtifact(text, blueprintRelPath) {
  const target = wrapperTarget(text)
  if (!target) return null
  const block = text.match(/^```[\w-]*\r?\n([\s\S]*?)^```/m)
  if (!block) return null
  const comment = wrapperComment(text) ?? '#'
  return {
    target,
    content: `${block[1].replace(/\s*$/, '')}\n\n${comment} Blueprint: blueprints/${blueprintRelPath}\n`,
  }
}

/** Headings, in order — what "the structure matches the blueprint" is checked against. */
export const headings = (text) =>
  [...text.matchAll(/^(#{1,6})\s+(.+?)\s*$/gm)].map((m) => `${m[1]} ${m[2]}`)
