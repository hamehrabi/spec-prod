// The answer record — the input half of a golden pair, made machine-readable.
//
// WHY THIS IS PARSED AND NOT PASSED THROUGH. The obvious runner hands the answer file to the
// host verbatim and lets it read the tables itself. That file is also a document ABOUT the
// fixture: it names TASK-016, GOLD-001, "the input half of the pair", and which rounds are
// accepted. Feed it whole to a run and the workspace can come back carrying the harness's own
// vocabulary as though the developer had said it — which is BR-002 exactly, and it would be
// this harness, not the kit, that caused it.
//
// So the parser takes only the two things a developer actually supplies: the free-text problem
// statement, and one answer per question. Everything else in that file is commentary for
// people, and stops here.
//
// A QUESTION RECORDED AS "NOT ASKED" IS NOT AN ANSWER. It is carried through as `asked: false`
// and reaches the run as an instruction to leave it unanswered. Dropping it silently would
// hand the model a shorter list and let it decide what happened to the rest — and the whole
// claim express makes is that it asks less without assuming more (depth.md).

/** `**Depth:** \`express\` (two per round)` -> 'express'. Absent -> 'default', the kit's own default. */
const depthOf = (text) => (/^\*\*Depth:\*\*\s*`(express|default)`/m.exec(text) ?? [, 'default'])[1]

/** `**Project:** Pantry — …` -> the sentence after the label. */
const projectOf = (text) => (/^\*\*Project:\*\*\s*(.+?)\s*$/m.exec(text) ?? [, null])[1]

/**
 * The free-text problem statement, in the developer's own words.
 *
 * Taken from the blockquote under its own heading. It is the only part of a run grounded in
 * the developer's problem rather than in an option list, so it is the one thing here that must
 * survive verbatim — quote markers stripped, wrapping undone, nothing else touched.
 */
export function problemStatement(text) {
  const section = /^##\s+The free-text problem statement\s*$([\s\S]*?)(?=^##\s|$(?![\s\S]))/m.exec(text)
  if (!section) return null
  // The heading's own explanatory blockquote comes first and is separated from the developer's
  // words by a `**Round N:**` label. Take the LAST quoted block, never the first.
  const quotes = [...section[1].matchAll(/(?:^>.*(?:\r?\n|$))+/gm)].map((m) => m[0])
  if (!quotes.length) return null
  return quotes[quotes.length - 1]
    .split(/\r?\n/)
    .map((l) => l.replace(/^>\s?/, ''))
    .join('\n')
    .replace(/\s+/g, ' ')
    .trim()
}

const NOT_ASKED = /\bnot asked\b/i

/**
 * One round's answers, from its `| Q | Question | Answer |` table.
 *
 * The header row and the `|---|` rule are dropped by requiring the first cell to look like a
 * question number; matching every pipe row instead would silently turn `| Q | Question |` into
 * an answered question called "Question".
 */
function roundAnswers(body) {
  const rows = [...body.matchAll(/^\|\s*(Q\d+)\s*\|([^|]*)\|([^|]*)\|\s*$/gm)]
  return rows.map((m) => {
    const answer = m[3].trim()
    return {
      q: m[1],
      question: clean(m[2]),
      // A dropped question carries no answer at all. `asked: false` and an empty string are
      // different facts, and collapsing them is how a default gets written for a developer
      // who was never asked (BR-003).
      asked: !NOT_ASKED.test(answer),
      answer: NOT_ASKED.test(answer) ? null : clean(answer),
    }
  })
}

/** Table cells carry emphasis for people to read. A run should receive the words, not the markup. */
const clean = (cell) =>
  cell
    .replace(/\*\*|`|\*/g, '')
    .replace(/\s*·\s*/g, ' · ')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Parse an answer record.
 *
 * @returns { project, depth, problem, rounds: [{ n, title, answers }] }
 *          `rounds` holds only rounds the record actually answers — a heading that says the
 *          round was not run produces no entry, because a round with no answers is a round
 *          that did not happen, not a round answered with nothing.
 */
export function parseAnswers(text) {
  const rounds = []
  for (const m of text.matchAll(/^##\s+Round\s+(\d+)\s*[—-]\s*(.+?)\s*$([\s\S]*?)(?=^##\s|$(?![\s\S]))/gm)) {
    const answers = roundAnswers(m[3])
    if (answers.length) rounds.push({ n: Number(m[1]), title: clean(m[2]), answers })
  }
  return {
    project: projectOf(text),
    depth: depthOf(text),
    problem: problemStatement(text),
    rounds: rounds.sort((a, b) => a.n - b.n),
  }
}

/**
 * What the developer would have typed, supplied ahead of being asked.
 *
 * IT SAYS NOTHING ABOUT HOW TO RUN THE INTAKE. That is the command's job, and the command is
 * what a developer invokes. An earlier version of this briefing opened with "follow the
 * plugin's own instructions/intake.md exactly" — and the run spent its first minutes globbing
 * the filesystem for that file, including outside the repository, because a plugin loaded as a
 * plugin does not put its instructions where a search will find them. A harness that tells the
 * model to go and read the kit is not running the kit; it is running a different program that
 * happens to read the same files, and a green result from it would mean nothing.
 *
 * COMPOSED HERE, NOT IN THE DRIVER, so the one place that decides what a run is told is the one
 * place that knows what the developer said. Everything below came out of the answer record, and
 * nothing in it names this harness, the fixture, or the task that built either.
 *
 * @param record   from `parseAnswers`
 * @param through  the last round to run. The developer accepts each gate up to it and then
 *                 closes the terminal — which intake.md 2e supports as a normal ending, and
 *                 which is the only honest way to reproduce a fixture that stops part-way.
 */
export function briefing(record, through = Math.max(0, ...record.rounds.map((r) => r.n))) {
  const rounds = record.rounds.filter((r) => r.n <= through)
  const lines = [
    'The developer running this interview answered its questions in advance and is not at the',
    'terminal to be asked again. Their answers are below. Use each one where the interview asks',
    'for it, and use it verbatim.',
    '',
    'Where an answer is recorded as NOT ASKED, that question was dropped at this depth. Leave it',
    'unanswered and record it the way the kit requires. Do not answer it from the other answers,',
    'and do not answer it from what would be reasonable.',
    '',
    `At each round gate their response is: accept.`,
    `After Round ${through} is accepted and its row is written, they close the terminal.`,
    `End there. Do not begin Round ${through + 1}.`,
    '',
    '--- Their answers ---',
    '',
  ]
  if (record.problem) lines.push('Their problem, in their own words:', '', record.problem, '')
  if (!rounds.length) lines.push('(none — this record answers no round in range)', '')
  for (const r of rounds) {
    // The round NUMBER only. A round's title belongs to questions.md, and this record's copy of
    // it is a label someone wrote for people to read — EV-001's Round 4 is titled "product shape
    // *(incomplete)*". Echo that back at a run and the harness's own bookkeeping becomes a
    // heading in the developer's specification (BR-002).
    lines.push(`Round ${r.n}`)
    for (const a of r.answers) {
      lines.push(a.asked ? `  ${a.q}. ${a.question} -> ${a.answer}` : `  ${a.q}. ${a.question} -> NOT ASKED`)
    }
    lines.push('')
  }
  return lines.join('\n')
}
