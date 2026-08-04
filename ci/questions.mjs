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
  let inFreeText = false
  let freeText = ''

  for (const line of text.split(/\r?\n/)) {
    const heading = line.match(/^##\s+Q(\d+)\.\s+(.+?)\s*$/)
    if (heading) {
      current = { number: Number(heading[1]), title: heading[2], options: [] }
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
      // - **Label** — reason
      const option = line.match(/^-\s+\*\*(.+?)\*\*\s*—\s*(.+?)\s*$/)
      if (option) {
        const reason = option[2]
        current.options.push({
          label: option[1],
          reason: reason.replace(/^\*\(Recommended\)\*\s*/, '').trim(),
          recommended: /\*\(Recommended\)\*/.test(reason),
        })
      }
    }
  }
  return { questions, freeText: freeText.trim(), text }
}
