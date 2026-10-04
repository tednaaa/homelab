# GitLab workflow

How a team plans and ships in GitLab Free. Server setup is in [Selfhost GitLab](../selfhosting/gitlab.md).

## Groups

One root group for the company, a subgroup per product, shared code in `platform`.

```
{company_name}
├── platform
│   ├── ui-kit
│   ├── frontend-template
│   ├── k8s
│   └── handbook
└── {product}
    ├── backend
    ├── frontend
    └── support
```

### Root group

Everything planning needs lives here, so every subgroup and project inherits it.

- labels: `type:`, `status:`, `priority:`, `area:`
- milestones as sprints: `Sprint 1`, `Sprint 2` - two weeks, Monday to Sunday, back to back
- one issue board - shows issues from every project below
- `Planner` role for CEO, PM and analysts - they see all products without access to each

### Subgroups

- one per product, not per team - teams change, products stay
- per-product access - a contractor on one product gets only its subgroup
- a project without code for tickets, like `support`, is still a project

### Handbook

The knowledge base lives in `platform/handbook` - group wiki is Premium, a project is free.

- docs as markdown in the repository, built with VitePress, like this site
- changes go through merge requests, so a wrong page gets reviewed like code
- issues link to pages, pages link to issues

## Labels

Labels are not exclusive - one issue can carry two `priority:` labels at once, nothing stops it. Exclusive scoped labels like `priority::high` are Premium.

### Type

- `type: feature`
- `type: bug`

### Status

An open issue without a status is `Open` - not started yet.

- `status: in progress` - developer works in a branch
- `status: blocked` - waits on another issue or a person
- `status: in review` - merge request waits for review
- `status: passed review` - approved, waits for merge
- `status: in staging` - QA tests it
- `status: ready to release` - QA passed, goes out with the next release

### Priority

How soon to work on it, set by PM only when an issue is not ordinary - a bug gets one by how much it hurts.

- `priority: critical` - drop everything, today
- `priority: high` - this sprint
- no label - ordinary, in turn
- `priority: low` - when there is time

### Area

Who does the work - filters a board or a list down to one discipline across all products.

- `area: frontend`
- `area: backend`
- `area: devops`

## Planning

- `Milestone = None` on the root board is the backlog of the whole company
- schedule with a milestone

> estimates need weights, which are Premium - labels like `sp: 3` cannot be summed per sprint

## Views

Saved filters on `Work items` of the root group, one tab each.

- `Shared` visibility lets everyone in the group add the view - nobody gets it automatically
- add with `+ Add view` → pick from the list
- 5 added views per person - pick them by role
- `@me` is dropped on save, so there is no shared "my issues" view - use `Your work` → `Issues`
- `%Started` includes every open milestone that already started - close the sprint milestone when it ends

All views filter `State = Open`.

#### Current sprint

- `Milestone = %Started`

#### Backlog

- `Milestone = None`

#### Unassigned

- `Milestone = %Started`
- `Assignee = None`

#### Not started

- `Milestone = %Started`
- `Label != status: in progress`, `status: blocked`, `status: in review`, `status: passed review`, `status: in staging`, `status: ready to release`

#### In progress

- `Milestone = %Started`
- `Label = status: in progress`

#### Blocked

- `Milestone = %Started`
- `Label = status: blocked`

#### Waiting for review

- `Milestone = %Started`
- `Label = status: in review`

#### Waiting for merge

- `Milestone = %Started`
- `Label = status: passed review`

#### Waiting for QA

- `Milestone = %Started`
- `Label = status: in staging`

#### Ready to release

- `Label = status: ready to release`

#### Next sprint

- `Milestone = %Upcoming`

#### Bugs

- `Label = type: bug`

##### Sets by role:

- PM - current sprint, backlog, unassigned, blocked, ready to release
- developer - current sprint, in progress, blocked, waiting for review, waiting for merge
- QA - current sprint, waiting for QA, bugs

## Links

Filters live in the URL - a bookmark is a view without the 5-view limit. Parameters combine with `&`.

```
https://{gitlab_host}/groups/{company_name}/-/boards/{board_id}
https://{gitlab_host}/groups/{company_name}/-/work_items
```

### Board

- by priority - `?label_name[]=priority%3A%20critical`
- current sprint - `?milestone_title=%23started`
- bugs - `?label_name[]=type%3A%20bug`
- one area - `?label_name[]=area%3A%20frontend`
- one person - `?assignee_username={username}`

### Work items

- current sprint - `?state=opened&milestone_title=%23started`
- backlog - `?state=opened&milestone_title=None`
- next sprint - `?state=opened&milestone_title=%23upcoming`
- one sprint - `?state=opened&milestone_title=Sprint%201`
- unassigned in sprint - `?state=opened&milestone_title=%23started&assignee_id=None`
- not started - `?state=opened&milestone_title=%23started&not[label_name][]=status%3A%20in%20progress&not[label_name][]=status%3A%20blocked&not[label_name][]=status%3A%20in%20review&not[label_name][]=status%3A%20passed%20review&not[label_name][]=status%3A%20in%20staging&not[label_name][]=status%3A%20ready%20to%20release`
- in progress - `?state=opened&milestone_title=%23started&label_name[]=status%3A%20in%20progress`
- blocked - `?state=opened&milestone_title=%23started&label_name[]=status%3A%20blocked`
- waiting for review - `?state=opened&milestone_title=%23started&label_name[]=status%3A%20in%20review`
- waiting for merge - `?state=opened&milestone_title=%23started&label_name[]=status%3A%20passed%20review`
- waiting for QA - `?state=opened&milestone_title=%23started&label_name[]=status%3A%20in%20staging`
- ready to release - `?state=opened&label_name[]=status%3A%20ready%20to%20release`
- bugs - `?state=opened&label_name[]=type%3A%20bug`
- critical bugs - `?state=opened&label_name[]=type%3A%20bug&label_name[]=priority%3A%20critical`
- critical - `?state=opened&label_name[]=priority%3A%20critical`
- one person - `?state=opened&assignee_username[]={username}`

> a bookmark per person replaces the shared "my issues" view that `@me` cannot give

## Flow

Labels do not enforce the order - dragging a card on the board only swaps one label for another.

### QA on staging

QA tests after the merge, on one shared stand.

- `Open` with a milestone - in the sprint →
- `status: in progress` - developer works in a branch →
- `status: in review` - merge request waits for review →
- `status: passed review` - approved, waits for merge →
- merge to `main` - deployed to staging →
- `status: in staging` - QA tests on staging →
- `status: ready to release` - QA passed →
- tag on `main` - released to production, the issue is closed

A bug found on staging sends the issue back to `status: in progress` - the fix is a new merge request.

`status: blocked` replaces the status at any step while the issue waits on something - write on what in a comment and put the previous status back once unblocked.

`Create merge request` puts `Closes #N` into the description, so the issue closes on merge, before QA sees it. Turn it off in every project:

- `Settings` → `Repository` → `Branch defaults` → uncheck `Auto-close referenced issues on default branch`

> a closed issue means released - `status: ready to release` is the list of what the next tag ships

### QA on review apps

Every merge request gets its own temporary stand, QA tests before the merge, `main` holds only tested code.

- `Open` with a milestone - in the sprint →
- `status: in progress` - developer works in a branch →
- `status: in review` - merge request waits for review →
- `status: passed review` - approved →
- `status: in staging` - QA tests the review app of this merge request →
- `status: ready to release` - QA passed →
- merge to `main` - the issue closes by `Closes #N`, the review app is removed →
- tag `1.4.0-rc.1` - deployed to staging, the whole release is accepted →
- tag `1.4.0` - released to production

A bug found on the review app is fixed in the same branch. A regression found on staging is a new merge request and the next `rc` tag.

##### Needs:

- a runner
- a Docker host or k8s cluster for the stands
- wildcard DNS `*.review.example.com` and a wildcard certificate
- a job with `environment: review/$CI_COMMIT_REF_SLUG` and an `on_stop` job in every `.gitlab-ci.yml`

#### Frontend

- a static build - a review app is cheap
- calls the staging backend by default

#### Backend

- needs its own database per merge request - empty with migrations and seeds, or a staging copy
- the most work and cost of the whole setup

> start with review apps for frontends only and test backends on staging
