# requirements.md — Requirements Document

> **Purpose (Ch. 4 §4.4):** Lists functional and non-functional requirements.
> **When you use it:** Before product and technical specs.
> **Source:** Ch. 5.

A useful requirement is **clear, testable, bounded, and traceable**.

**Project name:** Pantry

**Problem statement:** *(from [`intent.md`](../01-intent/intent.md))* People who cook at home
keep recipes scattered across screenshots, bookmarks and handwritten cards, which causes them
to forget items on the weekly shop and make a second trip while food goes off. The system
should hold every recipe in one place and turn the meals chosen for a week into a single
shopping list.

**Primary users:**
- The cook — one person, who saves the recipes, plans the week, and does the shopping.

There is no second role. The permission model chosen in Round 3 is **single user, no
sharing**, and that is recorded as a decision rather than as a stage the product has not
reached yet.

---

## 1. Functional requirements

Format: `REQ-F-###: [Actor] must be able to [action] [object] so that [outcome].`

| ID | Requirement | Priority |
|---|---|---|
| REQ-F-001 | A cook must be able to save a recipe with a name and a list of ingredient lines, so that it can be found again and used in a plan. | Must |
| REQ-F-002 | A cook must be able to search their saved recipes by recipe title and by ingredient name, so that a recipe is found without hunting through six places. | Must |
| REQ-F-003 | A cook must be able to create a weekly plan covering seven consecutive days from a chosen start date, so that a week's meals are decided in one place. | Must |
| REQ-F-004 | A cook must be able to place a saved recipe on a day of a weekly plan, and the same recipe may appear on more than one day, so that a repeated meal is expressed rather than duplicated. | Must |
| REQ-F-005 | A cook must be able to generate a shopping list from a weekly plan, in which identical ingredients across that week's recipes are combined into one line with quantities summed per unit, so that the week's shopping is one trip. | Must |
| REQ-F-006 | [TODO: does version one need to edit and delete a saved recipe, or only add one?] | Undecided |

**REQ-F-005 is the core requirement.** It is the one the subdomain map classifies as core, and
it is the only one on this list a competitor would find hard to copy — see
[`subdomain-map.md`](../01-intent/subdomain-map.md).

**REQ-F-006 is deliberately not written as a requirement.** "Save a recipe" was the answer;
whether that includes changing one afterwards was not asked, and it is a separate capability
with its own screens, rules, and failure cases. Assuming it in would be a requirement the
developer never made.

| Element | Question to ask | Example |
|---|---|---|
| Actor | Who performs the action? | The cook |
| Action | What must they do? | Place a recipe on a day |
| Object | What is being acted on? | A weekly plan |
| Result | What should happen after the action? | That day's meal is set, and the shopping list will include its ingredients |

---

## 2. Non-functional requirements

Format: `REQ-NF-###: [Quality condition with a measurable limit].`

> **Six of these seven are marked, not written.** The quality attributes and their measurable
> limits are Round 4's question, and a non-functional requirement without a limit is not a
> requirement — it is an adjective. They are one question,
> [`Q-012`](../01-intent/open-questions.md), and answering it fills the table in one pass.

| ID | Category | Requirement |
|---|---|---|
| REQ-NF-001 | Performance | [TODO: which quality attributes matter most, and what measurable limit does each have?] |
| REQ-NF-002 | Security | No account may read, change, or delete another account's recipes, plans, or shopping lists. Every stored record belongs to exactly one account, and every read is scoped to the signed-in account. |
| REQ-NF-003 | Reliability | [TODO: which quality attributes matter most, and what measurable limit does each have?] |
| REQ-NF-004 | Usability | [TODO: which quality attributes matter most, and what measurable limit does each have?] |
| REQ-NF-005 | Maintainability | [TODO: which quality attributes matter most, and what measurable limit does each have?] |
| REQ-NF-006 | Accessibility | [TODO: which quality attributes matter most, and what measurable limit does each have?] |
| REQ-NF-007 | Privacy | [TODO: which quality attributes matter most, and what measurable limit does each have?] |

**Why REQ-NF-002 is written and the rest are not.** It is not a guess: it follows from the
permission model the cook actually chose. *Single user, no sharing* means there is no path by
which one account reaches another's data, and stating that is repeating their answer rather
than inventing one. The other six would be invented.

**Examples (Ch. 5 §5.3)**

| Category | Requirement example |
|---|---|
| Performance | The dashboard must load within three seconds for a workspace with up to 1,000 tasks. |
| Security | Only authenticated users may access workspace data. |
| Reliability | If task creation fails, the system must show an error and preserve the user's input. |
| Usability | A new user must be able to create their first task without reading a separate manual. |
| Maintainability | Task-related logic must be separated from user-authentication logic. |

> **Do not write impossible quality claims.** Avoid "the app must never fail" or "the
> system must always be fast." Replace them with measurable expectations, known limits,
> and graceful failure behavior.

---

## 3. User roles and permissions

Format: `REQ-R-###`. Define these **before** design begins, or the agent may build
features that expose data to the wrong users.

| Role | Can do | Cannot do |
|---|---|---|
| Cook | Save, search, plan with, and generate shopping lists from their own recipes. Sign in and sign out. | See, change, or delete any record belonging to another account. Share a recipe or a plan with anyone. Grant anyone access to their data. |

**One role is a decision, not an omission.** *Owner / Admin / Member / Viewer* was offered and
declined: nothing in this product is shared, so a second role would be a permission system
guarding a boundary that does not exist. It is easier to add a role than to remove one, and
adding one later is a change to the data model rather than to the wording here.

| ID | Role requirement |
|---|---|
| REQ-R-001 | The system must support exactly one role, the cook, who owns every record they create. |
| REQ-R-002 | A cook must not be able to read, change, or delete a record owned by another account, through any route — including a direct link, a guessed identifier, or an exported file. |
| REQ-R-003 | A signed-out visitor must not be able to read any recipe, plan, or shopping list. |

**REQ-R-002 and REQ-R-003 are denials, and they are the testable half.** A test proving the
cook can read their own recipes passes identically on a system with no access control at all.

Full permission matrix and enforcement rules → [`technical-spec.md` §7 Security](../04-technical-spec/technical-spec.md#7-security-requirements)

---

## 4. Business rules

Policy decisions the software must enforce. Write them **separately from code
instructions** — when the rule changes you update the spec first, then the tests and code.

| ID | Rule | Why it matters |
|---|---|---|
| BR-001 | Identical ingredients across a week's chosen recipes combine into one shopping-list line, with quantities summed within a unit. | This is the product. A list that repeats "onion" four times is the pile of screenshots with extra steps. |
| BR-002 | Quantities in different units for the same ingredient are listed separately rather than converted. | A wrong conversion is worse than two lines: the cook can add two lines in their head and cannot detect a silent unit error at the shop. |
| BR-003 | A weekly plan covers seven consecutive days from its start date. A day holds zero or more meals, and the same recipe may appear on more than one day. | Without it, "a week" is three different things to three developers, and the shopping list is wrong in a way nobody can see. |
| BR-004 | Deleting a recipe that appears in a weekly plan is blocked while that plan exists. | Otherwise a plan silently loses a meal and its shopping list silently loses ingredients — a data loss the cook discovers in the shop. |
| BR-005 | A shopping list is generated from a plan at a point in time and does not change when the plan changes afterwards. | A list that rewrites itself while the cook is shopping is worse than no list. Regenerating is the cook's decision. |

**BR-004 and BR-005 were not asked about.** They are consequences of BR-001 and REQ-F-005 that
have to be decided by someone, and they are written here as proposals for the Round 3 gate to
accept or change — not as facts. Each has an alternative worth naming: BR-004 could soft-delete
instead of blocking, and BR-005 could regenerate on every view.

---

## 5. System constraints

Maintained in [`intent.md` §3](../01-intent/intent.md#3-constraints). Referenced here as `CON-###`.

**The constraints are defined once, in
[`constraints-and-non-goals.md`](../01-intent/constraints-and-non-goals.md), and referenced
here.** Repeating a definition in two documents is how the two come to disagree, and both then
look authoritative.

| Affected requirements | Waiting on | What changes when it is answered |
|---|---|---|
| REQ-NF-002, REQ-NF-007 | `CON-003` — what data may not be stored | Whether recipe text and shopping habits count as personal data, and what that adds to storage and deletion. |
| REQ-R-001 | `CON-006` — budget | Whether sign-in is bought from an identity provider or built. The subdomain map holds this row open for the same reason. |

That table is itself marked rather than filled, so these rows record which requirements are
waiting on it rather than pretending the constraints are known.

---

## 6. Acceptance criteria

Format: Given–When–Then. These become the acceptance tests in
[`../tests/acceptance-tests.md`](../../03-tests/02-functional/acceptance-tests.md).

| ID | Requirement | Criterion |
|---|---|---|
| AC-001 | REQ-F-001 | **Given** a signed-in cook, **When** they save a recipe with a name and two ingredient lines, **Then** the recipe is stored against their account and appears in their recipe list. |
| AC-002 | REQ-F-002 | **Given** a cook with a saved recipe containing "chickpeas", **When** they search for "chickpeas", **Then** that recipe is returned even though the word is not in its title. |
| AC-003 | REQ-F-005 | **Given** a plan whose week contains two recipes each needing 1 onion, **When** the cook generates the shopping list, **Then** the list contains one line reading 2 onions. |
| AC-004 | REQ-F-005 | **Given** a plan containing one recipe needing 200 g of flour and another needing 2 cups of flour, **When** the cook generates the shopping list, **Then** flour appears as two lines and neither quantity has been converted. |
| AC-005 | REQ-R-002 | **Given** a signed-in cook and a recipe identifier belonging to another account, **When** they request that recipe directly, **Then** the system responds as though it does not exist and no part of it is returned. |
| AC-006 | REQ-R-003 | **Given** a signed-out visitor, **When** they request any recipe, plan, or shopping list, **Then** access is refused and no content is returned. |
| AC-007 | BR-004 | **Given** a recipe that appears on a day of an existing plan, **When** the cook deletes that recipe, **Then** the deletion is refused and the plan naming it is identified. |

**AC-004, AC-005, AC-006 and AC-007 are the failure paths**, and they outnumber the happy
paths deliberately. Every one of them is a case where the obvious implementation does the wrong
thing quietly.

---

## 7. Open questions

→ [`open-questions.md`](../01-intent/open-questions.md)

---

## Requirement quality checklist (Ch. 5)

| Check | Question | ✔ |
|---|---|---|
| Clear | Can you understand the requirement without guessing? | [x] |
| Actor defined | Does it say who performs the action? | [x] |
| Action defined | Does it say exactly what must happen? | [x] |
| Bounded | Does it avoid hidden extra features? | [x] |
| Testable | Can you prove whether it works? | [x] |
| Traceable | Can it become a task, test, and code change later? | [x] |
| No implementation leak | Does it avoid technical decisions that belong in the technical spec? | [x] |

> **The safest habit:** before you send requirements to an AI agent, read each one and ask
> "could two people interpret this differently?" If yes, rewrite it.

---

## Common requirement mistakes (Ch. 5 §5.8)

| Mistake | Weak example | Better approach |
|---|---|---|
| Vague wording | "The dashboard should be nice." | State what the dashboard must show and how users will use it. |
| No actor | "Tasks can be deleted." | Say which role can delete tasks and under what condition. |
| No boundary | "Users can manage projects." | List the allowed project actions for each role. |
| No acceptance criteria | "Users can reset passwords." | Add the expected email flow, token expiry, and failure behavior. |
| Implementation hidden in requirement | "Use a modal with React state." | Describe behavior first; save implementation details for the technical spec. |

---

## Writing workflow (Ch. 5)

1. Start with the problem statement from the Engineering Intent Document.
2. List the primary user roles before listing features.
3. Write functional requirements using actor, action, object, and outcome.
4. Add non-functional requirements that define quality expectations.
5. Write business rules separately from implementation choices.
6. List constraints so the AI assistant does not invent unrealistic solutions.
7. Add acceptance criteria for every important requirement.
8. Review the document for ambiguity before moving to the PRD.

---

**Next:** [`product-spec.md`](../03-product-spec/product-spec.md)

> Blueprint: blueprints/01-docs/02-requirements/requirements.md
