# Tools server

Small services the other servers depend on - see [Infrastructure](../../infrastructure/index.md#tools).

Written for Ubuntu 24.04 LTS.

## Server

- 1 vCPU and 2 GB RAM
- at another provider than GitLab, staging and production

> it holds the keys to restore every other server - losing one provider account should not take them too

## Base setup

Set up the VPS as a [new server](../../infrastructure/new-server.md).

## Firewall

Create a cloud firewall named `tools` in the provider panel - by role, not by ports, since the rules change with the server.

### Inbound

<FirewallRules
  direction="inbound"
  :rules="[
    { description: 'SSH', protocol: 'TCP', port: 22 },
    { description: 'Certificate challenge and redirect to HTTPS', protocol: 'TCP', port: 80 },
    { description: 'Services over HTTPS', protocol: 'TCP', port: 443 },
  ]"
/>

### Apply to

- tag `tools`, then put the tag on the VPS - a rebuilt VPS gets the firewall back with the tag

> ports published by Docker bypass `ufw` - Docker writes its own iptables rules, so a closed `ufw` port stays open

## Docker

Follow [Install Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/) - not the `docker.io` package from Ubuntu repositories.

## Compose

All services run as one compose project from [`servers/tools`](https://github.com/tednaaa/homelab/tree/main/servers/tools) in this repository - the root file includes a directory per service.

<<< @/../../servers/tools/compose.yaml

- one default network - Caddy reaches services by container name, services publish no ports
- each service keeps its `compose.yaml` and `data` in its own directory

### Clone

```fish
sudo git clone https://github.com/tednaaa/homelab /opt/homelab
cd /opt/homelab/servers/tools
```

> [!WARNING]
> never run `git clean -x` in `/opt/homelab` - `data` directories are git-ignored and would be deleted with the vault

### Environment

Domains and settings live in `.env`, out of git:

```fish
sudo cp .env.example .env
sudo vim .env
```

> [!IMPORTANT]
> Fill in the variables of every service before the start:
>
> - [Vaultwarden](./vaultwarden.md#environment)

### Start

> [!NOTE]
> start only once `dig` returns the VPS IP for every domain in `.env` - see [Let's Encrypt](../../certificates/lets-encrypt.md)

```fish
sudo docker compose up -d
sudo docker compose logs -f caddy
```

### Update

```fish
cd /opt/homelab
sudo git pull
cd servers/tools
sudo docker compose up -d
sudo docker compose exec -w /etc/caddy caddy caddy reload
```

> `up -d` recreates only containers whose compose config changed - a changed `Caddyfile` needs the reload

## Caddy

One reverse proxy for every service - it owns ports `80` and `443` and gets a Let's Encrypt certificate per domain by itself.

> a Caddy per service would fight over `80` and `443` with the next one

### Add a service

1. add a directory with its `compose.yaml` under `servers/tools` →
2. include it in `servers/tools/compose.yaml` →
3. add its domain block to `caddy/conf/Caddyfile` and pass the domain variable to Caddy →
4. add its variables to `.env.example` and the server's `.env` →
5. list its page in [Environment](#environment) and [Services](#services) →
6. [update](#update) the server

## Services

- [Vaultwarden](./vaultwarden.md)
