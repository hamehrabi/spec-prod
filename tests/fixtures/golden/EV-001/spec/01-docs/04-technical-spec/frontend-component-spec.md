# Frontend Component Specification

> Source: Ch. 7 §7.4 + Ch. 27 §27.6.
> Tells the agent what components to create, what data they receive, what states they must
> handle, and how they behave when filters or permissions change.

> **Interface priority (Round 4 Q2): speed of the core task.** The plan → shopping-list path
> is the one to keep fast and few-clicks. Accessibility is a driving characteristic (FF-004).

---

## Component table

| Component | Purpose | Data needed | States | Rules |
|---|---|---|---|---|
| `AppShell` | Frame: navigation, current cook, sign-out. | current account | loading, ready, unauthorized | Do not render content until sign-in is confirmed. |
| `RecipeForm` | Save a recipe with ingredient lines. | — | idle, validating, saving, success, error | Keep typed values on error; a recipe needs a title and at least one ingredient line (BR-002). |
| `RecipeList` | Show and search saved recipes. | recipe list, query | loading, success, empty, error | Empty state says "No recipes yet", never renders as zero. |
| `WeeklyPlanView` | Choose which meals to cook this week. | recipes, current plan | loading, success, empty, error | Adding a planned meal must reference a recipe the account owns. |
| `ShoppingListView` | Generate and show one list; check items off. | weekly plan, shopping list | loading, success, empty, error | Generation failure keeps the plan (REQ-NF-003); empty plan explains itself. |

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

The five states, filled in for `ShoppingListView`:

| State | What the user sees |
|---|---|
| Loading | A spinner while the list is generated; the plan stays visible. |
| Success | One list, every planned ingredient present, each item checkable. |
| **Empty** | "This plan has no meals yet. Add a meal to build a list." — with a link to the plan. |
| **Error** | "We couldn't build your list right now. Please try again." + Retry; the weekly plan is preserved. |
| **Permission denied** | The list of another account is never shown; a deep link returns the safe 404. |

---

## Frontend requirement areas (Ch. 7 §7.4)

| Area | Specify |
|---|---|
| Screens or pages | Sign-in, recipes list, recipe form, weekly plan, shopping list. |
| Components | Navigation, recipe form, recipe list/search, weekly plan, shopping list. |
| Form fields | Recipe title (required), ingredient lines (≥1 required), week start (required). |
| UI states | Loading, empty, error, success, disabled, permission-denied. |
| User actions | Save, search, add meal, generate list, check off item, retry. |
| Accessibility basics | Visible labels (not placeholder-only), keyboard-navigable, errors announced via `aria-describedby`. |

---

> **Security rule (Ch. 27 §27.7):** hiding a button in the frontend is helpful for the user
> interface, but it is **not security by itself**. Enforce permissions on the server.

> Blueprint: blueprints/01-docs/04-technical-spec/frontend-component-spec.md
