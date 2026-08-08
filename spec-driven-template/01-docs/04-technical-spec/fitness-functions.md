# fitness-functions.md — Automated Architecture Governance

> **Purpose:** stop your architecture decisions from decaying silently.
> **When you use it:** one per driving characteristic, wired into the CI gate.
> **Source:** Richards & Ford, *Fundamentals of Software Architecture*, Ch. 6.

> A fitness function is **any mechanism that objectively assesses an architectural
> characteristic**: a test, a metric, a monitor, a CI script, a chaos experiment.
>
> **"High performance" is not a fitness function. A measurable threshold is.**

A test proves the feature does what was asked. A fitness function proves the **system
still has the shape you decided on**. They are different jobs; you need both.

---

## The register

| ID | Guards | Type | Check | Threshold | Runs | On failure |
|---|---|---|---|---|---|---|
| FF-001 | *(characteristic)* | Structural | | | | |
| FF-002 | | Operational | | | | |
| FF-003 | | Security | | | | |
| FF-004 | | Process | | | | |

> **`FF-` identifiers are DEFINED here, and only here.** Downstream files cite them — a task
> names the fitness functions it must satisfy, a CI pipeline names the gates it runs — and a
> citation is the id plus, at most, the characteristic it guards. **Do not restate what the
> function checks or its threshold**; those live in this register, and a second copy is a second
> thing to keep correct.
>
> A run put `FF-001`, `FF-002` and `FF-003` into a task file's test table and into an invented
> CI gate table, each with its own wording of the same check. Nothing was wrong on the day it
> was written and nothing kept the three in step afterwards.
>
> **`Runs` and `On failure` are claims about a gate that has to EXIST.** Writing `CI` here says
> a pipeline runs this check and a merge is blocked when it fails. If there is no pipeline yet —
> and on a new project there usually is not — then write **`Not wired yet`** in `Runs` and name
> the task that will wire it.
>
> These two columns arrived pre-filled with `CI` and `Block merge`. Every workspace inherited
> them, so every register asserted enforcement that nobody had built, and the file that exists
> to stop decisions decaying silently was itself the decoration it warns about. **A fitness
> function written down but not in a gate governs nothing** — say which it is.

**Types**
| Type | Measures | Examples |
|---|---|---|
| **Structural** | Code shape | Dependency cycles, layer rules, cyclomatic complexity |
| **Operational** | Runtime behaviour | p95 latency, throughput, error rate |
| **Security** | Boundaries hold | Isolation, authorization, secret scanning |
| **Process** | Delivery health | Deploy success rate, test-suite duration |

## Rules

- **One per driving characteristic, minimum.** No driver without a fitness function is
  governed — it is only documented.
- It must **fail the build**, not print a warning. A warning is a decoration.
- **Say honestly whether it runs.** The line above describes what a wired fitness function
  does, not what an entry in this table proves. A register whose `Runs` column claims a gate
  the project has not built is a success claim nobody earned — the exact failure this file
  exists to prevent, committed by the file itself.
- Every ADR's **Compliance** field names the fitness function that enforces it.
- Measure **tail percentiles**, never averages.
- If a characteristic cannot be measured, its definition is too vague — go fix the
  definition, not the function.

---

> Blueprint source: this file is new to the template — added from the architecture review.

---

# WORKED EXAMPLE — ProjectBoard

Three drivers → four fitness functions.

| ID | Guards | Type | Check | Threshold | Runs | On failure |
|---|---|---|---|---|---|---|
| FF-001 | Simplicity | Structural | No import cycles between `04-services/`, `03-api/`, `05-data/` | 0 cycles | CI | **Block merge** |
| FF-002 | Simplicity | Structural | Cyclomatic complexity per function | < 5 (waiver requires a comment) | CI | **Block merge** |
| FF-003 | Security | Security | Every task/project query filtered by an accessible project ID | 0 unscoped queries | CI | **Block merge** |
| FF-004 | Performance | Operational | `GET /projects/{id}/tasks` p95 against the 500-task fixture | < 2 s | CI + nightly | **Block merge** |

### FF-003, as actually implemented

```python
# tests/05-executable/integration/test_FF-003_no_unscoped_queries.py
"""Guards: Security driver - no user reads another project's data (ADR-002).

Not a feature test. A structural guarantee: every repository read must be
scoped. Enforced here because a single unscoped query is a data leak, and
it is invisible in a feature test that only ever uses one tenant.
"""
FORBIDDEN = ["Task.query.all(", "Task.query.filter_by(id=", "session.query(Task).get("]

def test_no_unscoped_task_queries():
    for path in source_files("src/05-data", "src/04-services"):
        source = path.read_text()
        for pattern in FORBIDDEN:
            assert pattern not in source, (
                f"{path}: unscoped task query. Every read must be scoped through "
                f"an accessible project_id. See ADR-002 / FF-003."
            )
```

### FF-004, wired into the gate

```bash
# scripts/gate.sh
echo "== fitness functions =="
pytest 03-tests/05-executable -k "FF-" -q          # FF-001..003
python scripts/perf_check.py --p95 2000 --fixture 500-tasks   # FF-004
```

### What the register caught

| Date | FF | Event |
|---|---|---|
| 2026-03-18 | FF-001 | Agent imported `05-data` directly from an API handler. Build failed in 40 s. Without FF-001 this is invisible until the layer boundary is meaningless. |
| 2026-04-03 | FF-004 | Failed at **7.1 s** on the 500-task fixture. Nobody had noticed on dev data. Produced ADR-003 (pagination) + MIG-003 (index). |
| 2026-04-01 | FF-003 | Passed — but BUG-003 (Viewer editing via API) still shipped, because FF-003 guards **reads**, not **writes**. FF-005 was added for write-path authorization. |

> **The honest lesson from that last row:** a fitness function guards exactly what it
> asserts and nothing more. Passing is not proof of safety — it is proof of *one* property.
