# Coverage — every blueprint used, or skipped with a reason

**This exists because of a gap nothing else caught.**

The structural checks verify that a generated file *matches* its blueprint. A blueprint the
intake never reached produces no file, no mismatch and no complaint — so a workspace could
pass every check while missing an entire specification document.

It only became visible when someone asked *"will it use all the templates?"*

---

## The required set is derived, never listed

**The manifest is the authority.** Every entry in `blueprints/MANIFEST.md` is required unless
it is recorded as skipped.

**Never write a list of files into the instructions.** A hardcoded list means adding a
blueprint changes nothing until someone remembers to edit the orchestration — and the whole
point is that it changes something immediately.

### Rounds own directories, not files

Each round owns a set of **directories**. Everything the manifest lists under an owned
directory is that round's responsibility.

| Round | Owns |
|---|---|
| 1 | `01-docs/01-intent/` *(intent, brief)* · the workspace `README.md` |
| 2 | `01-docs/01-intent/` *(constraints, open questions, subdomain map)* |
| 3 | `01-docs/02-requirements/` · `01-docs/06-api-and-data-design/` |
| 4 | `01-docs/03-product-spec/` · `01-docs/04-technical-spec/` |
| 5 | `01-docs/05-architecture/` |
| 6 | `01-docs/07-security-and-reliability/` · `gitignore.md` · `env-example.md` |
| 7 | `02-tasks/` · `03-tests/` |
| 8 | `05-review/` · `06-agent/` · `07-ops/` · `01-docs/08-…10-` · `04-src/` |

**Adding a blueprint inside an owned directory makes it required, with no change to any
instruction.** That is the property this design exists for.

**A blueprint in a directory no round owns is a coverage failure, not an implicit skip.** It
means either the round map has a hole or the blueprint should not ship — and both are findings
worth raising rather than papering over.

---

## Two end states, and only two

Every blueprint finishes a run either **filled** or **skipped with a reason**.

### A skip must carry a reason

**A skip with no reason is a silent skip wearing a label.** The reason is what lets a later
reader tell a decision from an omission.

Record skips as dated rows in the generated `01-docs/09-change-control/spec-change-log.md` —
the same artifact that already holds the stage acceptance rows. **No new file**: a workspace
that grows a file per bookkeeping concern accumulates files nobody reads.

```
| 2026-08-04 | Skipped | frontend-component-spec.md | API-only product; no interface to describe |
| 2026-08-04 | Skipped | ai-boundary-spec.md | No model is called or embedded |
```

### The legitimate skips

| Blueprint | Skipped when |
|---|---|
| `frontend-component-spec.md` | The product has no interface at all — and *"it is API-only"* is written down |
| `ai-boundary-spec.md`, `ai-evals.md` | The product neither calls nor is driven by a model |
| `data-and-integration-spec.md` | There is no external dependency whatsoever |

`appendix-index.md` is **never generated and never skipped**. It is a permanent exclusion in
the manifest — template scaffolding rather than an artifact of anyone's project, so it is not
a per-run decision at all.

### Never auto-skip what the run did not reach

**Not reaching a blueprint is a coverage failure.** It is not a skip, and it must never be
recorded as one.

The distinction is the whole point: a skip is a decision someone made about this product; an
unreached blueprint is the intake quietly producing less than it promised.

---

## Check 13

Compare the manifest against the workspace and the skip record:

> `Check 13 (blueprint coverage): failed. 2 blueprints were neither filled nor skipped:
>  01-docs/04-technical-spec/runtime-and-scale.md, 07-ops/02-monitoring/runbook.md`

**Name every one, by path.** A count alone tells the developer something is missing without
telling them what, and the paths are the only actionable part.

**Silently unused must be zero.** Anything else fails the check and blocks the success claim,
like any other failure.
