# spec-prod

A production-grade **spec-driven AI engineering blueprint** — a reusable workspace that
turns a rough product idea into a complete, traceable specification a coding agent can
build from without guessing.

```
Read spec-driven-template/MASTER-PROMPT.md and begin.
```

That one line, given to any AI assistant in this folder, runs an 8-round interview and
generates a filled specification workspace for your app.

---

## What is here

| Path | What it is |
|---|---|
| **`spec-driven-template/MASTER-PROMPT.md`** | The intake. Hand it to an AI assistant; it interviews you and builds the workspace. |
| **`spec-driven-template/`** | The blueprint — 87 files across 7 numbered stages, each with a template **and** a filled worked example. |
| `spec-driven-template/steps.md` | The ten-step workflow the whole thing implements. |

## The structure it produces

```
<your-project>/
├── CLAUDE.md          ← entry point: written last, read first
├── 01-docs/           intent · requirements · product spec · technical spec
│                      architecture · API & data · security & reliability
│                      traceability · change control · reference
├── 02-tasks/          planning · task files · scope control
├── 03-tests/          plan · functional · non-functional · failure · executable
├── 04-src/            application code
├── 05-review/         logs · checklists · version control · debugging
├── 06-agent/          AGENT.md · context pack · prompt library · handoffs
└── 07-ops/            deployment · monitoring · maintenance · release
```

## Where it comes from

The spine is *Spec-Driven AI Engineering* by Gem Iroko — 30 chapters and Appendices A–S,
covered in full.

Eight files marked ⭐ come from outside that book, added after auditing the blueprint
against six architecture texts (Richards & Ford, Ousterhout, Khononov, Hohpe,
*The Hard Parts*, and the GoF pattern catalogues) and against the thirteen operational
layers a production system actually has:

| ⭐ | Closes |
|---|---|
| `subdomain-map` | Where effort goes — core vs. generic vs. supporting, build vs. buy |
| `driving-characteristics` | The **three** qualities that shape the structure |
| `fitness-functions` | How decisions stay enforced after they are written |
| `runtime-and-scale` | Rate limiting · cache & CDN · scaling · cost ceiling |
| `ai-boundary-spec` | Model replaceability, budget, guardrails, human-in-the-loop |
| `ai-evals` | Golden set, scorers, quality floor — *how you know a change helped* |
| `risk-storming` | Impact × likelihood, scored alone before consensus |
| `backup-and-recovery` | Availability target, RTO/RPO, and a **restore-test log** |

## Design principles it holds itself to

- **Depth scales with subdomain type.** A supporting feature gets one page; a core one
  gets the full chain. Equal depth everywhere is what turns process into paperwork.
- **"Not needed" is a first-class answer** — with a reason and a revisit trigger.
  An explicit *no* is a decision; silence is an accident.
- **Every worked example includes the failures**, because those teach more than the
  successes.

## Status

Internally verified: every link resolves, IDs cross-reference, the traceability matrix
resolves. **Not yet run end-to-end on a real project** — the worked examples throughout
are constructed for illustration, not measured from a live system.

## Note on sources

The books this was built from are **not** included in this repository. They are
copyrighted and not redistributable. See `.gitignore`.

## License

The blueprint and master prompt in this repository are original work.
Add a license file before reuse by others.
