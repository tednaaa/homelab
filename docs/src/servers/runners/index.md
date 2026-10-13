# Runners server

GitLab CI jobs run on their own VPS, not on the GitLab server - see [Infrastructure](../../infrastructure/index.md#runners).

Written for Ubuntu 24.04 LTS.

## Server

- 4 vCPU - 3 jobs at once, each compiles and pulls images in parallel
- 8 GB RAM - ~2.5 GB per job plus Docker and the runner
- 100 GB SSD - images, caches and volumes of 3 jobs, GitLab gives each hosted job 30 GB

> GitLab's default [hosted runner](https://docs.gitlab.com/ci/runners/hosted_runners/linux/) gives one job 2 vCPU and 8 GB - move to 16 GB RAM once jobs start failing out of memory

> jobs run arbitrary code - next to GitLab they would share its 16 GB and reach `gitlab-secrets.json`

## Base setup

Set up the VPS as a [new server](../../infrastructure/new-server.md).

> the runner has no domain - skip the DNS record

## Firewall

Create a cloud firewall named `runners` in the provider panel - by role, not by ports, since the rules change with the server.

### Inbound

<FirewallRules
  direction="inbound"
  :rules="[
    { description: 'SSH', protocol: 'TCP', port: 22 },
  ]"
/>

> the runner polls GitLab over HTTPS for jobs - it only connects out, nothing connects in

### Apply to

- tag `runners`, then put the tag on the VPS - a rebuilt VPS gets the firewall back with the tag

## Docker

Follow [Install Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/) - not the `docker.io` package from Ubuntu repositories.

## GitLab Runner

Follow [Install GitLab Runner using the official GitLab repositories](https://docs.gitlab.com/runner/install/linux-repository/):

```fish
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" -o script.deb.sh
sudo bash script.deb.sh
sudo apt install gitlab-runner
```

## Register

One instance runner serves every project, see [Instance runners](https://docs.gitlab.com/ci/runners/runners_scope/#create-an-instance-runner-with-a-runner-authentication-token).

- `Admin` →
- `CI/CD` →
- `Runners` →
- `Create instance runner` →
- `Linux`, check `Run untagged` →
- `Create runner`

The next page shows the `glrt-` token only until registration - [register](https://docs.gitlab.com/runner/register/) with the Docker executor right away:

```fish
sudo gitlab-runner register --non-interactive --url https://<gitlab_host> --token <glrt_token> --executor docker --docker-image alpine:latest
```

## Concurrent jobs

One runner process runs 3 jobs at once - [`concurrent`](https://docs.gitlab.com/runner/configuration/advanced-configuration/#the-global-section) caps jobs across the whole server.

```fish
sudo vim /etc/gitlab-runner/config.toml
```

```toml
concurrent = 3
```

> the runner reloads `config.toml` every 3 seconds - no restart

## Docker builds

`docker build` inside a job needs [Docker-in-Docker](https://docs.gitlab.com/ci/docker/using_docker_build/#use-docker-in-docker) with `privileged = true` under `[runners.docker]`, or [socket binding](https://docs.gitlab.com/ci/docker/using_docker_build/#use-docker-socket-binding).

> [!WARNING]
> both give a job root on the VPS - one more reason it holds no secrets but the runner token

## Docker cache

Job containers and volumes stay on disk until the disk is full. Run [`clear-docker-cache`](https://docs.gitlab.com/runner/executors/docker/#clear-the-docker-cache) from the runner package once a week:

```fish
echo '0 4 * * 0 root /usr/share/gitlab-runner/clear-docker-cache' | sudo tee /etc/cron.d/clear-docker-cache
```

> it keeps images - pulled job images are removed only by `docker system prune`
