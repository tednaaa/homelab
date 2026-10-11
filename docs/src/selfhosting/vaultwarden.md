# Vaultwarden

[Vaultwarden](https://github.com/dani-garcia/vaultwarden) is a lightweight Bitwarden-compatible server - team passwords and files like `gitlab-secrets.json`.

- ~50 MB RAM instead of ~2 GB for the official Bitwarden server
- attachments, organizations and collections are free
- works with the official Bitwarden apps and browser extensions

Written for Ubuntu 24.04 LTS.

## Server

Deploy it on the tools server - see [Infrastructure](../infrastructure/index.md).

- 1 vCPU and 2 GB RAM
- at another provider than GitLab, staging and production

> it holds the keys to restore every other server - losing one provider account should not take them too

## Install

### Base setup

Set up the VPS as a [new server](../infrastructure/new-server.md).

### Docker

Follow [Install Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/) - not the `docker.io` package from Ubuntu repositories.

### Vaultwarden

Bitwarden clients need HTTPS - the web vault refuses to work over plain HTTP. Caddy gets and renews the Let's Encrypt certificate by itself.

```fish
sudo mkdir -p /opt/vaultwarden
cd /opt/vaultwarden
sudo vim compose.yml
```

Pin the latest version from [releases](https://github.com/dani-garcia/vaultwarden/releases) - `latest` upgrades on every `pull` without a backup first.

```yaml
services:
  vaultwarden:
    image: vaultwarden/server:<version>
    container_name: vaultwarden
    restart: unless-stopped
    environment:
      DOMAIN: https://vault.example.com
      SIGNUPS_ALLOWED: "true"
    volumes:
      - ./data:/data

  caddy:
    image: caddy:2
    container_name: caddy
    restart: unless-stopped
    ports:
      - 80:80
      - 443:443
      - 443:443/udp
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - ./caddy-data:/data
      - ./caddy-config:/config
```

```fish
sudo vim Caddyfile
```

```
vault.example.com {
  encode zstd gzip
  reverse_proxy vaultwarden:80 {
    header_up X-Real-IP {remote_host}
  }
}
```

> [!NOTE]
> start only once `dig` returns the VPS IP - see [Let's Encrypt](../certificates/lets-encrypt.md)

```fish
sudo docker compose up -d
sudo docker compose logs -f caddy
```

## Configure

### Owner account

Open the domain, create your account and enable two-step login in `Settings` → `Security` → `Two-step login`.

### Sign-ups

Until disabled, anyone on the internet can register. Set in `compose.yml`:

```yaml
SIGNUPS_ALLOWED: "false"
```

```fish
sudo docker compose up -d
```

Invite the team from an organization: `New organization` → `Members` → `Invite member`.

> without SMTP no invitation email is sent - the invited user registers on the domain with the invited email themselves

### Admin page

Disabled while `ADMIN_TOKEN` is unset - leave it so unless SMTP or user management is needed.

To enable, hash a token:

```fish
sudo docker exec -it vaultwarden /vaultwarden hash
```

Every `$` in the hash doubles in `compose.yml`, otherwise compose reads it as a variable:

```yaml
ADMIN_TOKEN: $$argon2id$$v=19$$m=65540,t=3,p=4$$...
```

## Upgrade

Back up first, then change the tag in `compose.yml`:

```fish
sudo docker exec vaultwarden /vaultwarden backup
sudo docker compose pull
sudo docker compose up -d
```

## Backup

On top of [provider VPS backups](../infrastructure/new-server.md#provider-vps-backups).

### Off-site

Everything lives in `/opt/vaultwarden/data`:

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
