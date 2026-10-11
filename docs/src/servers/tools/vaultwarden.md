# Vaultwarden

[Vaultwarden](https://github.com/dani-garcia/vaultwarden) is a lightweight Bitwarden-compatible server - team passwords and files like `gitlab-secrets.json`.

- ~50 MB RAM instead of ~2 GB for the official Bitwarden server
- attachments, organizations and collections are free
- works with the official Bitwarden apps and browser extensions

Runs on the [tools server](./index.md) - set it up first.

## Install

Part of the tools server [compose project](./index.md#compose) - starts with it, behind [Caddy](./index.md#caddy) for HTTPS. Bitwarden clients refuse plain HTTP.

### Environment

In the tools server [`.env`](./index.md#environment):

```ini
VAULTWARDEN_DOMAIN=vault.example.com
VAULTWARDEN_SIGNUPS_ALLOWED=true
```

> the domain goes without `https://`, sign-ups stay `true` only until the [owner account](#owner-account) exists

## Configure

All commands run in `/opt/homelab/servers/tools`.

### Owner account

Open the domain, create your account and enable two-step login in `Settings` → `Security` → `Two-step login`.

### Sign-ups

Until disabled, anyone on the internet can register. Set in `.env`:

```ini
VAULTWARDEN_SIGNUPS_ALLOWED=false
```

```fish
sudo docker compose up -d
```

Invite the team from an organization: `New organization` → `Members` → `Invite member`.

> without SMTP no invitation email is sent - the invited user registers on the domain with the invited email themselves

## Organize

Keep team secrets in the organization, not in `My vault` - they stay when a member leaves.

### Collections

One collection per server or service: `Admin Console` → `Collections` → `New collection`. Give access only to the people who run it.

| Collection | Items |
| --- | --- |
| `gitlab` | `root` login, `gitlab-secrets.json`, `gitlab.rb` |
| `vault` | admin page password and hash, off-site backup credentials |
| `grafana` | `admin` login, alert notification tokens |

Delete `Default collection`

> it's preselected in every new item, so everything lands there and it turns into a dump

### Files

Files like `gitlab-secrets.json` go into a `Secure note` with an empty body:

1. `New` → `Secure note`, pick the collection and save →
2. open the note → `Attachments` → upload the file

> the create dialog has no attachments - they appear only on a saved item. Notes text is capped at 10 000 characters, a file isn't

## Upgrade

Bump the tag in `servers/tools/vaultwarden/compose.yaml` - take the latest from [releases](https://github.com/dani-garcia/vaultwarden/releases). Back up before the [update](./index.md#update):

```fish
sudo docker exec vaultwarden /vaultwarden backup
```

> tags are pinned - `latest` would upgrade on any `pull`, without a backup first

## Backup

On top of [provider VPS backups](../../infrastructure/new-server.md#provider-vps-backups).

### Off-site

Everything lives in `/opt/homelab/servers/tools/vaultwarden/data`:

- `db.sqlite3` - the vault itself
- `attachments` and `sends` - files
- `rsa_key*` - token signing keys, without them every client is logged out
- `config.json` - admin page settings, exists only once the admin page was used

`cp` of a live `db.sqlite3` can catch it mid-write. `/vaultwarden backup` writes a consistent copy next to it as `db_<date>.sqlite3`:

```fish
sudo docker exec vaultwarden /vaultwarden backup
```

Copy the whole `data` directory to S3 at another provider on a schedule.

> the off-site storage credentials and the backup encryption password must not live only in this Vaultwarden - keep a printed copy or a second password manager

### Export

Once in a while export the vault from a client: `Tools` → `Export vault` → `.json (Encrypted)`. It restores into any Bitwarden-compatible server, not only this one.

## Admin page

Optional. The server's own `/admin` page, not the organization `Admin Console` - users, organizations, SMTP and diagnostics. Disabled while `ADMIN_TOKEN` is unset.

All commands run in `/opt/homelab/servers/tools`.

### Enable

1. generate a password in Vaultwarden `Generator` and save it as its own item →
2. hash it and save the hash in the same item →

   ```fish
   sudo docker exec -it vaultwarden /vaultwarden hash
   ```

3. put the hash in `/opt/homelab/servers/tools/vaultwarden/admin.env` →

   ```ini
   ADMIN_TOKEN='$argon2id$v=19$m=65540,t=3,p=4$...'
   ```

   > single quotes keep compose from reading every `$` as a variable

4. restart and log in to `/admin` with the password, not the hash

   ```fish
   sudo docker compose up -d
   ```

> [!WARNING]
> settings saved on the admin page go to `data/config.json` and override the environment - keep each setting either in `.env` or on the admin page, not both

### Disable

Comment out the token - the hash stays in the file for later:

```fish
sudo sed -i 's/^ADMIN_TOKEN/#ADMIN_TOKEN/' vaultwarden/admin.env
sudo docker compose up -d
```

To enable again:

```fish
sudo sed -i 's/^#ADMIN_TOKEN/ADMIN_TOKEN/' vaultwarden/admin.env
sudo docker compose up -d
```
