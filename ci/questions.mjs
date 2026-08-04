// The question set, parsed.
//
// The round-shape rules in `plugin/instructions/questions.md` are requirements, not style:
// at most four questions, a recommendation marked in words, a reason on every option. This
// reads the shipped module so those rules are checked rather than trusted — and so rounds 2
// to 8 inherit the same checks when they arrive.

import { readFileSync } from 'node:fs'

const QUESTIONS = 'plugin/instructions/questions.md'

export function parseQuestions(file = QUESTIONS) {
  const text = readFileSync(file, 'utf8')
  const questions = []
  let current = null
  let round = 0
  let inFreeText = false
  let freeText = ''

  for (const line of text.split(/\r?\n/)) {
    const roundHeading = line.match(/^#\s+Round\s+(\d+)/)
    if (roundHeading) {
      round = Number(roundHeading[1])
      current = null
      inFreeText = false
      continue
    }
    const heading = line.match(/^##\s+Q(\d+)\.\s+(.+?)\s*$/)
    if (heading) {
      current = {
        round,
        number: Number(heading[1]),
        title: heading[2],
        options: [],
        // Some questions' options come from what the developer already said, so they cannot
        // be listed here. The presentation rule still binds — recommended first, with reasons.
        derived: /\bderived\b/i.test(heading[2]),
        body: '',
      }
      questions.push(current)
      inFreeText = false
      continue
    }
    if (/^##\s+The free-text question/.test(line)) {
      current = null
      inFreeText = true
      continue
    }
    if (/^##\s/.test(line)) {
      current = null
      inFreeText = false
      continue
    }
    if (inFreeText) freeText += `${line}\n`
    if (current) {
      current.body += `${line}\n`
      // The marker often sits in the body rather than the heading, because the sentence
      // explaining WHAT it is derived from has to go somewhere.
      if (/^\*\*Derived\*\*/i.test(line)) current.derived = true
      // - **Label** — reason
      const option = line.match(/^-\s+\*\*(.+?)\*\*\s*—\s*(.+?)\s*$/)
      if (option) {
        const reason = option[2]
        current.options.push({
          label: option[1],
          // "(Recommended)" or a qualified form like "(Recommended if unsure)" — the
          // qualification is often the most useful part, so it must not disqualify the mark.
          reason: reason.replace(/^\*\(Recommended[^)]*\)\*\s*/, '').trim(),
          recommended: /\*\(Recommended[^)]*\)\*/.test(reason),
        })
      }
    }
  }
  const rounds = [...new Set(questions.map((q) => q.round))].sort((a, b) => a - b)
  return {
    questions,
    rounds,
    inRound: (n) => questions.filter((q) => q.round === n),
    freeText: freeText.trim(),
    text,
  }
}
