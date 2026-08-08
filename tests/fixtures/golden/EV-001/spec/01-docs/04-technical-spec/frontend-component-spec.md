# Frontend Component Specification

> Source: Ch. 7 §7.4 + Ch. 27 §27.6.
> Tells the agent what components to create, what data they receive, what states they must
> handle, and how they behave when filters or permissions change.

---

## Component table

| Component | Purpose | Data needed | States | Rules |
|---|---|---|---|---|
| `AppShell` | Frame: navigation, current account. | current account | loading, ready, unauthorized | Render nothing until sign-in is confirmed. |
| `RecipeForm` | Save a recipe with its ingredient lines. | none beyond input | idle, validating, saving, error | Keeps every typed value on error (REQ-NF-003). At least one ingredient line before save. |
| `RecipeSearch` | Search saved recipes. | query, matching recipes | loading, success, empty, error | Empty state explains how to save a first recipe — never reads as a failure. |
| `WeekPlanner` | Choose which meals to cook this week. | saved recipes, current weekly plan | loading, success, empty, error | Adding a meal updates the week immediately — this screen carries the "speed of the core task" priority. |
| `ShoppingListView` | Show the list generated from the week. | shopping list with items | loading, success, empty, error | Generated in one action from the plan (REQ-F-003). How duplicate ingredients render is open (Q-011). |

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

The core screen's component, filled:

```
Component name:       ShoppingListView
Purpose:              Show the one shopping list generated from the weekly plan, and let
                      the account holder generate or regenerate it.
Supports requirement: REQ-F-003, AC-003, AC-005

Props / inputs:
  - planId: string — required — the weekly plan the list belongs to

Internal state:
  - status: idle | generating | success | error
  - list { id, items[] } or null

States to handle:
  - Loading:           progress indicator on the Generate action; never a blank frame
  - Success:           the list, one item per line, in a stable order
  - Empty:             "This week has no planned meals yet — add meals to generate a
                       list." Never rendered as an error or as an empty white page
  - Error:             "The list could not be generated. Your plan is unchanged." + Retry
  - Disabled:          Generate disabled while the plan has no meals or a run is in flight
  - Permission denied: another account's plan is a safe not-found; nothing is revealed

User actions:         generate, regenerate, review items

Validation shown inline:
  - none — the action carries no fields; failures surface as the error state

Accessibility notes:
  - Labels: the Generate control is a real, visibly labelled button
  - Keyboard navigation: the whole flow — generate, then read the list — works with
    keyboard alone (FF-003)
  - Error announcement: generation failure is announced to screen readers, not only shown
    as a colour change

Out of scope for this component:
  - Editing recipes, editing the plan, sharing or exporting the list
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
| Screens or pages | Sign-in, recipe library (with search), recipe form, week planner, shopping list. |
| Components | The five components in the table above. |
| Form fields | Recipe title (required), ingredient lines (name required; quantity and unit optional). |
| UI states | Loading, empty, error, success, disabled, permission-denied — per the five states rule. |
| User actions | Save recipe, search, add meal to week, generate list, retry after failure. |
| Accessibility basics | Visible labels on every field, keyboard-completable core flow, errors announced — accessibility is a driving characteristic (FF-003). |

---

> **Security rule (Ch. 27 §27.7):** hiding a button in the frontend is helpful for the
> user interface, but it is **not security by itself**. Enforce permissions on the server.

> Blueprint: blueprints/01-docs/04-technical-spec/frontend-component-spec.md
