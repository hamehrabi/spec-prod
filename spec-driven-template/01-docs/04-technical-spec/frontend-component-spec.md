# Frontend Component Specification

> Source: Ch. 7 §7.4 + Ch. 27 §27.6.
> Tells the agent what components to create, what data they receive, what states they must
> handle, and how they behave when filters or permissions change.

---

## Component table

| Component | Purpose | Data needed | States | Rules |
|---|---|---|---|---|
| | | | loading, success, empty, error, unauthorized | |
| | | | | |

**Example (Ch. 27 §27.6)**

| Component | Purpose | Data needed | States | Rules |
|---|---|---|---|---|
| `DashboardShell` | Page frame: navigation, title, tenant selector. | current user, tenant, route | loading, ready, unauthorized | Do not show content until tenant access is confirmed. |
| `FilterBar` | Date, feature, plan, role filters. | available filters, current filter state | ready, validating | Changing filters refreshes all dependent views. |
| `KpiCardGrid` | Shows summary metrics. | summary metrics | loading, success, empty, error | Cards must explain what each metric means. |
| `TrendChart` | Time-series metrics. | daily metric points | loading, success, empty, error | Empty charts must not appear as zero performance. |
| `ReportTable` | Lists saved reports. | report list | loading, success, empty, error | Only show reports visible to the current role. |
| `ExportPanel` | Queues and tracks exports. | export job status | idle, queued, ready, failed | Export button only appears for permitted roles. |

---

## Per-component template

```
Component name:
Purpose:
Supports requirement: REQ-###

Props / inputs:
  - name: type — required/optional — meaning

Internal state:

States to handle:
  - Loading:            [what the user sees]
  - Success:            [what the user sees]
  - Empty:              [what the user sees — must not look like an error or a zero]
  - Error:              [safe message + recovery action]
  - Disabled:           [when and why]
  - Permission denied:  [what is hidden vs. what is explained]

User actions:

Validation shown inline:

Accessibility notes:
  - Labels:
  - Keyboard navigation:
  - Error announcement:

Out of scope for this component:
```

---

## The five states rule

Every data-bound component must handle **all five**. Missing states are where shallow
AI-generated UIs fail (Ch. 27 §27.3).

| State | Requirement |
|---|---|
| Loading | Show progress; never a blank frame. |
| Success | Render the data. |
| **Empty** | Explain *why* it is empty and how data appears. Never render an empty result as a zero value. |
| **Error** | Safe message + retry option. Never a stack trace. |
| **Permission denied** | Hide or disable; do not reveal protected resource details. |

---

## Frontend requirement areas (Ch. 7 §7.4)

| Area | Specify |
|---|---|
| Screens or pages | Dashboard, login, settings, list view, detail view, form page. |
| Components | Navigation, table, card, modal, form, search bar, filter, status badge. |
| Form fields | Required, optional, input type, placeholder, validation rule. |
| UI states | Loading, empty, error, success, disabled, permission-denied. |
| User actions | Create, edit, delete, save, cancel, search, filter, export, retry. |
| Accessibility basics | Readable labels, keyboard-friendly navigation, clear error messages. |

---

## Prompt — generate components from the spec (Ch. 27 §27.6)

```
Use the dashboard requirements, API specification, and RBAC rules below.
Create a frontend component plan before writing code.
For each component, include props, state, loading behavior, empty state, error state, and
accessibility notes.
Do not invent new metrics, roles, or endpoints.
```

> **Security rule (Ch. 27 §27.7):** hiding a button in the frontend is helpful for the
> user interface, but it is **not security by itself**. Enforce permissions on the server.

---

# WORKED EXAMPLE — ProjectBoard "Create Task" screen

## Component table

| Component | Purpose | Data needed | States | Rules |
|---|---|---|---|---|
| `AppShell` | Frame: nav, project selector, current user. | current user, project list | loading, ready, unauthorized | Do not render content until project access is confirmed. |
| `TaskList` | Shows tasks for the selected project. | paginated task page | loading, success, empty, error | Empty state must say "No tasks yet", never render as zero progress. |
| `CreateTaskForm` | Creates a task in the current project. | project members (for assignee) | idle, validating, saving, success, error | Keeps typed values on error (REQ-NF-003). |
| `StatusBadge` | Shows task status. | status enum | todo, in_progress, done | Only the three ADR-002 values; unknown value renders as "Unknown", not a crash. |
| `OverdueFilter` | Filters to overdue tasks. | filter state | ready, validating | Changing the filter refreshes the list **and** the counts together. |

## Per-component detail — `CreateTaskForm`

```
Component name:       CreateTaskForm
Purpose:              Let a signed-in team member create a task in the current project.
Supports requirement: REQ-F-001, AC-001, AC-003

Props / inputs:
  - projectId: string  — required — the project the task belongs to
  - members: User[]    — required — assignable users, already filtered to this project
  - onCreated: fn      — required — called with the created task

Internal state:
  - values { title, description, dueDate, assigneeId }
  - status: idle | validating | saving | error

States to handle:
  - Loading:           save button shows a spinner and is disabled
  - Success:           form closes, new task appears at the top of the list
  - Empty:             n/a (form, not a data view)
  - Error:             inline message under the offending field; ALL typed values kept
  - Disabled:          save disabled while title is empty or a save is in flight
  - Permission denied: form is not rendered for Viewer; server also rejects (STEST-002)

User actions:         type, select assignee, pick due date, save, cancel

Validation shown inline:
  - Title required, 3-120 characters
  - Due date, if present, must not be in the past (BR-003)
  - Assignee must be a member of this project

Accessibility notes:
  - Every field has a visible <label>, not a placeholder-only label
  - Error text is tied to the field via aria-describedby and announced on submit
  - The form is completable with the keyboard alone

Out of scope for this component:
  - Bulk create, templates, recurring tasks, file attachments
```

## The five states, filled in for `TaskList`

| State | What the user sees |
|---|---|
| Loading | Three skeleton rows; no layout shift when data arrives. |
| Success | Paginated rows, 50 per page (ADR-003). |
| **Empty** | "No tasks in this project yet. Create the first one." — plus the Create button. |
| **Error** | "We could not load tasks right now. Please try again." + Retry. No stack trace. |
| **Permission denied** | The project is not listed at all; deep-linking returns the 403 safe message. |
