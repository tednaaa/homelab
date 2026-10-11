# Infrastructure

Servers are split by failure domain: what goes down together, and what is needed to bring the rest back.

## Servers

### GitLab

- own VPS - see [GitLab](../servers/gitlab/gitlab.md)
- 16 GB RAM and heavy upgrades would starve neighbours
- CI runners execute arbitrary code

### Tools

- [Vaultwarden](../servers/tools/vaultwarden.md), Uptime Kuma and similar small services
- 1 vCPU and 2 GB RAM are enough
- at another provider than GitLab, staging and production

> it holds the keys to restore every other server, and monitors them from outside - it must not fail together with them

### Production

- production applications of every project, several projects share one server

### Staging

- staging applications of every project, several projects share one server
- same setup as production, can be smaller

> staging runs unreviewed branches, load tests and infrastructure upgrades first - none of it may reach production resources, data or secrets

## Where a new service goes

### Production and staging

- a lightweight service that nothing needs in order to recover

### Tools

- needed to restore other servers: secrets, backups, keys
- watches other servers: monitoring, uptime checks, alerts

### Own server

- heavy or spiky on resources
- runs untrusted code

## Exposure

- Vaultwarden - public, it is used from browsers and phones
- Uptime Kuma - behind the firewall, only its status page goes public if needed
