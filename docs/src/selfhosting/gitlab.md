# Selfhost GitLab

Written for Ubuntu 24.04 LTS.

## Server

Deploy GitLab on its own VPS, not next to production apps - its upgrades and memory spikes should not take production down, and CI runners execute arbitrary code.

> Baseline from [installation requirements](https://docs.gitlab.com/install/requirements/):

- 8 vCPU
- 16 GB RAM
- ~40 GB for the application, plus repositories and 5-12 GB for PostgreSQL

> Handles ~1000 users, per the [1K reference architecture](https://docs.gitlab.com/administration/reference_architectures/1k_users/) peak load:

- API: 20 RPS
- Web: 2 RPS
- Git pull: 2 RPS
- Git push: 1 RPS

## Install

### DNS

Before anything on the VPS, create an `A` record for the GitLab domain pointing to the VPS IP

### SSH

git over SSH goes through the host's `sshd`, so keep it on port 22 and [disable password login](../security/ssh.md) instead of moving the port.

### System packages

```fish
sudo apt update && sudo apt upgrade -y
sudo apt install fish
```

### Fish

Keep bash as the login shell - `ssh host 'cmd'`, `rsync` and `scp` expect POSIX. Start fish for interactive sessions only:

```fish
printf '\n\n[[ $- == *i* && -z $FISH_STARTED ]] && FISH_STARTED=1 exec fish' >> ~/.bashrc
```

### GitLab

Follow the [Linux package for Ubuntu](https://docs.gitlab.com/install/package/ubuntu/) guide and pick the `Enterprise Edition` tab.

- without a license it runs as Free
- Premium later is just a license key, no package switch

> [!NOTE]
> if you get cert issues refer to [Let's Encrypt](../certificates/lets-encrypt.md)

Then make sure `/etc/gitlab/gitlab.rb` has both - a failed first install leaves a self-signed cert and stops requesting a real one:

```ruby
letsencrypt['enable'] = true
gitlab_rails['nginx']['redirect_http_to_https'] = true
```

And finish the failed install, then replace the self-signed cert:

```fish
sudo dpkg --configure -a
sudo gitlab-ctl renew-le-certs
```

### Root password

Replace the generated one from `/etc/gitlab/initial_root_password`:

```fish
sudo gitlab-rake "gitlab:password:reset[root]"
```

### Hold the package

A plain `apt upgrade` jumps to the latest GitLab and skips required upgrade stops.

```fish
sudo apt-mark hold gitlab-ee
```

### Save secrets

GitLab backups do not include `/etc/gitlab/gitlab-secrets.json` - without it a restore loses CI variables, tokens and 2FA. Save it to a password manager, for example [Vaultwarden](./vaultwarden.md).

```fish
sudo cat /etc/gitlab/gitlab-secrets.json
```

## Configure

### Sign-ups

Until disabled, anyone on the internet can register.

- `Admin` → `Settings` → `General` → `Sign-up restrictions`

### Auto DevOps

Every project without `.gitlab-ci.yml` gets a generated pipeline that hangs as `stuck` without runners.

- `Admin` → `Settings` → `CI/CD` → `Continuous Integration and Deployment` → uncheck `Default to Auto DevOps pipeline for all projects`

### Service Ping

[Usage statistics](https://docs.gitlab.com/administration/settings/usage_statistics/) are sent to GitLab by default.

```fish
sudo vim /etc/gitlab/gitlab.rb
```

```ruby
gitlab_rails['usage_ping_enabled'] = false
```

```fish
sudo gitlab-ctl reconfigure
```

## Upgrade

### Route

Required stops are `x.2`, `x.5`, `x.8` and `x.11` of every major. Get the exact route from the [Upgrade Path tool](https://gitlab-com.gitlab.io/support/toolbox/upgrade-path/).

> upgrading monthly rarely crosses more than one stop, a year behind is 5-6 stops

### Snapshot

Snapshot the VPS first - database migrations do not roll back.

### Each stop

Take the latest patch of the stop - `apt` needs the full version string, `gitlab-ee=19.2` is not found.

```fish
apt-cache madison gitlab-ee | grep ' 19.2.'
```

```fish
sudo apt-mark unhold gitlab-ee
sudo apt install gitlab-ee=19.2.3-ee.0
sudo apt-mark hold gitlab-ee
```

Wait until `Admin` → `Monitoring` → `Background migrations` is empty before the next stop.

### Save secrets again

New versions add keys to `/etc/gitlab/gitlab-secrets.json` - save it to the password manager after the last stop.

## Backup

Two layers, both nearly zero effort.

### Provider VPS backups

- one checkbox in the provider panel, usually +20% of the VPS price
- the whole disk, including `/etc/gitlab`, restores in minutes
- dies together with the provider account

### S3

GitLab uploads its backup to S3 at another provider by itself, see [Upload backups to a remote storage](https://docs.gitlab.com/administration/backup_restore/backup_gitlab/#upload-backups-to-a-remote-cloud-storage).

```fish
sudo vim /etc/gitlab/gitlab.rb
```

```ruby
gitlab_rails['backup_upload_connection'] = {
  'provider' => 'AWS',
  'region' => '<region>',
  'aws_access_key_id' => '<access_key>',
  'aws_secret_access_key' => '<secret_key>',
  'endpoint' => 'https://<s3_endpoint>',
  'path_style' => true
}
gitlab_rails['backup_upload_remote_directory'] = '<bucket>'
gitlab_rails['backup_keep_time'] = 604800
```

```fish
sudo gitlab-ctl reconfigure
sudo crontab -e
```

```
0 2 * * * /opt/gitlab/bin/gitlab-backup create CRON=1
```

- drop `endpoint` and `path_style` for AWS S3 itself
- `backup_keep_time` prunes local archives only - set a lifecycle rule on the bucket for remote retention

## Premium and Ultimate

What Free lacks, most critical first. Premium is $29 per user per month, Ultimate is priced on request. Both are a license key on the same `gitlab-ee` package.

### Critical

#### Required merge request approvals

- Premium
- in Free an approve is a note - anyone with merge rights merges without it

#### Reset approvals on push

- Premium
- in Free an approve survives new commits, so reviewed code is not the merged code

#### Code owners approval

- Premium
- `CODEOWNERS` paths need approval from their owners before merge

#### Multiple assignees

- Premium
- developer and QA on one issue at the same time instead of handing it back and forth

#### Status field

- Premium
- one exclusive status per issue, configured once on the root group - replaces `status:` labels

#### Scoped labels

- Premium
- `priority::high` replaces `priority::low` automatically - no issue with two priorities

#### Blocking issues

- Premium
- `blocks` and `is blocked by` links, Free has only `relates to`

#### Weights

- Premium
- story points that are summed per board list and per milestone

#### Burndown and burnup charts

- Premium
- sprint progress by issues and by weight

#### Iterations

- Premium
- sprints that open and roll over by a cadence instead of hand-made milestones

### Important

#### Epics

- Premium
- a feature spanning backend and frontend projects as one parent item

#### Roadmap

- Premium
- epics and milestones on a timeline - replaces a Gantt chart

#### Custom fields

- Premium
- component, environment, client - typed fields instead of more labels

#### Multiple group boards

- Premium
- Free allows one board per group, enough for one team only

#### Board lists by assignee, milestone, iteration

- Premium
- Free builds board lists from labels only

#### Group wiki

- Premium
- one wiki for the whole company, Free has project wikis only

#### Group description templates

- Premium
- one bug report template for every project instead of a copy per repository

#### Push rules

- Premium
- reject commits by message format, author email, file size or secrets

#### Protected environments

- Premium
- only chosen people deploy to production

#### Deployment approvals

- Premium
- a production deploy waits for a named approver

#### Merge trains

- Premium
- merge requests are tested in queue against each other, `main` stays green under many merges

#### Merged results pipelines

- Premium
- the pipeline runs on the merge result, not on a stale branch

#### Audit events

- Premium
- who changed permissions, protected branches, settings

#### LDAP group sync

- Premium
- group membership follows the company directory

#### Pull mirroring

- Premium
- a repository from another host stays in sync automatically, push mirroring is free

### Nice to have

#### Value stream analytics on groups

- Premium
- lead and cycle time across all products, Free shows one project

#### Contribution analytics

- Premium
- pushes, merge requests and issues per person per period

#### Productivity analytics

- Premium
- time to merge per merge request size and author

#### Epic boards

- Premium
- epics moved across columns like issues

#### Geo

- Premium
- a read-only replica in another region, promoted when the primary dies

#### Support

- Premium
- tickets to GitLab support with a response deadline

### Ultimate only

#### Security scanning and dashboard

- Ultimate
- dependency, container and DAST scanning, vulnerabilities tracked per project

#### Security policies

- Ultimate
- scans enforced on every pipeline by the group, not by each `.gitlab-ci.yml`

#### Health status

- Ultimate
- `on track`, `needs attention`, `at risk` on issues and epics

#### Multi-level epics

- Ultimate
- epics inside epics for quarter and year goals

#### DORA metrics

- Ultimate
- deployment frequency, lead time, change failure rate, time to restore

#### Insights

- Ultimate
- custom charts over issues and merge requests

#### Requirements and test cases

- Ultimate
- requirements and manual test cases tracked next to issues

#### Free guests

- Ultimate
- `Guest` users do not take a paid seat
