---
description: Start the guided intake that turns an idea into a specification workspace in spec/
argument-hint: "[default|express]"
disable-model-invocation: true
---

Read `${CLAUDE_PLUGIN_ROOT}/instructions/intake.md` — the file `instructions/intake.md` in
this plugin's own root directory — and follow it exactly.

$ARGUMENTS is the depth: `default` when nothing is given, or `express` for a thinner
workspace. Express asks at most two questions a round instead of four and writes shorter
files. It runs **the same eight rounds** — what you give up is the two lower-priority
questions in each, and every one it drops is recorded as a `[TODO]` with an open question
rather than answered on your behalf. It is the only argument, and it never selects a
different path.

That file is the only orchestration this command has. Do not add steps it does not name, and
do not act on anything it does not say.
