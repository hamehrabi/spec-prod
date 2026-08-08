# Frontend Component Specification

> Source: Ch. 7 §7.4 + Ch. 27 §27.6.
> Tells the agent what components to create, what data they receive, what states they must
> handle, and how they behave when filters or permissions change.

---

## Component table

| Component | Purpose | Data needed | States | Rules |
|---|---|---|---|---|
| `AppShell` | Frame: navigation, current cook, sign-out. | current account | loading, ready, unauthorized | Do not show content until the account is confirmed; the UI never enforces access on its own. |
| `RecipeList` | Shows the cook's saved recipes with a search box. | recipe list, search term | loading, success, empty, error | Empty state says "No recipes yet", never renders as a broken page. |
| `RecipeForm` | Save or edit a recipe with a title and ingredient lines. | recipe (for edit), draft input | idle, validating, saving, success, error | Keeps typed values on error (`REQ-NF-003`); at least one ingredient line required. |
| `WeekPlanner` | Assign saved recipes to the days of a week. | week, saved recipes | loading, ready, empty, error | A planned meal must reference a recipe the account owns (BR-003). |
| `ShoppingListView` | The single list generated from a week, with tick-off. | generated list | loading, success, empty, error | Empty week shows an empty list with a message, not an error (AC-003). |

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

Filled in for the recipe form (kept short at express depth):

```
Component name:       RecipeForm
Purpose:              Let the signed-in cook save or edit a recipe with a title and ingredient lines.
Supports requirement: REQ-F-001, AC-001

Props / inputs:
  - recipe: Recipe|null — optional — present when editing
  - onSaved: fn         — required — called with the saved recipe

Internal state:
  - values { title, ingredientLines[] }
  - status: idle | validating | saving | error

States to handle:
  - Loading:           save button shows a spinner and is disabled
  - Success:           the recipe appears in the list; the form clears or closes
  - Empty:             n/a (form, not a data view)
  - Error:             inline message under the offending field; ALL typed values kept (REQ-NF-003)
  - Disabled:          save disabled while the title is empty or a save is in flight
  - Permission denied: only the owner reaches their own recipes; the server also enforces it

User actions:         type title, add/remove ingredient lines, save, cancel

Validation shown inline:
  - Title required, 1-120 characters
  - At least one ingredient line

Accessibility notes:
  - Labels:            every field has a visible <label>, not a placeholder-only label
  - Keyboard navigation: the form is completable with the keyboard alone (REQ-NF-006)
  - Error announcement: error text is tied to the field and announced on submit

Out of scope for this component:
  - Photos of finished dishes (handled elsewhere), import from other apps, sharing
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

Filled in for the core `ShoppingListView`:

| State | What the user sees |
|---|---|
| Loading | A short progress indicator while the list is generated; no layout jump when it arrives. |
| Success | One list, grouped by the week's meals; each item can be ticked off. |
| **Empty** | "This week has no planned meals yet, so the list is empty." — plus a link to the planner (AC-003). |
| **Error** | "We could not generate your list right now. Please try again." + Retry. No stack trace. |
| **Permission denied** | A week the account does not own is not reachable; a deep link returns the safe not-found. |

---

## Frontend requirement areas (Ch. 7 §7.4)

| Area | Specify |
|---|---|
| Screens or pages | Sign-in, recipe list/search, recipe form, week planner, shopping list. |
| Components | Navigation, list, form, search bar, list item with a tick control. |
| Form fields | Recipe title (required), ingredient lines (at least one), planned-meal day. |
| UI states | Loading, empty, error, success, disabled, permission-denied. |
| User actions | Save, edit, delete, search, plan, generate list, tick off, retry. |
| Accessibility basics | Readable labels, keyboard-friendly navigation, clear error messages (`REQ-NF-006`). |

> **Security rule (Ch. 27 §27.7):** hiding a button in the frontend is helpful for the
> user interface, but it is **not security by itself**. Enforce permissions on the server.

---

> Blueprint: blueprints/01-docs/04-technical-spec/frontend-component-spec.md
