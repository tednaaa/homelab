# New server

Base setup every VPS gets before its service. Written for Ubuntu 24.04 LTS.

## DNS

Before anything on the VPS, create an `A` record for the service domain pointing to the VPS IP - it propagates while the server is being set up.

> request a certificate only once `dig` returns the new IP - see [Let's Encrypt](../certificates/lets-encrypt.md)

## SSH

[Disable password login](../security/ssh.md).

## System packages

```fish
sudo apt update && sudo apt upgrade -y
sudo apt install fish
```

## Fish

Keep bash as the login shell - `ssh host 'cmd'`, `rsync` and `scp` expect POSIX. Start fish for interactive sessions only:

```fish
printf '\n\n[[ $- == *i* && -z $FISH_STARTED ]] && FISH_STARTED=1 exec fish' >> ~/.bashrc
```

## Provider VPS backups

- one checkbox in the provider panel, usually +20% of the VPS price
- the whole disk restores in minutes
- dies together with the provider account, so every service also needs an off-site backup
